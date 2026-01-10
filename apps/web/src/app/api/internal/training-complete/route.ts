import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
    createWebhookPayload,
    deliverWebhook,
    WebhookEventType,
} from '@chatbot-ai/shared';

// Internal API key for background jobs (should be set in env)
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'internal-secret-key';

// Verify internal API key
function verifyInternalRequest(request: NextRequest): boolean {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return false;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' && token === INTERNAL_API_KEY;
}

// Trigger webhooks for a workspace and event type
async function triggerWebhooks(
    workspaceId: string,
    eventType: WebhookEventType,
    data: Record<string, unknown>
) {
    // Find active webhook endpoints for this event
    const endpoints = await db.webhookEndpoint.findMany({
        where: {
            workspaceId,
            active: true,
            events: {
                has: eventType,
            },
        },
    });

    if (endpoints.length === 0) {
        return { triggered: 0, results: [] };
    }

    const payload = createWebhookPayload(eventType, data);
    const results = [];

    for (const endpoint of endpoints) {
        // Create pending event
        const event = await db.webhookEvent.create({
            data: {
                endpointId: endpoint.id,
                type: eventType,
                payload: payload as unknown as Record<string, unknown>,
                status: 'PENDING',
            },
        });

        // Attempt delivery
        const result = await deliverWebhook({
            url: endpoint.url,
            secret: endpoint.secret,
            payload,
        });

        // Update event status
        await db.webhookEvent.update({
            where: { id: event.id },
            data: {
                status: result.success ? 'SENT' : 'FAILED',
                attempts: 1,
                lastError: result.error || null,
                sentAt: result.success ? new Date() : null,
            },
        });

        results.push({
            endpointId: endpoint.id,
            success: result.success,
            error: result.error,
        });
    }

    return { triggered: endpoints.length, results };
}

// POST /api/internal/training-complete
export async function POST(request: NextRequest) {
    // Verify internal request (for production, use proper auth)
    // For now, allow any request but log warning
    const isInternal = verifyInternalRequest(request);
    if (!isInternal) {
        console.warn('Internal API called without proper auth');
    }

    try {
        const body = await request.json();
        const { chatbotId, success, error: errorMessage, chunksCreated, duration } = body;

        if (!chatbotId) {
            return NextResponse.json(
                { error: 'chatbotId is required' },
                { status: 400 }
            );
        }

        // Get chatbot and workspace
        const chatbot = await db.chatbot.findUnique({
            where: { id: chatbotId },
            include: { workspace: true },
        });

        if (!chatbot) {
            return NextResponse.json(
                { error: 'Chatbot not found' },
                { status: 404 }
            );
        }

        // Update chatbot status
        await db.chatbot.update({
            where: { id: chatbotId },
            data: {
                status: success ? 'ACTIVE' : 'ERROR',
                lastTrainedAt: success ? new Date() : undefined,
            },
        });

        // Trigger webhooks
        const eventType = success ? 'TRAINING_COMPLETE' : 'TRAINING_FAILED';
        const webhookData = success
            ? {
                chatbotId,
                chatbotName: chatbot.name,
                chunksCreated: chunksCreated || 0,
                duration: duration || 0,
            }
            : {
                chatbotId,
                chatbotName: chatbot.name,
                error: errorMessage || 'Unknown error',
            };

        const webhookResult = await triggerWebhooks(
            chatbot.workspaceId,
            eventType,
            webhookData
        );

        return NextResponse.json({
            success: true,
            chatbotUpdated: true,
            webhooksTriggered: webhookResult.triggered,
        });
    } catch (error) {
        console.error('Error handling training complete:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
