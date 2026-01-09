"use client";

import { useState } from "react";
import { Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ChatbotSettingsPage() {
    const [settings, setSettings] = useState({
        name: "Support Bot",
        welcomeMessage: "Hi! How can I help you today?",
        personality: "friendly",
        language: "en",
        systemPrompt: "",
        leadCaptureEnabled: true,
        leadCaptureFields: ["name", "email"],
        escalationEnabled: false,
        escalationEmail: "",
        onlyInternalKnowledge: true,
    });

    const handleSave = () => {
        console.log("Saving settings:", settings);
        // Show success toast
    };

    return (
        <div className="space-y-6 max-w-3xl">
            {/* General Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Basic chatbot configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Chatbot Name</Label>
                        <Input
                            id="name"
                            value={settings.name}
                            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="welcomeMessage">Welcome Message</Label>
                        <Textarea
                            id="welcomeMessage"
                            value={settings.welcomeMessage}
                            onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Personality</Label>
                            <Select
                                value={settings.personality}
                                onValueChange={(v) => setSettings({ ...settings, personality: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="friendly">Friendly</SelectItem>
                                    <SelectItem value="formal">Professional</SelectItem>
                                    <SelectItem value="casual">Casual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Language</Label>
                            <Select
                                value={settings.language}
                                onValueChange={(v) => setSettings({ ...settings, language: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="es">Spanish</SelectItem>
                                    <SelectItem value="fr">French</SelectItem>
                                    <SelectItem value="de">German</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="systemPrompt">Custom Instructions</Label>
                        <Textarea
                            id="systemPrompt"
                            value={settings.systemPrompt}
                            onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                            placeholder="Add specific instructions for your chatbot..."
                            rows={4}
                        />
                        <p className="text-xs text-gray-500">
                            These instructions help guide your chatbot's behavior
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Lead Capture */}
            <Card>
                <CardHeader>
                    <CardTitle>Lead Capture</CardTitle>
                    <CardDescription>Collect visitor information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Enable Lead Capture</Label>
                            <p className="text-sm text-gray-500">
                                Ask visitors for contact details
                            </p>
                        </div>
                        <Switch
                            checked={settings.leadCaptureEnabled}
                            onCheckedChange={(v) => setSettings({ ...settings, leadCaptureEnabled: v })}
                        />
                    </div>

                    {settings.leadCaptureEnabled && (
                        <div className="space-y-2 pt-2">
                            <Label>Capture Fields</Label>
                            <div className="flex flex-wrap gap-2">
                                {["name", "email", "phone", "company"].map((field) => (
                                    <Button
                                        key={field}
                                        variant={settings.leadCaptureFields.includes(field) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => {
                                            if (settings.leadCaptureFields.includes(field)) {
                                                setSettings({
                                                    ...settings,
                                                    leadCaptureFields: settings.leadCaptureFields.filter((f) => f !== field),
                                                });
                                            } else {
                                                setSettings({
                                                    ...settings,
                                                    leadCaptureFields: [...settings.leadCaptureFields, field],
                                                });
                                            }
                                        }}
                                    >
                                        {field.charAt(0).toUpperCase() + field.slice(1)}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Escalation */}
            <Card>
                <CardHeader>
                    <CardTitle>Human Escalation</CardTitle>
                    <CardDescription>Route conversations to your team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Enable Escalation</Label>
                            <p className="text-sm text-gray-500">
                                Allow visitors to request human support
                            </p>
                        </div>
                        <Switch
                            checked={settings.escalationEnabled}
                            onCheckedChange={(v) => setSettings({ ...settings, escalationEnabled: v })}
                        />
                    </div>

                    {settings.escalationEnabled && (
                        <div className="space-y-2 pt-2">
                            <Label htmlFor="escalationEmail">Escalation Email</Label>
                            <Input
                                id="escalationEmail"
                                type="email"
                                placeholder="support@company.com"
                                value={settings.escalationEmail}
                                onChange={(e) => setSettings({ ...settings, escalationEmail: e.target.value })}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Knowledge Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>Knowledge Settings</CardTitle>
                    <CardDescription>Control what your chatbot knows</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Only Use Internal Knowledge</Label>
                            <p className="text-sm text-gray-500">
                                Prevent chatbot from using external information
                            </p>
                        </div>
                        <Switch
                            checked={settings.onlyInternalKnowledge}
                            onCheckedChange={(v) => setSettings({ ...settings, onlyInternalKnowledge: v })}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Chatbot
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Chatbot</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the chatbot
                                and all associated data including conversations and analytics.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
