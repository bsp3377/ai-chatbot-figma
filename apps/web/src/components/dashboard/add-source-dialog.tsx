'use client';

import { useState } from 'react';
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
import { Globe, FileText, Loader2 } from 'lucide-react';
import { addUrlSource, addTextSource } from '@/actions/data-source-actions';
import { toast } from 'sonner';

export function AddSourceDialog({ chatbotId }: { chatbotId: string }) {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<'url' | 'text' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const [url, setUrl] = useState('');
    const [textTitle, setTextTitle] = useState('');
    const [textContent, setTextContent] = useState('');

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
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <button
                            onClick={() => setType('url')}
                            className="flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-lg hover:bg-muted hover:border-primary transition-colors"
                        >
                            <Globe className="w-8 h-8 text-primary" />
                            <span className="font-medium">Website URL</span>
                        </button>
                        <button
                            onClick={() => setType('text')}
                            className="flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-lg hover:bg-muted hover:border-primary transition-colors"
                        >
                            <FileText className="w-8 h-8 text-primary" />
                            <span className="font-medium">Custom Text</span>
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
                        ) : (
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
                            {type === 'url' ? 'Add URL' : 'Add Text'}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
