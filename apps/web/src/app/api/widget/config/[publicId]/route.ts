import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/widget/config/[publicId] - Get chatbot config for widget (PUBLIC)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ publicId: string }> }
) {
    try {
        const { publicId } = await params;

        // Find chatbot by publicId
        const chatbot = await db.chatbot.findFirst({
            where: {
                publicId,
                status: 'ACTIVE',
            },
            select: {
                id: true,
                publicId: true,
                name: true,
                welcomeMessage: true,
                personality: true,
                language: true,
                widgetConfig: true,
                leadCaptureEnabled: true,
                leadCaptureFields: true,
                escalationEnabled: true,
            },
        });

        if (!chatbot) {
            return NextResponse.json(
                { error: 'Chatbot not found or inactive' },
                { status: 404 }
            );
        }

        // Parse widget config
        const widgetConfig = chatbot.widgetConfig as Record<string, unknown> || {};

        return NextResponse.json({
            id: chatbot.publicId,
            name: chatbot.name,
            welcomeMessage: chatbot.welcomeMessage || 'Hi! How can I help you today?',
            personality: chatbot.personality,
            language: chatbot.language || 'en',
            color: widgetConfig.color || '#3B82F6',
            position: widgetConfig.position || 'bottom-right',
            buttonText: widgetConfig.buttonText || 'Chat with us',
            leadCapture: {
                enabled: chatbot.leadCaptureEnabled || false,
                fields: chatbot.leadCaptureFields || [],
            },
            escalation: {
                enabled: chatbot.escalationEnabled || false,
            },
        });
    } catch (error) {
        console.error('Error fetching widget config:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
