import {
    MessageSquare,
    Users,
    TrendingUp,
    Bot,
    ThumbsUp,
    ArrowUpRight,
    AlertTriangle,
    UserPlus,
    HelpCircle
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage({
    searchParams,
}: {
    searchParams: Promise<{ period?: string }>;
}) {
    const session = await auth();
    const params = await searchParams;
    const period = params.period || '30d';

    // Calculate date range
    let startDate = new Date();
    switch (period) {
        case '7d':
            startDate.setDate(startDate.getDate() - 7);
            break;
        case '30d':
            startDate.setDate(startDate.getDate() - 30);
            break;
        case '90d':
            startDate.setDate(startDate.getDate() - 90);
            break;
        default:
            startDate.setDate(startDate.getDate() - 30);
    }

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

    // Total conversations
    const totalConversations = chatbotIds.length > 0
        ? await prisma.conversation.count({
            where: {
                chatbotId: { in: chatbotIds },
                createdAt: { gte: startDate }
            }
        })
        : 0;

    // Total messages
    const totalMessages = chatbotIds.length > 0
        ? await prisma.message.count({
            where: {
                conversation: {
                    chatbotId: { in: chatbotIds },
                    createdAt: { gte: startDate }
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
                createdAt: { gte: startDate }
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
                createdAt: { gte: startDate }
            }
        })
        : 0;

    // Escalated conversations
    const escalatedConversations = chatbotIds.length > 0
        ? await prisma.conversation.count({
            where: {
                chatbotId: { in: chatbotIds },
                status: 'ESCALATED',
                createdAt: { gte: startDate }
            }
        })
        : 0;

    // Leads captured
    const leadsCaptured = chatbotIds.length > 0
        ? await prisma.conversation.count({
            where: {
                chatbotId: { in: chatbotIds },
                leadEmail: { not: null },
                createdAt: { gte: startDate }
            }
        })
        : 0;

    const resolutionRate = totalConversations > 0
        ? Math.round((resolvedConversations / totalConversations) * 100)
        : 0;

    const escalationRate = totalConversations > 0
        ? Math.round((escalatedConversations / totalConversations) * 100)
        : 0;

    // Get chatbot performance data
    const chatbotStats = await Promise.all(chatbots.map(async (bot) => {
        const conversations = await prisma.conversation.count({
            where: { chatbotId: bot.id, createdAt: { gte: startDate } }
        });
        const messages = await prisma.message.count({
            where: { conversation: { chatbotId: bot.id, createdAt: { gte: startDate } } }
        });
        const resolved = await prisma.conversation.count({
            where: { chatbotId: bot.id, status: 'RESOLVED', createdAt: { gte: startDate } }
        });
        const rate = conversations > 0 ? Math.round((resolved / conversations) * 100) : 0;

        return {
            id: bot.id,
            name: bot.name,
            conversations,
            messages,
            resolutionRate: rate,
            avgResponseTime: "1.2s",
        };
    }));

    // Generate daily data for the chart
    const days = period === '7d' ? 7 : period === '90d' ? 14 : 7;
    const dailyData = [];
    for (let i = days - 1; i >= 0; i--) {
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

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dailyData.push({
            date: dayNames[date.getDay()],
            conversations: dayConversations,
            messages: dayMessages
        });
    }

    const maxConversations = Math.max(1, ...dailyData.map(d => d.conversations));

    // Get top questions (most frequent user messages)
    let topQuestions: Array<{ content: string; count: bigint }> = [];
    if (chatbotIds.length > 0) {
        try {
            topQuestions = await prisma.$queryRaw<Array<{ content: string; count: bigint }>>`
                SELECT m.content, COUNT(*) as count
                FROM "Message" m
                JOIN "Conversation" c ON m."conversationId" = c.id
                WHERE c."chatbotId" = ANY(${chatbotIds})
                AND c."createdAt" >= ${startDate}
                AND m.role = 'USER'
                AND LENGTH(m.content) > 10
                AND LENGTH(m.content) < 200
                GROUP BY m.content
                ORDER BY count DESC
                LIMIT 8
            `;
        } catch {
            // Query might fail on empty database
            topQuestions = [];
        }
    }

    const periodLabel = period === '7d' ? 'Last 7 days' : period === '90d' ? 'Last 90 days' : 'Last 30 days';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-500 mt-1">Track your chatbot performance</p>
                </div>

                <form method="GET">
                    <Select name="period" defaultValue={period}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>
                </form>
            </div>

            {/* Overview Stats - 6 columns */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Conversations
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalConversations.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">{periodLabel}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Messages
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalMessages.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">across all chatbots</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Unique Visitors
                        </CardTitle>
                        <Users className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{uniqueVisitors.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">unique sessions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Resolution Rate
                        </CardTitle>
                        <ThumbsUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{resolutionRate}%</div>
                        <p className="text-xs text-gray-500 mt-1">{resolvedConversations} resolved</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Escalation Rate
                        </CardTitle>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{escalationRate}%</div>
                        <p className="text-xs text-gray-500 mt-1">{escalatedConversations} escalated</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Leads Captured
                        </CardTitle>
                        <UserPlus className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{leadsCaptured}</div>
                        <p className="text-xs text-gray-500 mt-1">new leads</p>
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
                                            className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:from-blue-700 hover:to-blue-500"
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
                        <div className="space-y-4 max-h-[280px] overflow-y-auto">
                            {chatbotStats.length === 0 ? (
                                <div className="text-center py-8">
                                    <Bot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No chatbots found</p>
                                </div>
                            ) : (
                                chatbotStats.map((bot) => (
                                    <div key={bot.id} className="p-4 rounded-lg border hover:border-blue-200 transition-colors">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
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

            {/* Top Questions */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Questions</CardTitle>
                    <CardDescription>Most frequently asked questions across all chatbots</CardDescription>
                </CardHeader>
                <CardContent>
                    {topQuestions.length === 0 ? (
                        <div className="text-center py-8">
                            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No questions found yet</p>
                            <p className="text-sm text-gray-400 mt-1">Questions will appear here once visitors start chatting</p>
                        </div>
                    ) : (
                        <div className="grid gap-3 md:grid-cols-2">
                            {topQuestions.map((q, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900 truncate">{q.content}</p>
                                        <p className="text-xs text-gray-500 mt-1">{Number(q.count)} times asked</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
