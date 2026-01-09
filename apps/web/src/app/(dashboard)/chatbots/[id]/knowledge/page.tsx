import { Globe, Upload, FileText, Plus, MoreHorizontal, Trash2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ChatbotKnowledgePage() {
    // Mock data sources
    const sources = [
        {
            id: "1",
            type: "website",
            name: "example.com",
            status: "ready",
            pages: 24,
            words: 32000,
            lastSynced: "2 hours ago",
        },
        {
            id: "2",
            type: "file",
            name: "Product-Guide.pdf",
            status: "ready",
            pages: 45,
            words: 18000,
            lastSynced: "1 day ago",
        },
    ];

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
                return <Badge className="bg-green-100 text-green-700">Ready</Badge>;
            case "processing":
                return <Badge className="bg-blue-100 text-blue-700">Processing</Badge>;
            case "error":
                return <Badge className="bg-red-100 text-red-700">Error</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Knowledge Sources</h2>
                    <p className="text-sm text-gray-500">
                        Content your chatbot uses to answer questions
                    </p>
                </div>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Source
                </Button>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">2</div>
                        <div className="text-sm text-gray-500">Sources</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">69</div>
                        <div className="text-sm text-gray-500">Pages</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">50K</div>
                        <div className="text-sm text-gray-500">Words</div>
                    </CardContent>
                </Card>
            </div>

            {/* Sources List */}
            <Card>
                <CardHeader>
                    <CardTitle>Sources</CardTitle>
                    <CardDescription>
                        Add websites, files, or custom text to train your chatbot
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {sources.map((source) => {
                        const Icon = getIcon(source.type);

                        return (
                            <div
                                key={source.id}
                                className="flex items-center justify-between p-4 rounded-lg border"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <Icon className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">{source.name}</span>
                                            {getStatusBadge(source.status)}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {source.pages} pages · {(source.words / 1000).toFixed(0)}K words · Synced {source.lastSynced}
                                        </div>
                                    </div>
                                </div>

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
                                            Remove
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            {/* Add Source Options */}
            <Card>
                <CardHeader>
                    <CardTitle>Add New Source</CardTitle>
                    <CardDescription>Choose how to add content</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-3">
                        <button className="p-6 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
                            <Globe className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <div className="font-medium text-gray-900">Website</div>
                            <div className="text-sm text-gray-500">Crawl a website</div>
                        </button>
                        <button className="p-6 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <div className="font-medium text-gray-900">Upload Files</div>
                            <div className="text-sm text-gray-500">PDF, DOCX, TXT</div>
                        </button>
                        <button className="p-6 rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-center">
                            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <div className="font-medium text-gray-900">Custom Text</div>
                            <div className="text-sm text-gray-500">FAQs, Q&As</div>
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Training Status */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Training Status</CardTitle>
                            <CardDescription>Last trained 2 hours ago</CardDescription>
                        </div>
                        <Button>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retrain
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Training complete</span>
                            <span className="font-medium">100%</span>
                        </div>
                        <Progress value={100} className="h-2" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
