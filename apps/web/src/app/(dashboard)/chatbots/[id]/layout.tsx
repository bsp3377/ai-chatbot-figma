import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bot, ExternalLink, MoreHorizontal, Pause, Play, Settings2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";

interface ChatbotLayoutProps {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}

export default async function ChatbotLayout({ children, params }: ChatbotLayoutProps) {
    const { id } = await params;
    const chatbot = await db.chatbot.findFirst({ where: { id } });

    if (!chatbot) {
        notFound();
    }

    const statusColors = {
        ACTIVE: "bg-green-100 text-green-700",
        PAUSED: "bg-yellow-100 text-yellow-700",
        TRAINING: "bg-blue-100 text-blue-700",
        ERROR: "bg-red-100 text-red-700",
    };

    const widgetColor = chatbot.widgetConfig?.color || "#3B82F6";

    const tabs = [
        { id: "overview", label: "Overview", href: `/chatbots/${id}` },
        { id: "knowledge", label: "Knowledge", href: `/chatbots/${id}/knowledge` },
        { id: "test", label: "Test", href: `/chatbots/${id}/test` },
        { id: "widget", label: "Widget", href: `/chatbots/${id}/widget` },
        { id: "analytics", label: "Analytics", href: `/chatbots/${id}/analytics` },
        { id: "settings", label: "Settings", href: `/chatbots/${id}/settings` },
    ];

    return (
        <div className="space-y-6">
            {/* Back link */}
            <Link
                href="/chatbots"
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Chatbots
            </Link>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: widgetColor }}
                    >
                        <Bot className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">{chatbot.name}</h1>
                            <Badge
                                variant="outline"
                                className={statusColors[chatbot.status as keyof typeof statusColors]}
                            >
                                {chatbot.status.toLowerCase()}
                            </Badge>
                        </div>
                        <p className="text-gray-500 mt-0.5">
                            Created {new Date(chatbot.createdAt).toLocaleDateString()}
                            {chatbot.lastTrainedAt && ` · Last trained ${formatTimeAgo(chatbot.lastTrainedAt)}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/chatbots/${id}/test`}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Test
                        </Link>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {chatbot.status === "ACTIVE" ? (
                                <DropdownMenuItem>
                                    <Pause className="w-4 h-4 mr-2" />
                                    Pause Chatbot
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem>
                                    <Play className="w-4 h-4 mr-2" />
                                    Activate Chatbot
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                                <Link href={`/chatbots/${id}/settings`}>
                                    <Settings2 className="w-4 h-4 mr-2" />
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Chatbot
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b">
                <nav className="-mb-px flex gap-6 overflow-x-auto">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className="py-3 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 whitespace-nowrap transition-colors"
                        >
                            {tab.label}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {children}
        </div>
    );
}

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}
