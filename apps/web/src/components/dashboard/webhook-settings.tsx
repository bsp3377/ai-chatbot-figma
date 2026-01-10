"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Webhook,
    MoreHorizontal,
    Send,
    Copy,
    Trash2,
    Check,
    Loader2,
    ExternalLink,
    CheckCircle,
    XCircle,
    RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
    createWebhook,
    deleteWebhook,
    getWebhooks,
    updateWebhook,
    regenerateWebhookSecret,
} from "@/actions/webhook-actions";
import { WEBHOOK_EVENT_DESCRIPTIONS } from "@chatbot-ai/shared";

// Event descriptions for display
const EVENT_TYPES = [
    { id: "TRAINING_COMPLETE", label: "Training Complete", description: "When a chatbot finishes training" },
    { id: "TRAINING_FAILED", label: "Training Failed", description: "When training encounters an error" },
    { id: "CONVERSATION_NEW", label: "New Conversation", description: "When a visitor starts a new chat" },
    { id: "ESCALATION_REQUESTED", label: "Escalation Requested", description: "When a visitor requests human support" },
    { id: "LEAD_CAPTURED", label: "Lead Captured", description: "When a visitor submits contact info" },
];

interface WebhookData {
    id: string;
    url: string;
    events: string[];
    description: string | null;
    active: boolean;
    secret: string;
    eventCount: number;
    createdAt: Date;
}

