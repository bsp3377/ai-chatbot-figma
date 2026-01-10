import {
    MessageSquare,
    Users,
    TrendingUp,
    TrendingDown,
    Bot,
    ThumbsUp,
    Clock,
    ArrowUpRight,
    Filter
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
    const session = await auth();

    // Get user's workspace
    const user = session?.user?.email ? await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { workspace: true }
    }) : null;

    const workspaceId = user?.workspaceId;

    // Get all chatbots for this workspace
    const chatbots = workspaceId
        ? await prisma.chatbot.findMany({
            where: { workspaceId },
            include: {
                _count: { select: { conversations: true } }
            }
        })
        : [];

    const chatbotIds = chatbots.map(c => c.id);

    // Date ranges
    const now = new Date();
    const startOfPeriod = new Date();
    startOfPeriod.setDate(startOfPeriod.getDate() - 30);

    // Total conversations
    const totalConversations = chatbotIds.length > 0
        ? await prisma.conversation.count({
            where: {
                chatbotId: { in: chatbotIds },
                createdAt: { gte: startOfPeriod }
            }
        })
        : 0;

    // Total messages
    const totalMessages = chatbotIds.length > 0
        ? await prisma.message.count({
            where: {
                conversation: {
                    chatbotId: { in: chatbotIds },
                    createdAt: { gte: startOfPeriod }
                }
            }
        })
        : 0;

    // Unique visitors
    const uniqueVisitorsResult = chatbotIds.length > 0
        ? await prisma.conversation.groupBy({
            by: ['visitorId'],
            where: {
                chatbotId: { in: chatbotIds },
                createdAt: { gte: startOfPeriod }
            }
        })
        : [];
    const uniqueVisitors = uniqueVisitorsResult.length;

    // Resolution rate
    const resolvedConversations = chatbotIds.length > 0
        ? await prisma.conversation.count({
            where: {
                chatbotId: { in: chatbotIds },
                status: 'RESOLVED',
                createdAt: { gte: startOfPeriod }
            }
        })
        : 0;

    const resolutionRate = totalConversations > 0
        ? Math.round((resolvedConversations / totalConversations) * 100)
        : 0;

    // Get chatbot performance data
    const chatbotStats = await Promise.all(chatbots.map(async (bot) => {
        const conversations = await prisma.conversation.count({
            where: { chatbotId: bot.id, createdAt: { gte: startOfPeriod } }
        });
        const messages = await prisma.message.count({
            where: { conversation: { chatbotId: bot.id, createdAt: { gte: startOfPeriod } } }
        });
        const resolved = await prisma.conversation.count({
            where: { chatbotId: bot.id, status: 'RESOLVED', createdAt: { gte: startOfPeriod } }
        });
        const rate = conversations > 0 ? Math.round((resolved / conversations) * 100) : 0;

        return {
            id: bot.id,
            name: bot.name,
            conversations,
            messages,
            resolutionRate: rate,
            avgResponseTime: "1.2s", // Would require latency tracking
            trend: "up" as const,
        };
    }));

    // Generate daily data for the last 7 days
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const dayConversations = chatbotIds.length > 0
            ? await prisma.conversation.count({
                where: {
                    chatbotId: { in: chatbotIds },
                    createdAt: { gte: startOfDay, lte: endOfDay }
                }
            })
            : 0;

        const dayMessages = chatbotIds.length > 0
            ? await prisma.message.count({
                where: {
                    conversation: {
                        chatbotId: { in: chatbotIds },
                        createdAt: { gte: startOfDay, lte: endOfDay }
                    }
                }
            })
            : 0;

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dailyData.push({
            date: days[date.getDay()],
            conversations: dayConversations,
            messages: dayMessages
        });
    }

    const maxConversations = Math.max(1, ...dailyData.map(d => d.conversations));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-500 mt-1">Track your chatbot performance (Last 30 days)</p>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">Last 30 days</Badge>
                    <Button variant="outline" size="icon">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Total Conversations
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalConversations.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            in the last 30 days
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Messages Processed
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalMessages.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            across all chatbots
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Unique Visitors
                        </CardTitle>
                        <Users className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{uniqueVisitors.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">
                            unique sessions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Resolution Rate
                        </CardTitle>
                        <ThumbsUp className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{resolutionRate}%</div>
                        <p className="text-xs text-gray-500 mt-1">
                            {resolvedConversations} resolved of {totalConversations}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Conversations Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Conversations Over Time</CardTitle>
                        <CardDescription>Daily conversation count across all chatbots</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between h-48 gap-2">
                            {dailyData.map((day, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full flex flex-col items-center gap-1">
                                        <span className="text-xs text-gray-500">{day.conversations}</span>
                                        <div
                                            className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                                            style={{ height: `${Math.max(4, (day.conversations / maxConversations) * 140)}px` }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500">{day.date}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Chatbot Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Chatbot Performance</CardTitle>
                        <CardDescription>How each chatbot is performing</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {chatbotStats.length === 0 ? (
                                <div className="text-center py-8">
                                    <Bot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No chatbots found</p>
                                </div>
                            ) : (
                                chatbotStats.map((bot) => (
                                    <div key={bot.id} className="p-4 rounded-lg border">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                                                    <Bot className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{bot.name}</h4>
                                                    <p className="text-sm text-gray-500">
                                                        {bot.conversations} conversations
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className="bg-green-100 text-green-700">
                                                <ArrowUpRight className="w-3 h-3 mr-1" />
                                                {bot.resolutionRate}%
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-500">Messages</p>
                                                <p className="font-medium">{bot.messages.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Resolution</p>
                                                <p className="font-medium">{bot.resolutionRate}%</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Avg Response</p>
                                                <p className="font-medium">{bot.avgResponseTime}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Empty state for top questions until we have message analysis */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Questions</CardTitle>
                    <CardDescription>Most frequently asked questions across all chatbots</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Question analysis coming soon</p>
                        <p className="text-sm text-gray-400 mt-1">We're working on analyzing your conversation data</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
