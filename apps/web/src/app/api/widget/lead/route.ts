import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createWebhookPayload, deliverWebhook } from '@chatbot-ai/shared';

// POST /api/widget/lead - Capture lead information from widget (PUBLIC)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { chatbotId, conversationId, visitorId, email, name, phone, company } = body;

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

        // Find chatbot by publicId
        const chatbot = await db.chatbot.findFirst({
            where: { publicId: chatbotId },
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

        // Find active webhook endpoints for LEAD_CAPTURED
        const endpoints = await db.webhookEndpoint.findMany({
            where: {
                workspaceId: chatbot.workspaceId,
                active: true,
                events: { has: 'LEAD_CAPTURED' },
            },
        });

        // Trigger webhooks
        const webhookData = {
            chatbotId: chatbot.id,
            chatbotName: chatbot.name,
            conversationId: conversationId || null,
            lead: { email, name, phone, company },
            capturedAt: new Date().toISOString(),
        };

        for (const endpoint of endpoints) {
            const payload = createWebhookPayload('LEAD_CAPTURED', webhookData);

            // Create event and deliver async
            db.webhookEvent.create({
                data: {
                    endpointId: endpoint.id,
                    type: 'LEAD_CAPTURED',
                    payload: payload as any,
                    status: 'PENDING',
                },
            }).then(async (event: { id: string }) => {
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

        return NextResponse.json({
            success: true,
            message: 'Lead captured successfully',
        });
    } catch (error) {
        console.error('Lead capture error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