export function WebhookSettings() {
    const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [testingId, setTestingId] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

    // Form state
    const [formUrl, setFormUrl] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formEvents, setFormEvents] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [newSecret, setNewSecret] = useState<string | null>(null);
    const [copiedSecret, setCopiedSecret] = useState(false);

    // Load webhooks
    useEffect(() => {
        loadWebhooks();
    }, []);

    async function loadWebhooks() {
        try {
            setIsLoading(true);
            const data = await getWebhooks();
            setWebhooks(data);
        } catch (error) {
            console.error("Failed to load webhooks:", error);
        } finally {
            setIsLoading(false);
        }
    }

    // Reset form
    function resetForm() {
        setFormUrl("");
        setFormDescription("");
        setFormEvents([]);
        setFormError(null);
        setNewSecret(null);
        setCopiedSecret(false);
    }

    // Handle create
    async function handleCreate() {
        setFormError(null);

        if (!formUrl) {
            setFormError("URL is required");
            return;
        }

        if (formEvents.length === 0) {
            setFormError("Select at least one event type");
            return;
        }

        try {
            setIsSubmitting(true);
            const result = await createWebhook({
                url: formUrl,
                events: formEvents,
                description: formDescription || undefined,
            });
            setNewSecret(result.secret);
            await loadWebhooks();
        } catch (error) {
            setFormError(error instanceof Error ? error.message : "Failed to create webhook");
        } finally {
            setIsSubmitting(false);
        }
    }

    // Handle delete
    async function handleDelete() {
        if (!deleteId) return;

        try {
            await deleteWebhook(deleteId);
            await loadWebhooks();
        } catch (error) {
            console.error("Failed to delete webhook:", error);
        } finally {
            setDeleteId(null);
        }
    }

    // Handle toggle active
    async function handleToggleActive(id: string, active: boolean) {
        try {
            await updateWebhook(id, { active: !active });
            await loadWebhooks();
        } catch (error) {
            console.error("Failed to update webhook:", error);
        }
    }

    // Handle test
    async function handleTest(id: string) {
        setTestingId(id);
        setTestResult(null);

        try {
            const response = await fetch(`/api/webhooks/${id}/test`, {
                method: "POST",
            });
            const data = await response.json();

            setTestResult({
                id,
                success: data.success,
                message: data.success ? "Test webhook delivered successfully!" : data.error || "Failed to deliver webhook",
            });
        } catch (error) {
            setTestResult({
                id,
                success: false,
                message: "Network error",
            });
        } finally {
            setTestingId(null);
        }
    }

    // Copy to clipboard
    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text);
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
    }

    // Toggle event selection
    function toggleEvent(eventId: string) {
        setFormEvents((prev) =>
            prev.includes(eventId) ? prev.filter((e) => e !== eventId) : [...prev, eventId]
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Webhooks</CardTitle>
                            <CardDescription>
                                Receive real-time notifications when events happen
                            </CardDescription>
                        </div>
                        <Dialog
                            open={isCreateOpen}
                            onOpenChange={(open) => {
                                setIsCreateOpen(open);
                                if (!open) resetForm();
                            }}
                        >
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Webhook
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Add Webhook Endpoint</DialogTitle>
                                    <DialogDescription>
                                        Configure a URL to receive event notifications
                                    </DialogDescription>
                                </DialogHeader>

                                {newSecret ? (
                                    // Success state - show secret
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <span className="text-sm text-green-800">
                                                Webhook created successfully!
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Signing Secret</Label>
                                            <p className="text-xs text-gray-500">
                                                Save this secret! You won't be able to see it again.
                                            </p>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={newSecret}
                                                    readOnly
                                                    className="font-mono text-sm"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => copyToClipboard(newSecret)}
                                                >
                                                    {copiedSecret ? (
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        <DialogFooter>
                                            <Button onClick={() => {
                                                setIsCreateOpen(false);
                                                resetForm();
                                            }}>
                                                Done
                                            </Button>
                                        </DialogFooter>
                                    </div>
                                ) : (
                                    // Form state
                                    <div className="space-y-4">
                                        {formError && (
                                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                                                {formError}
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="url">Endpoint URL</Label>
                                            <Input
                                                id="url"
                                                placeholder="https://your-app.com/webhook"
                                                value={formUrl}
                                                onChange={(e) => setFormUrl(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description (optional)</Label>
                                            <Input
                                                id="description"
                                                placeholder="e.g., Production webhook"
                                                value={formDescription}
                                                onChange={(e) => setFormDescription(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <Label>Events to receive</Label>
                                            <div className="space-y-2">
                                                {EVENT_TYPES.map((event) => (
                                                    <div
                                                        key={event.id}
                                                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50"
                                                    >
                                                        <Checkbox
                                                            id={event.id}
                                                            checked={formEvents.includes(event.id)}
                                                            onCheckedChange={() => toggleEvent(event.id)}
                                                        />
                                                        <label
                                                            htmlFor={event.id}
                                                            className="flex-1 cursor-pointer"
                                                        >
                                                            <p className="text-sm font-medium">{event.label}</p>
                                                            <p className="text-xs text-gray-500">{event.description}</p>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setIsCreateOpen(false);
                                                    resetForm();
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button onClick={handleCreate} disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Creating...
                                                    </>
                                                ) : (
                                                    "Create Webhook"
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {webhooks.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg border-dashed">
                            <Webhook className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-2">No webhook endpoints configured</p>
                            <p className="text-sm text-gray-400 mb-4">
                                Add a webhook to receive real-time notifications
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {webhooks.map((webhook) => (
                                <div
                                    key={webhook.id}
                                    className="flex items-center justify-between p-4 rounded-lg border"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className={`w-2 h-2 rounded-full ${webhook.active ? "bg-green-500" : "bg-gray-300"}`} />
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-gray-900 truncate">
                                                    {webhook.url}
                                                </p>
                                                <ExternalLink className="w-3 h-3 text-gray-400 shrink-0" />
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {webhook.events.length} event{webhook.events.length !== 1 ? "s" : ""} •
                                                {" "}{webhook.eventCount} deliveries
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {testResult?.id === webhook.id && (
                                            <Badge
                                                variant={testResult.success ? "default" : "destructive"}
                                                className={testResult.success ? "bg-green-100 text-green-700" : ""}
                                            >
                                                {testResult.success ? (
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                ) : (
                                                    <XCircle className="w-3 h-3 mr-1" />
                                                )}
                                                {testResult.success ? "Delivered" : "Failed"}
                                            </Badge>
                                        )}

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleTest(webhook.id)}
                                            disabled={testingId === webhook.id}
                                        >
                                            {testingId === webhook.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 mr-1" />
                                                    Test
                                                </>
                                            )}
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => handleToggleActive(webhook.id, webhook.active)}
                                                >
                                                    {webhook.active ? "Disable" : "Enable"}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => setDeleteId(webhook.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this webhook endpoint? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
