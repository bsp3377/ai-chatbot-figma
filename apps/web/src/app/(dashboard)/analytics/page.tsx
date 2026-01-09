"use client";

import { useState } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState("7d");

    // Mock overall stats
    const stats = {
        totalConversations: 1245,
        conversationChange: 12,
        totalMessages: 8934,
        messageChange: 18,
        uniqueVisitors: 892,
        visitorChange: 8,
        avgResolutionRate: 92,
        resolutionChange: 2,
    };

    // Mock chatbot performance
    const chatbotStats = [
        {
            id: "bot_1",
            name: "Support Bot",
            conversations: 856,
            messages: 5432,
            resolutionRate: 94,
            avgResponseTime: "1.1s",
            trend: "up",
        },
        {
            id: "bot_2",
            name: "Sales Assistant",
            conversations: 389,
            messages: 3502,
            resolutionRate: 89,
            avgResponseTime: "1.4s",
            trend: "up",
        },
    ];

    // Mock daily data
    const dailyData = [
        { date: "Mon", conversations: 145, messages: 980 },
        { date: "Tue", conversations: 232, messages: 1450 },
        { date: "Wed", conversations: 198, messages: 1280 },
        { date: "Thu", conversations: 265, messages: 1680 },
        { date: "Fri", conversations: 218, messages: 1420 },
        { date: "Sat", conversations: 112, messages: 720 },
        { date: "Sun", conversations: 75, messages: 504 },
    ];

    // Mock top questions
    const topQuestions = [
        { question: "What are your pricing plans?", count: 156, change: 12 },
        { question: "How do I get started?", count: 134, change: -3 },
        { question: "Do you offer a free trial?", count: 98, change: 8 },
        { question: "How can I contact support?", count: 87, change: 5 },
        { question: "What integrations do you support?", count: 76, change: 15 },
    ];

    const maxConversations = Math.max(...dailyData.map(d => d.conversations));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                    <p className="text-gray-500 mt-1">Track your chatbot performance</p>
                </div>

                <div className="flex items-center gap-2">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="24h">Last 24 hours</SelectItem>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>
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
                        <div className="text-2xl font-bold">{stats.totalConversations.toLocaleString()}</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +{stats.conversationChange}% from last period
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
                        <div className="text-2xl font-bold">{stats.totalMessages.toLocaleString()}</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +{stats.messageChange}% from last period
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
                        <div className="text-2xl font-bold">{stats.uniqueVisitors.toLocaleString()}</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +{stats.visitorChange}% from last period
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Avg Resolution Rate
                        </CardTitle>
                        <ThumbsUp className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgResolutionRate}%</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            +{stats.resolutionChange}% from last period
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
                            {dailyData.map((day) => (
                                <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full flex flex-col items-center gap-1">
                                        <span className="text-xs text-gray-500">{day.conversations}</span>
                                        <div
                                            className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                                            style={{ height: `${(day.conversations / maxConversations) * 140}px` }}
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
                            {chatbotStats.map((bot) => (
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
                            ))}
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
                    <div className="space-y-4">
                        {topQuestions.map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600 shrink-0">
                                    {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-900 truncate">{item.question}</p>
                                </div>
                                <div className="flex items-center gap-4 shrink-0">
                                    <span className="text-sm text-gray-500">{item.count} times</span>
                                    <span className={`text-xs flex items-center ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {item.change >= 0 ? (
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                        ) : (
                                            <TrendingDown className="w-3 h-3 mr-1" />
                                        )}
                                        {Math.abs(item.change)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
