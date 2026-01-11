import Link from "next/link";
import { Bot, BarChart3, MessageSquare, Users, ArrowUpRight, Plus, TrendingUp, CheckCircle2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const session = await auth();

    // Get user's workspace
    const user = session?.user?.email ? await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { workspace: true }
    }) : null;

    const workspaceId = user?.workspaceId;

    // Fetch real data
    const chatbots = workspaceId
        ? await prisma.chatbot.findMany({
            where: { workspaceId },
            orderBy: { updatedAt: 'desc' }
        })
        : [];

    // Get all chatbot IDs for this workspace
    const chatbotIds = chatbots.map((c: { id: string }) => c.id);

    // Fetch conversation count this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const conversationsThisMonth = chatbotIds.length > 0
        ? await prisma.conversation.count({
            where: {
                chatbotId: { in: chatbotIds },
                createdAt: { gte: startOfMonth }
            }
        })
        : 0;

    // Fetch unique visitors this month
    const uniqueVisitors = chatbotIds.length > 0
        ? await prisma.conversation.groupBy({
            by: ['visitorId'],
            where: {
                chatbotId: { in: chatbotIds },
                createdAt: { gte: startOfMonth }
            }
        }).then((result: unknown[]) => result.length)
        : 0;

    // Fetch resolved conversations for resolution rate
    const resolvedConversations = chatbotIds.length > 0
        ? await prisma.conversation.count({
            where: {
                chatbotId: { in: chatbotIds },
                status: 'RESOLVED',
                createdAt: { gte: startOfMonth }
            }
        })
        : 0;

    const resolutionRate = conversationsThisMonth > 0
        ? Math.round((resolvedConversations / conversationsThisMonth) * 100)
        : 0;

    // Recent conversations
    const conversations = chatbotIds.length > 0
        ? await prisma.conversation.findMany({
            where: { chatbotId: { in: chatbotIds } },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                _count: { select: { messages: true } }
            }
        })
        : [];

    // Build stats from real data
    const stats = [
        {
            name: "Active Chatbots",
            value: chatbots.filter((c: { status: string }) => c.status === 'ACTIVE').length.toString(),
            change: "+0",
            changeType: "positive" as const,
            icon: Bot,
        },
        {
            name: "Chats This Month",
            value: conversationsThisMonth.toString(),
            change: "+0%",
            changeType: "positive" as const,
            icon: MessageSquare,
        },
        {
            name: "Resolution Rate",
            value: `${resolutionRate}%`,
            change: "+0%",
            changeType: "positive" as const,
            icon: CheckCircle2,
        },
        {
            name: "Unique Visitors",
            value: uniqueVisitors.toString(),
            change: "+0%",
            changeType: "positive" as const,
            icon: Users,
        },
    ];

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back! Here's what's happening.</p>
                </div>
                <Button asChild>
                    <Link href="/chatbots/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Chatbot
                    </Link>
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.name}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                {stat.name}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-green-600 flex items-center mt-1">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                {stat.change} from last period
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Chatbots Section */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Your Chatbots</CardTitle>
                            <CardDescription>Recently updated bots</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/chatbots">
                                View all
                                <ArrowUpRight className="w-4 h-4 ml-1" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {chatbots.slice(0, 3).map((bot: any) => (
                                <Link
                                    key={bot.id}
                                    href={`/chatbots/${bot.id}`}
                                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: (bot.widgetConfig as any)?.color || "#3B82F6" }}
                                        >
                                            <Bot className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{bot.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {bot.lastTrainedAt ? `Last trained ${formatRelativeTime(bot.lastTrainedAt)}` : "Never trained"}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={bot.status === "ACTIVE" ? "default" : "secondary"}
                                        className={bot.status === "ACTIVE" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                                    >
                                        {bot.status.toLowerCase()}
                                    </Badge>
                                </Link>
                            ))}

                            {chatbots.length === 0 && (
                                <div className="text-center py-8">
                                    <Bot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 mb-4">No chatbots yet</p>
                                    <Button asChild>
                                        <Link href="/chatbots/new">Create your first chatbot</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Conversations */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Conversations</CardTitle>
                            <CardDescription>Latest chat activity</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/analytics">
                                View all
                                <ArrowUpRight className="w-4 h-4 ml-1" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {conversations.map((conv: any) => (
                                <div
                                    key={conv.id}
                                    className="flex items-center justify-between p-3 rounded-lg border"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                            <MessageSquare className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {conv.leadName || `Visitor ${conv.visitorId.slice(-6)}`}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {conv._count?.messages || 0} messages · {formatRelativeTime(conv.startedAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={
                                            conv.status === "RESOLVED"
                                                ? "border-green-200 bg-green-50 text-green-700"
                                                : conv.status === "ESCALATED"
                                                    ? "border-orange-200 bg-orange-50 text-orange-700"
                                                    : "border-blue-200 bg-blue-50 text-blue-700"
                                        }
                                    >
                                        {conv.status.toLowerCase()}
                                    </Badge>
                                </div>
                            ))}

                            {conversations.length === 0 && (
                                <div className="text-center py-8">
                                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No conversations yet</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Setup Checklist */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Setup</CardTitle>
                    <CardDescription>Complete these steps to get the most out of ChatBot AI</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Create account</span>
                        </div>
                        <div className={`flex items-center gap-3 p-3 rounded-lg ${chatbots.length > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border`}>
                            {chatbots.length > 0 ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                            )}
                            <span className={`text-sm font-medium ${chatbots.length > 0 ? 'text-green-800' : 'text-gray-600'}`}>Create first chatbot</span>
                        </div>
                        <Link
                            href="/chatbots"
                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                            <span className="text-sm font-medium text-gray-600">Add content sources</span>
                        </Link>
                        <Link
                            href="/chatbots"
                            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                            <span className="text-sm font-medium text-gray-600">Install widget</span>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
}
