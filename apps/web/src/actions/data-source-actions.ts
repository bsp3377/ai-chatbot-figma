'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { crawlUrl } from '@/lib/crawler'; // Keep local crawler for now, or move to AI package? Keep local as it depends on cheerio which might be web-specific or not.
import { chunkText, generateEmbeddings, vectorStore } from '@chatbot-ai/ai';
import { revalidatePath } from 'next/cache';

export async function addUrlSource(chatbotId: string, url: string) {
    const session = await auth();
    if (!session) throw new Error('Unauthorized');

    // Verify ownership
    const chatbot = await prisma.chatbot.findUnique({
        where: { id: chatbotId },
        include: { workspace: true },
    });
    if (!chatbot) throw new Error('Chatbot not found');

    // Create source entry
    const source = await prisma.dataSource.create({
        data: {
            workspaceId: chatbot.workspaceId,
            type: 'WEBSITE',
            name: url,
            status: 'PROCESSING',
            config: { url },
        },
    });

    // Link to chatbot
    await prisma.chatbotDataSource.create({
        data: {
            chatbotId,
            dataSourceId: source.id,
        },
    });

    // Start processing (async but awaited here for simplicity in this V1)
    try {
        const { title, content } = await crawlUrl(url);

        // Update name with title
        await prisma.dataSource.update({
            where: { id: source.id },
            data: { name: title || url },
        });

        // Use AI package for chunking
        const chunks = await chunkText(content);

        // Generate embeddings in batch
        const embeddings = await generateEmbeddings(chunks);

        // Prepare entries for vector store
        const vectorEntries = chunks.map((chunk, index) => ({
            id: crypto.randomUUID(),
            vector: embeddings[index],
            content: chunk,
            metadata: { url, title, chunkIndex: index },
            dataSourceId: source.id,
        }));

        await vectorStore.upsert(vectorEntries);

        await prisma.dataSource.update({
            where: { id: source.id },
            data: { status: 'READY', lastSyncedAt: new Date() },
        });

        // Update chatbot last trained
        await prisma.chatbot.update({
            where: { id: chatbotId },
            data: { lastTrainedAt: new Date(), status: 'ACTIVE' },
        });

    } catch (error) {
        console.error('Processing failed:', error);
        await prisma.dataSource.update({
            where: { id: source.id },
            data: { status: 'ERROR', errorMessage: (error as Error).message },
        });
    }

    revalidatePath(`/chatbots/${chatbotId}/knowledge`);
}

export async function addTextSource(chatbotId: string, title: string, content: string) {
    const session = await auth();
    if (!session) throw new Error('Unauthorized');

    const chatbot = await prisma.chatbot.findUnique({
        where: { id: chatbotId },
        include: { workspace: true },
    });
    if (!chatbot) throw new Error('Chatbot not found');

    const source = await prisma.dataSource.create({
        data: {
            workspaceId: chatbot.workspaceId,
            type: 'TEXT',
            name: title,
            status: 'PROCESSING',
        },
    });

    await prisma.chatbotDataSource.create({
        data: {
            chatbotId,
            dataSourceId: source.id,
        },
    });

    try {
        const chunks = await chunkText(content);
        const embeddings = await generateEmbeddings(chunks);

        const vectorEntries = chunks.map((chunk, index) => ({
            id: crypto.randomUUID(),
            vector: embeddings[index],
            content: chunk,
            metadata: { title, chunkIndex: index },
            dataSourceId: source.id
        }));

        await vectorStore.upsert(vectorEntries);

        await prisma.dataSource.update({
            where: { id: source.id },
            data: { status: 'READY', lastSyncedAt: new Date() },
        });

        await prisma.chatbot.update({
            where: { id: chatbotId },
            data: { lastTrainedAt: new Date(), status: 'ACTIVE' },
        });

    } catch (error) {
        await prisma.dataSource.update({
            where: { id: source.id },
            data: { status: 'ERROR', errorMessage: (error as Error).message },
        });
    }

    revalidatePath(`/chatbots/${chatbotId}/knowledge`);
}

export async function deleteSource(sourceId: string, chatbotId: string) {
    const session = await auth();
    if (!session) throw new Error('Unauthorized');

    // Clean up vectors
    await vectorStore.delete({ dataSourceId: sourceId });

    await prisma.dataSource.delete({
        where: { id: sourceId }
    });

    revalidatePath(`/chatbots/${chatbotId}/knowledge`);
}
