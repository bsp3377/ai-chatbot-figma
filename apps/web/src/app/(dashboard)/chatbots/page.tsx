import Link from "next/link";
import { Plus, Bot, MoreHorizontal, Search, Filter, Zap, MessageSquare, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db } from "@/lib/db";

export default async function ChatbotsPage() {
    const chatbots = await db.chatbot.findMany({ where: { workspaceId: "ws_1" } });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Chatbots</h1>
                    <p className="text-gray-500 mt-1">Create and manage your AI chatbots</p>
                </div>
                <Button asChild>
                    <Link href="/chatbots/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Chatbot
                    </Link>
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search chatbots..."
                        className="pl-9"
                    />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            {/* Chatbots Grid */}
            {chatbots.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {chatbots.map((bot) => (
                        <ChatbotCard key={bot.id} chatbot={bot} />
                    ))}
                </div>
            ) : (
                <EmptyState />
            )}
        </div>
    );
}

function ChatbotCard({ chatbot }: { chatbot: any }) {
    const statusColors = {
        ACTIVE: "bg-green-100 text-green-700 border-green-200",
        PAUSED: "bg-yellow-100 text-yellow-700 border-yellow-200",
        TRAINING: "bg-blue-100 text-blue-700 border-blue-200",
        ERROR: "bg-red-100 text-red-700 border-red-200",
    };

    const widgetColor = chatbot.widgetConfig?.color || "#3B82F6";

    return (
        <Card className="group hover:shadow-md transition-shadow">
            <CardContent className="p-5">
                <div className="flex items-start justify-between">
                    <Link href={`/chatbots/${chatbot.id}`} className="flex items-center gap-3 flex-1">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: widgetColor }}
                        >
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                {chatbot.name}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                                {chatbot.welcomeMessage}
                            </p>
                        </div>
                    </Link>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="shrink-0 -mr-2">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={`/chatbots/${chatbot.id}`}>View Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/chatbots/${chatbot.id}/test`}>Test Chatbot</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/chatbots/${chatbot.id}/widget`}>Get Widget Code</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href={`/chatbots/${chatbot.id}/settings`}>Settings</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <Badge
                        variant="outline"
                        className={statusColors[chatbot.status as keyof typeof statusColors]}
                    >
                        {chatbot.status.toLowerCase()}
                    </Badge>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            124
                        </span>
                        <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            89
                        </span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                        Last trained {chatbot.lastTrainedAt ? "2h ago" : "Never"}
                    </span>
                    <Link
                        href={`/chatbots/${chatbot.id}/knowledge`}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                        <Zap className="w-3.5 h-3.5" />
                        Train
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}

function EmptyState() {
    return (
        <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                    <Bot className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Create your first chatbot
                </h3>
                <p className="text-gray-500 text-center max-w-sm mb-6">
                    Build an AI chatbot that learns from your content and helps your customers 24/7.
                </p>
                <Button asChild>
                    <Link href="/chatbots/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Chatbot
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
