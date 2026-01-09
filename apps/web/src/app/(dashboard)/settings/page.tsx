"use client";

import { useState } from "react";
import {
    User,
    Building2,
    Shield,
    Bell,
    Users,
    Key,
    Save,
    Upload,
    LogOut
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
    const [profile, setProfile] = useState({
        name: "Demo User",
        email: "demo@chatbotai.com",
        avatar: "",
    });

    const [workspace, setWorkspace] = useState({
        name: "Demo Workspace",
        slug: "demo",
    });

    const [notifications, setNotifications] = useState({
        emailDigest: true,
        chatAlerts: false,
        marketingEmails: false,
        securityAlerts: true,
    });

    // Mock team members
    const teamMembers = [
        { id: "1", name: "Demo User", email: "demo@chatbotai.com", role: "Owner", avatar: "" },
        { id: "2", name: "Jane Smith", email: "jane@example.com", role: "Admin", avatar: "" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 mt-1">Manage your account and workspace</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="profile" className="gap-2">
                        <User className="w-4 h-4" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="workspace" className="gap-2">
                        <Building2 className="w-4 h-4" />
                        Workspace
                    </TabsTrigger>
                    <TabsTrigger value="team" className="gap-2">
                        <Users className="w-4 h-4" />
                        Team
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="w-4 h-4" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="security" className="gap-2">
                        <Shield className="w-4 h-4" />
                        Security
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Settings</CardTitle>
                            <CardDescription>Update your personal information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <Avatar className="w-20 h-20">
                                    <AvatarImage src={profile.avatar} />
                                    <AvatarFallback className="text-xl">
                                        {profile.name.split(" ").map(n => n[0]).join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <Button variant="outline" size="sm">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Upload Photo
                                    </Button>
                                    <p className="text-xs text-gray-500 mt-1">
                                        JPG, PNG or GIF. Max 2MB.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input
                                        id="name"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Workspace Tab */}
                <TabsContent value="workspace">
                    <Card>
                        <CardHeader>
                            <CardTitle>Workspace Settings</CardTitle>
                            <CardDescription>Manage your workspace details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="workspaceName">Workspace Name</Label>
                                    <Input
                                        id="workspaceName"
                                        value={workspace.name}
                                        onChange={(e) => setWorkspace({ ...workspace, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug">Workspace URL</Label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-gray-50 text-gray-500 text-sm">
                                            chatbotai.com/
                                        </span>
                                        <Input
                                            id="slug"
                                            value={workspace.slug}
                                            onChange={(e) => setWorkspace({ ...workspace, slug: e.target.value })}
                                            className="rounded-l-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mt-6 border-red-200">
                        <CardHeader>
                            <CardTitle className="text-red-600">Danger Zone</CardTitle>
                            <CardDescription>Irreversible actions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Delete Workspace</p>
                                    <p className="text-sm text-gray-500">
                                        Permanently delete this workspace and all data
                                    </p>
                                </div>
                                <Button variant="destructive">Delete Workspace</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Team Tab */}
                <TabsContent value="team">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Team Members</CardTitle>
                                    <CardDescription>Manage who has access to this workspace</CardDescription>
                                </div>
                                <Button>
                                    <Users className="w-4 h-4 mr-2" />
                                    Invite Member
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {teamMembers.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-4 rounded-lg border"
                                    >
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage src={member.avatar} />
                                                <AvatarFallback>
                                                    {member.name.split(" ").map(n => n[0]).join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-gray-900">{member.name}</p>
                                                <p className="text-sm text-gray-500">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant={member.role === "Owner" ? "default" : "secondary"}>
                                                {member.role}
                                            </Badge>
                                            {member.role !== "Owner" && (
                                                <Button variant="ghost" size="sm" className="text-red-600">
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>Control how you receive notifications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Weekly Digest</p>
                                    <p className="text-sm text-gray-500">
                                        Receive a weekly summary of your chatbot performance
                                    </p>
                                </div>
                                <Switch
                                    checked={notifications.emailDigest}
                                    onCheckedChange={(v) => setNotifications({ ...notifications, emailDigest: v })}
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Chat Alerts</p>
                                    <p className="text-sm text-gray-500">
                                        Get notified when visitors request human support
                                    </p>
                                </div>
                                <Switch
                                    checked={notifications.chatAlerts}
                                    onCheckedChange={(v) => setNotifications({ ...notifications, chatAlerts: v })}
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Marketing Emails</p>
                                    <p className="text-sm text-gray-500">
                                        Receive product updates and tips
                                    </p>
                                </div>
                                <Switch
                                    checked={notifications.marketingEmails}
                                    onCheckedChange={(v) => setNotifications({ ...notifications, marketingEmails: v })}
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">Security Alerts</p>
                                    <p className="text-sm text-gray-500">
                                        Get notified about security events on your account
                                    </p>
                                </div>
                                <Switch
                                    checked={notifications.securityAlerts}
                                    onCheckedChange={(v) => setNotifications({ ...notifications, securityAlerts: v })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Tab */}
                <TabsContent value="security">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Password</CardTitle>
                                <CardDescription>Change your password</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input id="currentPassword" type="password" />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <Input id="newPassword" type="password" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <Input id="confirmPassword" type="password" />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button>
                                        <Key className="w-4 h-4 mr-2" />
                                        Update Password
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Sessions</CardTitle>
                                <CardDescription>Manage your active sessions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-lg border">
                                        <div>
                                            <p className="font-medium text-gray-900">Current Session</p>
                                            <p className="text-sm text-gray-500">
                                                Chrome on macOS · Last active now
                                            </p>
                                        </div>
                                        <Badge className="bg-green-100 text-green-700">Active</Badge>
                                    </div>
                                </div>
                                <Button variant="outline" className="mt-4">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign out all other sessions
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>API Keys</CardTitle>
                                <CardDescription>Manage API keys for integrations</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 rounded-lg border border-dashed text-center">
                                    <Key className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500 mb-4">No API keys created yet</p>
                                    <Button variant="outline">Create API Key</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
