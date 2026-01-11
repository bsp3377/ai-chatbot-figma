import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateWebhookSecret, WEBHOOK_EVENT_TYPES } from '@chatbot-ai/shared';

// GET /api/webhooks - List all webhook endpoints for the workspace
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.workspaceId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const webhooks = await db.webhookEndpoint.findMany({
            where: { workspaceId: session.user.workspaceId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { webhookEvents: true }
                }
            }
        });

        // Remove secrets from response (only show last 4 chars)
        const safeWebhooks = webhooks.map((webhook: { secret: string; _count: { webhookEvents: number };[key: string]: unknown }) => ({
            ...webhook,
            secret: `***${webhook.secret.slice(-4)}`,
            eventCount: webhook._count.webhookEvents,
            _count: undefined,
        }));

        return NextResponse.json({ webhooks: safeWebhooks });
    } catch (error) {
        console.error('Error fetching webhooks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch webhooks' },
            { status: 500 }
        );
    }
}

// POST /api/webhooks - Create a new webhook endpoint
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.workspaceId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { url, events, description } = body;

        // Validate URL
        if (!url || typeof url !== 'string') {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        try {
            new URL(url);
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL format' },
                { status: 400 }
            );
        }

        // Validate events
        if (!events || !Array.isArray(events) || events.length === 0) {
            return NextResponse.json(
                { error: 'At least one event type is required' },
                { status: 400 }
            );
        }

        const validEvents = events.filter((e: string) => (WEBHOOK_EVENT_TYPES as readonly string[]).includes(e));
        if (validEvents.length === 0) {
            return NextResponse.json(
                { error: 'No valid event types provided' },
                { status: 400 }
            );
        }

        // Generate secret
        const secret = generateWebhookSecret();

        // Create webhook endpoint
        const webhook = await db.webhookEndpoint.create({
            data: {
                workspaceId: session.user.workspaceId,
                url,
                events: validEvents,
                secret,
                description: description || null,
                active: true,
            },
        });

        return NextResponse.json({
            webhook: {
                ...webhook,
                secret, // Return full secret only on creation
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating webhook:', error);
        return NextResponse.json(
            { error: 'Failed to create webhook' },
            { status: 500 }
        );
    }
}
