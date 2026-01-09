"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Bot,
    Database,
    BarChart3,
    CreditCard,
    Settings,
    ChevronUp,
    LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Chatbots", href: "/chatbots", icon: Bot },
    { name: "Data Sources", href: "/data-sources", icon: Database },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

const secondaryNavigation = [
    { name: "Billing", href: "/billing", icon: CreditCard },
    { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-60 lg:flex-col">
            <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-4 py-5">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center gap-2 px-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">ChatBot AI</span>
                </Link>

                {/* Main Navigation */}
                <nav className="flex flex-1 flex-col">
                    <ul className="flex flex-1 flex-col gap-y-7">
                        <li>
                            <ul className="-mx-2 space-y-1">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                                    return (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    "group flex gap-x-3 rounded-lg p-2.5 text-sm font-medium transition-colors",
                                                    isActive
                                                        ? "bg-blue-50 text-blue-600"
                                                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                                )}
                                            >
                                                <item.icon
                                                    className={cn(
                                                        "h-5 w-5 shrink-0",
                                                        isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                                                    )}
                                                />
                                                {item.name}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </li>

                        <li className="border-t border-gray-200 pt-4">
                            <ul className="-mx-2 space-y-1">
                                {secondaryNavigation.map((item) => {
                                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                                    return (
                                        <li key={item.name}>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    "group flex gap-x-3 rounded-lg p-2.5 text-sm font-medium transition-colors",
                                                    isActive
                                                        ? "bg-blue-50 text-blue-600"
                                                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                                )}
                                            >
                                                <item.icon
                                                    className={cn(
                                                        "h-5 w-5 shrink-0",
                                                        isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"
                                                    )}
                                                />
                                                {item.name}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </li>

                        {/* Usage indicator */}
                        <li className="mt-auto">
                            <div className="rounded-lg bg-gray-50 p-3">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-gray-600">Usage this month</span>
                                    <span className="font-medium text-gray-900">45/50</span>
                                </div>
                                <Progress value={90} className="h-1.5" />
                                <p className="mt-2 text-xs text-gray-500">
                                    90% of your free plan used
                                </p>
                                <Button size="sm" className="w-full mt-3">
                                    <ChevronUp className="w-4 h-4 mr-1" />
                                    Upgrade Plan
                                </Button>
                            </div>
                        </li>

                        {/* Sign out */}
                        <li className="-mx-2">
                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="group flex w-full gap-x-3 rounded-lg p-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                            >
                                <LogOut className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-gray-600" />
                                Sign out
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>
    );
}
