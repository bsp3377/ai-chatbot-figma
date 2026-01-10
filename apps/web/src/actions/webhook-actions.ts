"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateWebhookSecret } from "@chatbot-ai/shared";

// Type definitions
interface WebhookFormData {
    url: string;
    events: string[];
    description?: string;
}

// Get all webhooks for the current workspace
export async function getWebhooks() {
    const session = await auth();
    if (!session?.user?.workspaceId) {
        throw new Error("Unauthorized");
    }

    const webhooks = await db.webhookEndpoint.findMany({
        where: { workspaceId: session.user.workspaceId },
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { webhookEvents: true },
            },
        },
    });

    return webhooks.map((webhook) => ({
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        description: webhook.description,
        active: webhook.active,
        secret: `***${webhook.secret.slice(-4)}`,
        eventCount: webhook._count.webhookEvents,
        createdAt: webhook.createdAt,
    }));
}

// Create a new webhook endpoint
export async function createWebhook(data: WebhookFormData) {
    const session = await auth();
    if (!session?.user?.workspaceId) {
        throw new Error("Unauthorized");
    }

    // Validate URL
    try {
        new URL(data.url);
    } catch {
        throw new Error("Invalid URL format");
    }

    // Validate events
    if (!data.events || data.events.length === 0) {
        throw new Error("At least one event type is required");
    }

    const secret = generateWebhookSecret();

    const webhook = await db.webhookEndpoint.create({
        data: {
            workspaceId: session.user.workspaceId,
            url: data.url,
            events: data.events as any,
            secret,
            description: data.description || null,
            active: true,
        },
    });

    revalidatePath("/settings");

    return {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        description: webhook.description,
        active: webhook.active,
        secret, // Return full secret only on creation
        createdAt: webhook.createdAt,
    };
}

// Update a webhook endpoint
export async function updateWebhook(
    id: string,
    data: Partial<WebhookFormData & { active: boolean }>
) {
    const session = await auth();
    if (!session?.user?.workspaceId) {
        throw new Error("Unauthorized");
    }

    // Verify ownership
    const existing = await db.webhookEndpoint.findFirst({
        where: { id, workspaceId: session.user.workspaceId },
    });

    if (!existing) {
        throw new Error("Webhook not found");
    }

    const updateData: Record<string, unknown> = {};

    if (data.url !== undefined) {
        try {
            new URL(data.url);
            updateData.url = data.url;
        } catch {
            throw new Error("Invalid URL format");
        }
    }

    if (data.events !== undefined) {
        if (data.events.length === 0) {
            throw new Error("At least one event type is required");
        }
        updateData.events = data.events;
    }

    if (data.description !== undefined) {
        updateData.description = data.description;
    }

    if (data.active !== undefined) {
        updateData.active = data.active;
    }

    await db.webhookEndpoint.update({
        where: { id },
        data: updateData as any,
    });

    revalidatePath("/settings");
    return { success: true };
}

// Delete a webhook endpoint
export async function deleteWebhook(id: string) {
    const session = await auth();
    if (!session?.user?.workspaceId) {
        throw new Error("Unauthorized");
    }

    // Verify ownership
    const existing = await db.webhookEndpoint.findFirst({
        where: { id, workspaceId: session.user.workspaceId },
    });

    if (!existing) {
        throw new Error("Webhook not found");
    }

    await db.webhookEndpoint.delete({
        where: { id },
    });

    revalidatePath("/settings");
    return { success: true };
}

// Regenerate webhook secret
export async function regenerateWebhookSecret(id: string) {
    const session = await auth();
    if (!session?.user?.workspaceId) {
        throw new Error("Unauthorized");
    }

    // Verify ownership
    const existing = await db.webhookEndpoint.findFirst({
        where: { id, workspaceId: session.user.workspaceId },
    });

    if (!existing) {
        throw new Error("Webhook not found");
    }

    const newSecret = generateWebhookSecret();

    await db.webhookEndpoint.update({
        where: { id },
        data: { secret: newSecret },
    });

    revalidatePath("/settings");
    return { secret: newSecret };
}

// Get recent webhook events for an endpoint
export async function getWebhookEvents(webhookId: string, limit = 10) {
    const session = await auth();
    if (!session?.user?.workspaceId) {
        throw new Error("Unauthorized");
    }

    // Verify ownership
    const webhook = await db.webhookEndpoint.findFirst({
        where: { id: webhookId, workspaceId: session.user.workspaceId },
    });

    if (!webhook) {
        throw new Error("Webhook not found");
    }

    const events = await db.webhookEvent.findMany({
        where: { endpointId: webhookId },
        orderBy: { createdAt: "desc" },
        take: limit,
    });

    return events;
}
