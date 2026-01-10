import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { createWebhookPayload, deliverWebhook } from '@chatbot-ai/shared';

// POST /api/webhooks/[id]/test - Send a test webhook
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.workspaceId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Get webhook endpoint
        const webhook = await db.webhookEndpoint.findFirst({
            where: {
                id,
                workspaceId: session.user.workspaceId,
            },
        });

        if (!webhook) {
            return NextResponse.json(
                { error: 'Webhook not found' },
                { status: 404 }
            );
        }

        // Create test payload
        const testPayload = createWebhookPayload('TRAINING_COMPLETE', {
            test: true,
            chatbotId: 'test_chatbot_123',
            chatbotName: 'Test Chatbot',
            chunksCreated: 42,
            duration: 5000,
            message: 'This is a test webhook delivery',
        });

        // Deliver webhook
        const result = await deliverWebhook({
            url: webhook.url,
            secret: webhook.secret,
            payload: testPayload,
            timeoutMs: 10000, // Longer timeout for test
        });

        // Log the test event
        await db.webhookEvent.create({
            data: {
                endpointId: webhook.id,
                type: 'TRAINING_COMPLETE',
                payload: testPayload as unknown as Record<string, unknown>,
                status: result.success ? 'SENT' : 'FAILED',
                attempts: 1,
                lastError: result.error || null,
                sentAt: result.success ? new Date() : null,
            },
        });

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Test webhook delivered successfully',
                statusCode: result.statusCode,
                responseTime: result.responseTime,
            });
        }

        return NextResponse.json({
            success: false,
            error: result.error,
            statusCode: result.statusCode,
            responseTime: result.responseTime,
        }, { status: 400 });
    } catch (error) {
        console.error('Error testing webhook:', error);
        return NextResponse.json(
            { error: 'Failed to test webhook' },
            { status: 500 }
        );
    }
}
