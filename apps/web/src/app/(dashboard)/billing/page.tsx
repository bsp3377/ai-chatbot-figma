"use client";

import { useState } from "react";
import Link from "next/link";
import {
    CreditCard,
    Check,
    Zap,
    MessageSquare,
    Bot,
    Database,
    ArrowRight,
    ExternalLink
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const plans = [
    {
        id: "free",
        name: "Free",
        price: 0,
        description: "Get started with basic features",
        features: [
            "1 Chatbot",
            "50 messages/month",
            "Basic analytics",
            "Community support",
        ],
        limits: {
            chatbots: 1,
            messages: 50,
            sources: 2,
        },
    },
    {
        id: "starter",
        name: "Starter",
        price: 29,
        description: "Perfect for small businesses",
        features: [
            "3 Chatbots",
            "2,000 messages/month",
            "Advanced analytics",
            "Email support",
            "Custom branding",
        ],
        limits: {
            chatbots: 3,
            messages: 2000,
            sources: 10,
        },
    },
    {
        id: "pro",
        name: "Pro",
        price: 99,
        description: "For growing companies",
        popular: true,
        features: [
            "10 Chatbots",
            "10,000 messages/month",
            "Priority support",
            "API access",
            "Custom integrations",
            "Team members",
        ],
        limits: {
            chatbots: 10,
            messages: 10000,
            sources: 50,
        },
    },
    {
        id: "business",
        name: "Business",
        price: 299,
        description: "Enterprise-grade features",
        features: [
            "Unlimited Chatbots",
            "50,000 messages/month",
            "24/7 support",
            "SSO & SAML",
            "Custom SLA",
            "Dedicated account manager",
        ],
        limits: {
            chatbots: -1,
            messages: 50000,
            sources: -1,
        },
    },
];

export default function BillingPage() {
    // Mock current plan
    const currentPlan = "free";
    const usage = {
        messages: { used: 45, limit: 50 },
        chatbots: { used: 2, limit: 1 },
        sources: { used: 2, limit: 2 },
    };

    const currentPlanData = plans.find(p => p.id === currentPlan);
    const messagePercentage = (usage.messages.used / usage.messages.limit) * 100;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
                <p className="text-gray-500 mt-1">Manage your subscription and usage</p>
            </div>

            {/* Current Plan */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Current Plan</CardTitle>
                            <CardDescription>You're on the {currentPlanData?.name} plan</CardDescription>
                        </div>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                            {currentPlanData?.name}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Usage Stats */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    Messages
                                </span>
                                <span className="font-medium">
                                    {usage.messages.used} / {usage.messages.limit}
                                </span>
                            </div>
                            <Progress value={messagePercentage} className="h-2" />
                            {messagePercentage > 80 && (
                                <p className="text-xs text-amber-600">
                                    ⚠️ Approaching limit
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-2">
                                    <Bot className="w-4 h-4" />
                                    Chatbots
                                </span>
                                <span className="font-medium">
                                    {usage.chatbots.used} / {usage.chatbots.limit}
                                </span>
                            </div>
                            <Progress
                                value={(usage.chatbots.used / usage.chatbots.limit) * 100}
                                className="h-2"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-2">
                                    <Database className="w-4 h-4" />
                                    Data Sources
                                </span>
                                <span className="font-medium">
                                    {usage.sources.used} / {usage.sources.limit}
                                </span>
                            </div>
                            <Progress
                                value={(usage.sources.used / usage.sources.limit) * 100}
                                className="h-2"
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">
                                Current billing period ends on February 9, 2026
                            </p>
                        </div>
                        <Button variant="outline">
                            View Usage History
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Plans */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {plans.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative ${plan.popular ? 'border-blue-500 border-2' : ''}`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-blue-500">Most Popular</Badge>
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle>{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <span className="text-3xl font-bold">${plan.price}</span>
                                    <span className="text-gray-500">/month</span>
                                </div>

                                <ul className="space-y-2">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm">
                                            <Check className="w-4 h-4 text-green-500 shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className="w-full"
                                    variant={plan.id === currentPlan ? "outline" : "default"}
                                    disabled={plan.id === currentPlan}
                                >
                                    {plan.id === currentPlan ? "Current Plan" : "Upgrade"}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Payment Method */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                    <CardDescription>Add a payment method to upgrade your plan</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-dashed">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">No payment method</p>
                                <p className="text-sm text-gray-500">Add a card to upgrade your plan</p>
                            </div>
                        </div>
                        <Button variant="outline">
                            Add Card
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
                <CardHeader>
                    <CardTitle>Billing FAQ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-medium text-gray-900">What happens when I reach my message limit?</h4>
                        <p className="text-sm text-gray-500 mt-1">
                            Your chatbots will stop responding until the next billing cycle or until you upgrade your plan.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900">Can I downgrade my plan?</h4>
                        <p className="text-sm text-gray-500 mt-1">
                            Yes, you can downgrade at any time. Changes take effect at the start of your next billing cycle.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900">Do you offer refunds?</h4>
                        <p className="text-sm text-gray-500 mt-1">
                            We offer a 14-day money-back guarantee for all paid plans.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
