"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { useParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";

export default function ChatbotTestPage() {
    const params = useParams();
    const [inputValue, setInputValue] = useState("");

    const { messages, append, isLoading, setMessages } = useChat({
        api: '/api/chat',
        body: { chatbotId: params.id },
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue;
        setInputValue("");
        await append({ role: 'user', content: userMessage });
    };

    // Auto-scroll
    const messagesEndRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleReset = () => {
        setMessages([
            {
                id: "1",
                role: "assistant",
                content: "Hi! How can I help you today?",
                // timestamp: new Date(),
            } as any,
        ]);
    };

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            {/* Chat Window */}
            <div className="lg:col-span-2">
                <Card className="h-[600px] flex flex-col">
                    <CardHeader className="border-b flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <CardTitle className="text-base">Test Chat</CardTitle>
                                    <CardDescription>Try out your chatbot</CardDescription>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleReset}>
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""
                                    }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${message.role === "user"
                                        ? "bg-gray-200"
                                        : "bg-blue-600"
                                        }`}
                                >
                                    {message.role === "user" ? (
                                        <User className="w-4 h-4 text-gray-600" />
                                    ) : (
                                        <Bot className="w-4 h-4 text-white" />
                                    )}
                                </div>
                                <div
                                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${message.role === "user"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-900"
                                        }`}
                                >
                                    <p className="text-sm">{(message as any).content}</p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </CardContent>

                    <div className="border-t p-4 flex-shrink-0">
                        <div className="flex gap-2">
                            <form onSubmit={handleSubmit} className="flex gap-2 w-full">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type a message..."
                                    disabled={isLoading}
                                    className="flex-1"
                                />
                                <Button type="submit" disabled={!inputValue.trim() || isLoading}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Info Panel */}
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Test Tips</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-gray-600">
                        <p>💬 Ask questions your customers might ask</p>
                        <p>🔍 Test edge cases and unusual queries</p>
                        <p>📝 Check if responses match your content</p>
                        <p>🎯 Verify the tone matches your brand</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Sample Questions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {[
                            "What are your pricing plans?",
                            "How do I get started?",
                            "Do you offer a free trial?",
                            "How can I contact support?",
                        ].map((q, i) => (
                            <button
                                key={i}
                                onClick={() => setInputValue(q)}
                                className="w-full text-left text-sm p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                {q}
                            </button>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
