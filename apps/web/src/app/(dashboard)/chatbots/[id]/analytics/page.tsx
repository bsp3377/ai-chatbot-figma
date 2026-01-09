"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    MessageSquare,
    TrendingUp,
    Users,
    ThumbsUp,
    ThumbsDown,
    Clock
} from "lucide-react";

export default function ChatbotAnalyticsPage() {
    // Mock data
    const stats = {
        totalConversations: 342,
        avgMessages: 4.2,
        resolutionRate: 94,
        avgResponseTime: "1.2s",
        positiveRating: 87,
        negativeRating: 13,
    };

    const dailyData = [
        { date: "Mon", conversations: 45, visitors: 120 },
        { date: "Tue", conversations: 52, visitors: 145 },
        { date: "Wed", conversations: 38, visitors: 110 },
        { date: "Thu", conversations: 65, visitors: 180 },
        { date: "Fri", conversations: 58, visitors: 160 },
        { date: "Sat", conversations: 42, visitors: 95 },
        { date: "Sun", conversations: 35, visitors: 85 },
    ];

    const topQuestions = [
        { question: "What are your pricing plans?", count: 45 },
        { question: "How do I get started?", count: 38 },
        { question: "Do you offer a free trial?", count: 32 },
        { question: "How can I contact support?", count: 28 },
        { question: "What integrations do you support?", count: 24 },
    ];

    const maxConversations = Math.max(...dailyData.map(d => d.conversations));

    return (
        <div className="space-y-6">
            {/* Time Range Selector */}
            <Tabs defaultValue="7d">
                <TabsList>
                    <TabsTrigger value="24h">24 hours</TabsTrigger>
                    <TabsTrigger value="7d">7 days</TabsTrigger>
                    <TabsTrigger value="30d">30 days</TabsTrigger>
                    <TabsTrigger value="90d">90 days</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Conversations
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalConversations}</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +12% from last period
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Avg Messages/Chat
                        </CardTitle>
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgMessages}</div>
                        <p className="text-xs text-gray-500 mt-1">messages per conversation</p>
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
                        <div className="text-2xl font-bold">{stats.resolutionRate}%</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +2% from last period
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Avg Response Time
                        </CardTitle>
                        <Clock className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgResponseTime}</div>
                        <p className="text-xs text-gray-500 mt-1">average latency</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Conversations Chart (Simple bar chart) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Conversations Over Time</CardTitle>
                        <CardDescription>Daily conversation count</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between h-40 gap-2">
                            {dailyData.map((day) => (
                                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                                        style={{ height: `${(day.conversations / maxConversations) * 100}%` }}
                                    />
                                    <span className="text-xs text-gray-500">{day.date}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Feedback */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Feedback</CardTitle>
                        <CardDescription>How users rate the responses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                    <ThumbsUp className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium">Positive</span>
                                        <span className="text-green-600 font-medium">{stats.positiveRating}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full"
                                            style={{ width: `${stats.positiveRating}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                    <ThumbsDown className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium">Negative</span>
                                        <span className="text-red-600 font-medium">{stats.negativeRating}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-red-500 rounded-full"
                                            style={{ width: `${stats.negativeRating}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Questions */}
            <Card>
                <CardHeader>
                    <CardTitle>Top Questions</CardTitle>
                    <CardDescription>Most frequently asked questions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topQuestions.map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                                    {i + 1}
                                </span>
                                <span className="flex-1 text-gray-900">{item.question}</span>
                                <span className="text-sm text-gray-500">{item.count} times</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
