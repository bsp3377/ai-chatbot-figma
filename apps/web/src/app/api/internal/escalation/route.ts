import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
    createWebhookPayload,
    deliverWebhook,
} from '@chatbot-ai/shared';

// POST /api/internal/escalation - Handle escalation request from widget
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { conversationId, visitorEmail, visitorName, reason } = body;

        if (!conversationId) {
            return NextResponse.json(
                { error: 'conversationId is required' },
                { status: 400 }
            );
        }

        // Get conversation with messages and chatbot
        const conversation = await db.conversation.findUnique({
            where: { id: conversationId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                    take: 20, // Last 20 messages
                },
                chatbot: {
                    include: { workspace: true },
                },
            },
        });

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            );
        }

        // Update conversation status to escalated
        await db.conversation.update({
            where: { id: conversationId },
            data: {
                status: 'ESCALATED',
                leadEmail: visitorEmail || undefined,
                leadName: visitorName || undefined,
            },
        });

        // Find active webhook endpoints for this event
        const endpoints = await db.webhookEndpoint.findMany({
            where: {
                workspaceId: conversation.chatbot.workspaceId,
                active: true,
                events: {
                    has: 'ESCALATION_REQUESTED',
                },
            },
        });

        // Prepare webhook payload
        const webhookData = {
            chatbotId: conversation.chatbotId,
            chatbotName: conversation.chatbot.name,
            conversationId: conversation.id,
            visitorId: conversation.visitorId,
            visitorEmail: visitorEmail || null,
            visitorName: visitorName || null,
            reason: reason || 'Visitor requested human support',
            messages: conversation.messages.map((m) => ({
                role: m.role,
                content: m.content,
                createdAt: m.createdAt.toISOString(),
            })),
        };

        let webhooksTriggered = 0;

        // Trigger webhooks
        for (const endpoint of endpoints) {
            const payload = createWebhookPayload('ESCALATION_REQUESTED', webhookData);

            // Create pending event
            const event = await db.webhookEvent.create({
                data: {
                    endpointId: endpoint.id,
                    type: 'ESCALATION_REQUESTED',
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

        // TODO: Send email notification to escalation email if configured
        // if (conversation.chatbot.escalationEmail) {
        //     await sendEscalationEmail(conversation.chatbot.escalationEmail, webhookData);
        // }

        return NextResponse.json({
            success: true,
            conversationUpdated: true,
            webhooksTriggered,
        });
    } catch (error) {
        console.error('Error handling escalation:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
