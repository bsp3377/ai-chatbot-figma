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
    LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

import { cn } from "@/lib/utils";

const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Chatbots", href: "/chatbots", icon: Bot },
    { name: "Data Sources", href: "/sources", icon: Database },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

const secondaryNavigation = [
    { name: "Billing", href: "/billing", icon: CreditCard },
    { name: "Settings", href: "/settings", icon: Settings },
];

interface MobileNavProps {
    onNavigate?: () => void;
}

export function MobileNav({ onNavigate }: MobileNavProps) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-2 px-4 py-5 border-b">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">ChatBot AI</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-4 overflow-y-auto">
                <ul className="space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    onClick={onNavigate}
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

                <div className="mt-6 pt-6 border-t">
                    <ul className="space-y-1">
                        {secondaryNavigation.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        onClick={onNavigate}
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
                </div>
            </nav>

            {/* Sign out */}
            <div className="px-2 py-4 border-t">
                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="group flex w-full gap-x-3 rounded-lg p-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                    <LogOut className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-gray-600" />
                    Sign out
                </button>
            </div>
        </div>
    );
}
