import { Globe, Upload, FileText, MoreHorizontal, Trash2, RefreshCw } from "lucide-react";

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
import { prisma } from "@/lib/db";
import { AddSourceDialog } from "@/components/dashboard/add-source-dialog";
import { deleteSource } from "@/actions/data-source-actions";

export default async function ChatbotKnowledgePage({ params }: { params: { id: string } }) {
    const chatbot = await prisma.chatbot.findUnique({
        where: { id: params.id },
        include: {
            chatbotDataSources: {
                include: {
                    dataSource: {
                        include: {
                            _count: {
                                select: { documentChunks: true }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!chatbot) return <div>Chatbot not found</div>;

    const sources = chatbot.chatbotDataSources.map(cds => cds.dataSource);
    const totalChunks = sources.reduce((acc, s) => acc + s._count.documentChunks, 0);

    const getIcon = (type: string) => {
        switch (type) {
            case "WEBSITE": return Globe;
            case "FILE": return Upload;
            default: return FileText;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "READY":
                return <Badge className="bg-green-100 text-green-700">Ready</Badge>;
            case "PROCESSING":
                return <Badge className="bg-blue-100 text-blue-700">Processing</Badge>;
            case "ERROR":
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
                <AddSourceDialog chatbotId={params.id} />
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">{sources.length}</div>
                        <div className="text-sm text-gray-500">Sources</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">{totalChunks}</div>
                        <div className="text-sm text-gray-500">Chunks</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold">{chatbot.status === 'ACTIVE' ? 'Active' : 'Training'}</div>
                        <div className="text-sm text-gray-500">Status</div>
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
                    {sources.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No sources added yet. Click "Add Source" to get started.
                        </div>
                    ) : (
                        sources.map((source) => {
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
                                                <span className="font-medium text-gray-900 truncate max-w-[200px] sm:max-w-md">
                                                    {source.name}
                                                </span>
                                                {getStatusBadge(source.status)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {source._count.documentChunks} chunks · Synced {source.lastSyncedAt?.toLocaleDateString() || 'Never'}
                                            </div>
                                            {source.errorMessage && (
                                                <div className="text-xs text-red-500 mt-1">
                                                    {source.errorMessage}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
