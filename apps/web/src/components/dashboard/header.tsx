"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Bell, HelpCircle, ExternalLink, ChevronDown, User, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MobileNav } from "./mobile-nav";

export function Header() {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-white px-4 sm:px-6">
            {/* Mobile menu trigger */}
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild className="lg:hidden">
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-60">
                    <MobileNav onNavigate={() => setMobileNavOpen(false)} />
                </SheetContent>
            </Sheet>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right side actions */}
            <div className="flex items-center gap-2">
                {/* Help */}
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                    <HelpCircle className="h-5 w-5" />
                    <span className="sr-only">Help</span>
                </Button>

                {/* Docs */}
                <Button variant="ghost" size="icon" asChild className="text-gray-500 hover:text-gray-700">
                    <Link href="https://docs.chatbotai.com" target="_blank">
                        <ExternalLink className="h-5 w-5" />
                        <span className="sr-only">Documentation</span>
                    </Link>
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                    <span className="sr-only">Notifications</span>
                </Button>

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 px-2">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">DU</AvatarFallback>
                            </Avatar>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-medium text-gray-900">Demo User</p>
                                <p className="text-xs text-gray-500">demo@chatbotai.com</p>
                            </div>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <div className="px-2 py-1.5 sm:hidden">
                            <p className="text-sm font-medium text-gray-900">Demo User</p>
                            <p className="text-xs text-gray-500">demo@chatbotai.com</p>
                        </div>
                        <DropdownMenuSeparator className="sm:hidden" />
                        <DropdownMenuItem asChild>
                            <Link href="/settings/profile" className="flex items-center">
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="flex items-center">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="text-red-600 focus:text-red-600"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
