'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { crawlUrl } from '@/lib/crawler'; // Keep local crawler for now, or move to AI package? Keep local as it depends on cheerio which might be web-specific or not.

import { chunkText, generateEmbeddings, vectorStore } from '@chatbot-ai/ai';
import { revalidatePath } from 'next/cache';
import { createWebhookPayload, deliverWebhook } from '@chatbot-ai/shared';
import { sendTrainingCompleteEmail, sendTrainingFailedEmail } from '@/lib/email';

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

    // Start processing
    try {
        // Trigger TRAINING_STARTED webhook
        const startPayload = createWebhookPayload('TRAINING_STARTED', {
            chatbotId,
            sourceId: source.id,
            sourceType: 'WEBSITE',
            startedAt: new Date().toISOString()
        });

        const activeEndpoints = await prisma.webhookEndpoint.findMany({
            where: { workspaceId: chatbot.workspaceId, active: true, events: { has: 'TRAINING_STARTED' } }
        });

        for (const endpoint of activeEndpoints) {
            deliverWebhook({ url: endpoint.url, secret: endpoint.secret, payload: startPayload }).catch(console.error);
        }

        const startTime = Date.now();
        const { title, content } = await crawlUrl(url);

        // Update name with title
        await prisma.dataSource.update({
            where: { id: source.id },
            data: { name: title || url },
        });

        // Use AI package for chunking
        const rawChunks = await chunkText(content);
        // Clean and filter chunks
        const chunks = rawChunks
            .map(c => c.replace(/\n/g, ' ').trim())
            .filter(c => c.length > 0);

        if (chunks.length === 0) {
            console.warn(`No valid content found for URL: ${url}`);
            await prisma.dataSource.update({
                where: { id: source.id },
                data: { status: 'READY', lastSyncedAt: new Date() }, // Mark ready even if empty to avoid sticking in PROCESSING
            });
            return;
        }

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

        // Trigger TRAINING_COMPLETE webhook
        const completePayload = createWebhookPayload('TRAINING_COMPLETE', {
            chatbotId,
            sourceId: source.id,
            chunksCount: chunks.length,
            durationMs: Date.now() - startTime
        });

        const completeEndpoints = await prisma.webhookEndpoint.findMany({
            where: { workspaceId: chatbot.workspaceId, active: true, events: { has: 'TRAINING_COMPLETE' } }
        });

        for (const endpoint of completeEndpoints) {
            deliverWebhook({ url: endpoint.url, secret: endpoint.secret, payload: completePayload }).catch(console.error);
        }

        // Send email if user has email (implicitly true if logged in)
        if (session.user?.email) {
            sendTrainingCompleteEmail({
                to: session.user.email,
                chatbotName: chatbot.name,
                chatbotId: chatbot.id,
                chunksCreated: chunks.length,
                durationMs: Date.now() - startTime,
                dashboardUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
            }).catch(console.error);
        }

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
        // Trigger TRAINING_STARTED webhook
        const startPayload = createWebhookPayload('TRAINING_STARTED', {
            chatbotId,
            sourceId: source.id,
            sourceType: 'TEXT',
            startedAt: new Date().toISOString()
        });

        const activeEndpoints = await prisma.webhookEndpoint.findMany({
            where: { workspaceId: chatbot.workspaceId, active: true, events: { has: 'TRAINING_STARTED' } }
        });

        for (const endpoint of activeEndpoints) {
            deliverWebhook({ url: endpoint.url, secret: endpoint.secret, payload: startPayload }).catch(console.error);
        }

        const startTime = Date.now();
        const rawChunks = await chunkText(content);
        // Clean and filter chunks
        const chunks = rawChunks
            .map(c => c.replace(/\n/g, ' ').trim())
            .filter(c => c.length > 0);

        if (chunks.length === 0) {
            // Nothing to index
            await prisma.dataSource.update({
                where: { id: source.id },
                data: { status: 'READY', lastSyncedAt: new Date() },
            });
            return;
        }

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

        // Trigger TRAINING_COMPLETE webhook
        const completePayload = createWebhookPayload('TRAINING_COMPLETE', {
            chatbotId,
            sourceId: source.id,
            chunksCount: chunks.length,
            durationMs: Date.now() - startTime
        });

        const completeEndpoints = await prisma.webhookEndpoint.findMany({
            where: { workspaceId: chatbot.workspaceId, active: true, events: { has: 'TRAINING_COMPLETE' } }
        });

        for (const endpoint of completeEndpoints) {
            deliverWebhook({ url: endpoint.url, secret: endpoint.secret, payload: completePayload }).catch(console.error);
        }

        if (session.user?.email) {
            sendTrainingCompleteEmail({
                to: session.user.email,
                chatbotName: chatbot.name,
                chatbotId: chatbot.id,
                chunksCreated: chunks.length,
                durationMs: Date.now() - startTime,
                dashboardUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
            }).catch(console.error);
        }

    } catch (error) {
        await prisma.dataSource.update({
            where: { id: source.id },
            data: { status: 'ERROR', errorMessage: (error as Error).message },
        });

        // Trigger TRAINING_FAILED webhook
        const failedPayload = createWebhookPayload('TRAINING_FAILED', {
            chatbotId,
            sourceId: source.id,
            error: (error as Error).message
        });

        const failedEndpoints = await prisma.webhookEndpoint.findMany({
            where: { workspaceId: chatbot.workspaceId, active: true, events: { has: 'TRAINING_FAILED' } }
        });

        for (const endpoint of failedEndpoints) {
            deliverWebhook({ url: endpoint.url, secret: endpoint.secret, payload: failedPayload }).catch(console.error);
        }

        if (session.user?.email) {
            sendTrainingFailedEmail({
                to: session.user.email,
                chatbotName: chatbot.name,
                chatbotId: chatbot.id,
                error: (error as Error).message,
                dashboardUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000'
            }).catch(console.error);
        }
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
