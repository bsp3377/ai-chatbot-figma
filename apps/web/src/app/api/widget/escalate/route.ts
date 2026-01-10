import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createWebhookPayload, deliverWebhook } from '@chatbot-ai/shared';
import { sendEscalationEmail } from '@/lib/email';

// POST /api/widget/escalate - Request human support (PUBLIC)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { conversationId, email, name, reason } = body;

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
                    take: 30,
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

        // Update conversation status to ESCALATED
        await db.conversation.update({
            where: { id: conversationId },
            data: {
                status: 'ESCALATED',
                leadEmail: email || undefined,
                leadName: name || undefined,
            },
        });

        // Find active webhook endpoints for ESCALATION_REQUESTED
        const endpoints = await db.webhookEndpoint.findMany({
            where: {
                workspaceId: conversation.chatbot.workspaceId,
                active: true,
                events: { has: 'ESCALATION_REQUESTED' },
            },
        });

        // Prepare webhook payload with chat transcript
        const webhookData = {
            chatbotId: conversation.chatbotId,
            chatbotName: conversation.chatbot.name,
            conversationId: conversation.id,
            visitorId: conversation.visitorId,
            visitorEmail: email || null,
            visitorName: name || null,
            reason: reason || 'Visitor requested human support',
            messages: conversation.messages.map((m) => ({
                role: m.role,
                content: m.content,
                createdAt: m.createdAt.toISOString(),
            })),
        };

        // Trigger webhooks asynchronously
        for (const endpoint of endpoints) {
            const payload = createWebhookPayload('ESCALATION_REQUESTED', webhookData);

            db.webhookEvent.create({
                data: {
                    endpointId: endpoint.id,
                    type: 'ESCALATION_REQUESTED',
                    payload: payload as any,
                    status: 'PENDING',
                },
            }).then(async (event) => {
                const result = await deliverWebhook({
                    url: endpoint.url,
                    secret: endpoint.secret,
                    payload,
                });
                await db.webhookEvent.update({
                    where: { id: event.id },
                    data: {
                        status: result.success ? 'SENT' : 'FAILED',
                        attempts: 1,
                        lastError: result.error || null,
                        sentAt: result.success ? new Date() : null,
                    },
                });
            }).catch(console.error);
        }

        // Send email notification if escalationEmail is configured
        if (conversation.chatbot.escalationEmail && email) {
            sendEscalationEmail({
                to: conversation.chatbot.escalationEmail,
                chatbotName: conversation.chatbot.name,
                visitorEmail: email,
                visitorName: name,
                conversationId: conversation.id,
                messages: conversation.messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                    createdAt: m.createdAt.toISOString(),
                })),
            }).catch(console.error);
        }

        return NextResponse.json({
            success: true,
            message: 'Escalation request received. Our team will reach out shortly.',
        });
    } catch (error) {
        console.error('Escalation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
