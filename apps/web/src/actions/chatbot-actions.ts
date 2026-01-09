'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createChatbot(data: {
    name: string;
    workspaceId?: string;
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
        },
    });

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
