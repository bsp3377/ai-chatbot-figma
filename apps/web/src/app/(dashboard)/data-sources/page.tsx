"use client";

import { useState } from "react";
import {
    Plus,
    Globe,
    Upload,
    FileText,
    MoreHorizontal,
    Trash2,
    RefreshCw,
    ExternalLink,
    CheckCircle2,
    Clock,
    XCircle,
    Search
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data sources
const mockSources = [
    {
        id: "1",
        type: "website",
        name: "example.com",
        url: "https://example.com",
        status: "ready",
        pagesCount: 24,
        wordsCount: 32000,
        lastSynced: "2 hours ago",
        chatbots: ["Support Bot"],
    },
    {
        id: "2",
        type: "file",
        name: "Product-Guide.pdf",
        url: null,
        status: "ready",
        pagesCount: 45,
        wordsCount: 18000,
        lastSynced: "1 day ago",
        chatbots: ["Support Bot", "Sales Assistant"],
    },
    {
        id: "3",
        type: "text",
        name: "FAQ Collection",
        url: null,
        status: "ready",
        pagesCount: 1,
        wordsCount: 2500,
        lastSynced: "3 days ago",
        chatbots: ["Sales Assistant"],
    },
    {
        id: "4",
        type: "website",
        name: "docs.example.com",
        url: "https://docs.example.com",
        status: "processing",
        pagesCount: 12,
        wordsCount: 0,
        lastSynced: "Processing...",
        chatbots: [],
    },
];

export default function DataSourcesPage() {
    const [sources, setSources] = useState(mockSources);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("website");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const getIcon = (type: string) => {
        switch (type) {
            case "website":
                return Globe;
            case "file":
                return Upload;
            default:
                return FileText;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ready":
                return (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Ready
                    </Badge>
                );
            case "processing":
                return (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        <Clock className="w-3 h-3 mr-1 animate-spin" />
                        Processing
                    </Badge>
                );
            case "error":
                return (
                    <Badge className="bg-red-100 text-red-700 border-red-200">
                        <XCircle className="w-3 h-3 mr-1" />
                        Error
                    </Badge>
                );
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const handleAddWebsite = async () => {
        if (!websiteUrl.trim()) return;

        setIsAdding(true);

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newSource = {
            id: Date.now().toString(),
            type: "website",
            name: new URL(websiteUrl).hostname,
            url: websiteUrl,
            status: "processing",
            pagesCount: 0,
            wordsCount: 0,
            lastSynced: "Processing...",
            chatbots: [],
        };

        setSources([newSource, ...sources]);
        setAddDialogOpen(false);
        setWebsiteUrl("");
        setIsAdding(false);
    };

    const totalWords = sources.reduce((acc, s) => acc + s.wordsCount, 0);
    const totalPages = sources.reduce((acc, s) => acc + s.pagesCount, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Data Sources</h1>
                    <p className="text-gray-500 mt-1">Manage content that powers your chatbots</p>
                </div>

                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Source
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add Data Source</DialogTitle>
                            <DialogDescription>
                                Choose how to add content to your knowledge base
                            </DialogDescription>
                        </DialogHeader>

                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="website">Website</TabsTrigger>
                                <TabsTrigger value="file">Upload</TabsTrigger>
                                <TabsTrigger value="text">Text</TabsTrigger>
                            </TabsList>

                            <TabsContent value="website" className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="url">Website URL</Label>
                                    <Input
                                        id="url"
                                        placeholder="https://your-website.com"
                                        value={websiteUrl}
                                        onChange={(e) => setWebsiteUrl(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500">
                                        We'll crawl up to 100 pages from this domain
                                    </p>
                                </div>
                            </TabsContent>

                            <TabsContent value="file" className="mt-4">
                                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                    <p className="font-medium text-gray-900 mb-1">
                                        Drop files here or click to upload
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Supports PDF, DOCX, TXT (max 10MB)
                                    </p>
                                    <Button variant="outline" className="mt-4">
                                        Select Files
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="text" className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="content">Custom Content</Label>
                                    <textarea
                                        id="content"
                                        className="w-full h-32 px-3 py-2 border rounded-md resize-none"
                                        placeholder="Paste your FAQs, documentation, or any text content..."
                                    />
                                    <p className="text-xs text-gray-500">
                                        Great for FAQs, policies, or custom knowledge
                                    </p>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleAddWebsite} disabled={isAdding}>
                                {isAdding ? "Adding..." : "Add Source"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">{sources.length}</div>
                        <div className="text-sm text-gray-500">Total Sources</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">{totalPages}</div>
                        <div className="text-sm text-gray-500">Pages Indexed</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">{(totalWords / 1000).toFixed(0)}K</div>
                        <div className="text-sm text-gray-500">Words Processed</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">
                            {sources.filter(s => s.status === "ready").length}
                        </div>
                        <div className="text-sm text-gray-500">Ready Sources</div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search sources..." className="pl-9" />
            </div>

            {/* Sources List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Sources</CardTitle>
                    <CardDescription>
                        Content indexed and ready for your chatbots
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {sources.map((source) => {
                            const Icon = getIcon(source.type);

                            return (
                                <div
                                    key={source.id}
                                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                            <Icon className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-gray-900 truncate">
                                                    {source.name}
                                                </span>
                                                {getStatusBadge(source.status)}
                                            </div>
                                            <div className="text-sm text-gray-500 mt-0.5">
                                                {source.pagesCount} pages · {(source.wordsCount / 1000).toFixed(0)}K words · {source.lastSynced}
                                            </div>
                                            {source.chatbots.length > 0 && (
                                                <div className="flex gap-1 mt-1.5">
                                                    {source.chatbots.map((bot) => (
                                                        <Badge key={bot} variant="secondary" className="text-xs">
                                                            {bot}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 ml-4">
                                        {source.url && (
                                            <Button variant="ghost" size="icon" asChild>
                                                <a href={source.url} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </Button>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <RefreshCw className="w-4 h-4 mr-2" />
                                                    Re-sync
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                    <h4 className="font-medium text-blue-900 mb-2">💡 Tips for Better Results</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Add your FAQ page for common questions</li>
                        <li>• Include product documentation for detailed answers</li>
                        <li>• Re-sync sources when content changes</li>
                        <li>• Remove outdated content to improve accuracy</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
