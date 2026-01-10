'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Globe, FileText, Loader2, Upload, File, X } from 'lucide-react';
import { addUrlSource, addTextSource } from '@/actions/data-source-actions';
import { toast } from 'sonner';

export function AddSourceDialog({ chatbotId }: { chatbotId: string }) {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<'url' | 'text' | 'file' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [url, setUrl] = useState('');
    const [textTitle, setTextTitle] = useState('');
    const [textContent, setTextContent] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                toast.error('Please select a PDF file');
                return;
            }
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                toast.error('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                toast.error('Please drop a PDF file');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast.error('File size must be less than 10MB');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            if (type === 'url') {
                if (!url) return;
                await addUrlSource(chatbotId, url);
                toast.success('Website source added and processing started');
            } else if (type === 'text') {
                if (!textTitle || !textContent) return;
                await addTextSource(chatbotId, textTitle, textContent);
                toast.success('Text source added and processed');
            } else if (type === 'file') {
                if (!selectedFile) return;

                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('chatbotId', chatbotId);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Upload failed');
                }

                toast.success('PDF uploaded and processing started');
            }
            setOpen(false);
            resetForm();
            router.refresh();
        } catch (error) {
            toast.error('Failed to add source');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setType(null);
        setUrl('');
        setTextTitle('');
        setTextContent('');
        setSelectedFile(null);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Add Source</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Knowledge Source</DialogTitle>
                    <DialogDescription>
                        Train your chatbot with new content.
                    </DialogDescription>
                </DialogHeader>

                {!type ? (
                    <div className="grid grid-cols-3 gap-4 py-4">
                        <button
                            onClick={() => setType('url')}
                            className="flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-lg hover:bg-muted hover:border-primary transition-colors"
                        >
                            <Globe className="w-8 h-8 text-primary" />
                            <span className="font-medium text-sm">Website</span>
                        </button>
                        <button
                            onClick={() => setType('text')}
                            className="flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-lg hover:bg-muted hover:border-primary transition-colors"
                        >
                            <FileText className="w-8 h-8 text-primary" />
                            <span className="font-medium text-sm">Text</span>
                        </button>
                        <button
                            onClick={() => setType('file')}
                            className="flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-lg hover:bg-muted hover:border-primary transition-colors"
                        >
                            <Upload className="w-8 h-8 text-primary" />
                            <span className="font-medium text-sm">PDF</span>
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        {type === 'url' ? (
                            <div className="space-y-2">
                                <Label>Website URL</Label>
                                <Input
                                    placeholder="https://example.com"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                                <p className="text-sm text-muted-foreground">
                                    We will crawl the content of this page.
                                </p>
                            </div>
                        ) : type === 'text' ? (
                            <>
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                        placeholder="e.g. Return Policy"
                                        value={textTitle}
                                        onChange={(e) => setTextTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Content</Label>
                                    <Textarea
                                        placeholder="Paste your text here..."
                                        className="h-[200px]"
                                        value={textContent}
                                        onChange={(e) => setTextContent(e.target.value)}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2">
                                <Label>Upload PDF</Label>
                                <div
                                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${selectedFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-primary'
                                        }`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                    {selectedFile ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <File className="w-8 h-8 text-green-600" />
                                            <div className="text-left">
                                                <p className="font-medium text-sm">{selectedFile.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedFile(null);
                                                }}
                                                className="ml-2 p-1 hover:bg-gray-200 rounded"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">
                                                Click or drag to upload PDF
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Max file size: 10MB
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter>
                    {type && (
                        <Button variant="ghost" onClick={() => setType(null)} className="mr-auto">Back</Button>
                    )}
                    {type && (
                        <Button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {type === 'url' ? 'Add URL' : type === 'text' ? 'Add Text' : 'Upload PDF'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
