import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
    createWebhookPayload,
    deliverWebhook,
} from '@chatbot-ai/shared';

// POST /api/internal/lead-captured - Handle lead capture from widget
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { conversationId, chatbotId, email, name, phone, company } = body;

        if (!chatbotId) {
            return NextResponse.json(
                { error: 'chatbotId is required' },
                { status: 400 }
            );
        }

        if (!email && !phone) {
            return NextResponse.json(
                { error: 'At least email or phone is required' },
                { status: 400 }
            );
        }

        // Get chatbot
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

        // Update conversation with lead info if conversationId provided
        if (conversationId) {
            await db.conversation.update({
                where: { id: conversationId },
                data: {
                    leadEmail: email || undefined,
                    leadName: name || undefined,
                    leadPhone: phone || undefined,
                    leadCompany: company || undefined,
                },
            });
        }

        // Find active webhook endpoints for this event
        const endpoints = await db.webhookEndpoint.findMany({
            where: {
                workspaceId: chatbot.workspaceId,
                active: true,
                events: {
                    has: 'LEAD_CAPTURED',
                },
            },
        });

        // Prepare webhook payload
        const webhookData = {
            chatbotId: chatbot.id,
            chatbotName: chatbot.name,
            conversationId: conversationId || null,
            lead: {
                email: email || null,
                name: name || null,
                phone: phone || null,
                company: company || null,
            },
            capturedAt: new Date().toISOString(),
        };

        let webhooksTriggered = 0;

        // Trigger webhooks
        for (const endpoint of endpoints) {
            const payload = createWebhookPayload('LEAD_CAPTURED', webhookData);

            // Create pending event
            const event = await db.webhookEvent.create({
                data: {
                    endpointId: endpoint.id,
                    type: 'LEAD_CAPTURED',
                    payload: payload as any,
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

            if (result.success) webhooksTriggered++;
        }

        return NextResponse.json({
            success: true,
            leadSaved: !!conversationId,
            webhooksTriggered,
        });
    } catch (error) {
        console.error('Error handling lead capture:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
