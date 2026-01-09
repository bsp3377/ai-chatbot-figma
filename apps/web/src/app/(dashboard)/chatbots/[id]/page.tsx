import { Bot, MessageSquare, Users, TrendingUp, CheckCircle2, Clock, Zap } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export const dynamic = 'force-dynamic';
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { db } from "@/lib/db";

interface OverviewPageProps {
    params: Promise<{ id: string }>;
}

export default async function ChatbotOverviewPage({ params }: OverviewPageProps) {
    const { id } = await params;
    const chatbot = await db.chatbot.findFirst({ where: { id } });
    const conversations = await db.conversation.findMany({
        where: { chatbotId: id },
        take: 5,
    });

    // Mock stats
    const stats = {
        totalChats: 342,
        todayChats: 24,
        resolutionRate: 94,
        avgResponseTime: "1.2s",
        uniqueVisitors: 287,
        messagesProcessed: 1456,
    };

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Conversations</CardTitle>
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalChats}</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +{stats.todayChats} today
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Resolution Rate</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.resolutionRate}%</div>
                        <Progress value={stats.resolutionRate} className="h-1.5 mt-2" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Avg Response Time</CardTitle>
                        <Clock className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            Across all conversations
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Unique Visitors</CardTitle>
                        <Users className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.uniqueVisitors}</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +12% this week
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Two Column Layout */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Knowledge Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Knowledge Base</CardTitle>
                        <CardDescription>Content your chatbot has learned</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p className="font-medium text-gray-900">2 Sources</p>
                                <p className="text-sm text-gray-500">45,000 words processed</p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/chatbots/${id}/knowledge`}>
                                    <Zap className="w-4 h-4 mr-1" />
                                    Train
                                </Link>
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Website: example.com</span>
                                <span className="text-green-600">24 pages</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">File: Product-Guide.pdf</span>
                                <span className="text-green-600">45 pages</span>
                            </div>
                        </div>

                        <div className="pt-4 border-t">
                            <p className="text-sm text-gray-500">
                                Last trained: 2 hours ago
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Conversations */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Conversations</CardTitle>
                        <CardDescription>Latest chat activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {conversations.length > 0 ? (
                                conversations.map((conv: any) => (
                                    <div
                                        key={conv.id}
                                        className="flex items-center justify-between p-3 rounded-lg border"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                <MessageSquare className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {conv.leadName || `Visitor ${conv.visitorId.slice(-6)}`}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {conv.messageCount || 0} messages
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {formatTimeAgo(conv.startedAt)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-gray-500">
                                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                    <p>No conversations yet</p>
                                </div>
                            )}
                        </div>

                        {conversations.length > 0 && (
                            <Button variant="ghost" className="w-full mt-4" asChild>
                                <Link href={`/chatbots/${id}/analytics`}>
                                    View All Conversations
                                </Link>
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                            <Link href={`/chatbots/${id}/test`}>
                                <Bot className="w-5 h-5" />
                                <span>Test Chatbot</span>
                            </Link>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                            <Link href={`/chatbots/${id}/widget`}>
                                <Zap className="w-5 h-5" />
                                <span>Get Widget Code</span>
                            </Link>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                            <Link href={`/chatbots/${id}/knowledge`}>
                                <TrendingUp className="w-5 h-5" />
                                <span>Add More Content</span>
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
}
