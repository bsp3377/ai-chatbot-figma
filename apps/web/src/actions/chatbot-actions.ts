'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { addUrlSource, addTextSource } from './data-source-actions';

export async function createChatbot(data: {
    name: string;
    workspaceId?: string;
    welcomeMessage?: string;
    personality?: string;
    systemPrompt?: string;
    language?: string;
    widgetColor?: string;
    widgetPosition?: string;
    buttonText?: string;
    websiteUrl?: string; // Added
    customText?: string; // Added
}) {
    const session = await auth();
    if (!session?.user?.email) throw new Error('Unauthorized');

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { workspace: true }
    });

    if (!user?.workspaceId) throw new Error('No workspace found');

    const chatbot = await prisma.chatbot.create({
        data: {
            name: data.name,
            workspaceId: user.workspaceId,
            status: 'ACTIVE',
            publicId: crypto.randomUUID(),
            welcomeMessage: data.welcomeMessage,
            personality: data.personality ? data.personality.toUpperCase() as any : 'FRIENDLY',
            systemPrompt: data.systemPrompt,
            language: data.language || 'en',
            widgetConfig: {
                color: data.widgetColor || '#3B82F6',
                position: data.widgetPosition || 'bottom-right',
                buttonText: data.buttonText || 'Chat with us',
            },
        },
    });

    // Add initial data sources
    if (data.websiteUrl) {
        // Run in background / don't block
        // Note: In serverless, we should await or use waitUntil. For V1 validation we await.
        try {
            await addUrlSource(chatbot.id, data.websiteUrl);
        } catch (e) {
            console.error("Failed to add initial website source", e);
        }
    }

    if (data.customText && data.customText.trim().length > 0) {
        try {
            await addTextSource(chatbot.id, "Initial Knowledge Base", data.customText);
        } catch (e) {
            console.error("Failed to add initial text source", e);
        }
    }

    revalidatePath('/chatbots');
    return chatbot;
}

export async function updateChatbot(id: string, data: any) {
    const session = await auth();
    if (!session) throw new Error('Unauthorized');

    await prisma.chatbot.update({
        where: { id },
        data,
    });

    revalidatePath(`/chatbots/${id}`);
    revalidatePath('/chatbots');
}

export async function deleteChatbot(id: string) {
    const session = await auth();
    if (!session) throw new Error('Unauthorized');

    await prisma.chatbot.delete({
        where: { id },
    });

    revalidatePath('/chatbots');
}
