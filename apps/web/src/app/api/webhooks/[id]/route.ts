import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
    createWebhookPayload,
    deliverWebhook,
} from '@chatbot-ai/shared';

// GET /api/webhooks/[id] - Get a specific webhook
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.workspaceId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const webhook = await db.webhookEndpoint.findFirst({
            where: {
                id,
                workspaceId: session.user.workspaceId,
            },
            include: {
                webhookEvents: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!webhook) {
            return NextResponse.json(
                { error: 'Webhook not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            webhook: {
                ...webhook,
                secret: `***${webhook.secret.slice(-4)}`,
            },
        });
    } catch (error) {
        console.error('Error fetching webhook:', error);
        return NextResponse.json(
            { error: 'Failed to fetch webhook' },
            { status: 500 }
        );
    }
}

// PATCH /api/webhooks/[id] - Update a webhook
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.workspaceId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { url, events, description, active } = body;

        // Check webhook exists and belongs to workspace
        const existing = await db.webhookEndpoint.findFirst({
            where: {
                id,
                workspaceId: session.user.workspaceId,
            },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Webhook not found' },
                { status: 404 }
            );
        }

        // Build update data
        const updateData: Record<string, unknown> = {};

        if (url !== undefined) {
            try {
                new URL(url);
                updateData.url = url;
            } catch {
                return NextResponse.json(
                    { error: 'Invalid URL format' },
                    { status: 400 }
                );
            }
        }

        if (events !== undefined) {
            if (!Array.isArray(events) || events.length === 0) {
                return NextResponse.json(
                    { error: 'At least one event type is required' },
                    { status: 400 }
                );
            }
            updateData.events = events;
        }

        if (description !== undefined) {
            updateData.description = description;
        }

        if (active !== undefined) {
            updateData.active = Boolean(active);
        }

        const webhook = await db.webhookEndpoint.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({
            webhook: {
                ...webhook,
                secret: `***${webhook.secret.slice(-4)}`,
            },
        });
    } catch (error) {
        console.error('Error updating webhook:', error);
        return NextResponse.json(
            { error: 'Failed to update webhook' },
            { status: 500 }
        );
    }
}

// DELETE /api/webhooks/[id] - Delete a webhook
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.workspaceId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Check webhook exists and belongs to workspace
        const existing = await db.webhookEndpoint.findFirst({
            where: {
                id,
                workspaceId: session.user.workspaceId,
            },
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Webhook not found' },
                { status: 404 }
            );
        }

        await db.webhookEndpoint.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting webhook:', error);
        return NextResponse.json(
            { error: 'Failed to delete webhook' },
            { status: 500 }
        );
    }
}
