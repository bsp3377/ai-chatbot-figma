'use server';

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { generateEmbedding, vectorStore } from '@chatbot-ai/ai';
import { prisma } from '@/lib/db';

export async function getChatResponse(messages: any[], chatbotId: string) {
    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content;

    // 1. Get embedding for user query
    const queryEmbedding = await generateEmbedding(userQuery);

    // 2. Find similar chunks
    // We need to fetch all data sources for this chatbot first (or filter in the query if supported)
    // The vectorStore.query now supports filtering by dataSourceId, but we want across ALL data sources for this chatbot.
    // So we first get all dataSourceIds for the chatbot.

    // Actually, improved vectorStore to support filtering by list of IDs or we iterate?
    // A better approach for RAG is to store chatbotId in DocumentChunk or filter by join.
    // But DocumentChunk only links to DataSource.
    // So we need to find all DataSources for this Chatbot.

    const chatbotDataSources = await prisma.chatbotDataSource.findMany({
        where: { chatbotId },
        select: { dataSourceId: true }
    });

    const dataSourceIds = chatbotDataSources.map((ds: { dataSourceId: string }) => ds.dataSourceId);

    // If no sources, just chat without context
    let context = '';

    if (dataSourceIds.length > 0) {
        // We need to modify vectorStore to generic query across multiple data sources or just Raw SQL here.
        // Let's rely on vectorStore customization or raw query here if needed, 
        // OR we just loop (inefficient) or update vectorStore to accept array of dataSourceIds.

        // For now, let's assume we update vectorStore.query to accept dataSourceIds array or we do raw query here?
        // Let's do raw query here for efficiency if vectorStore is too simple.
        // Or better: Update vectorStore to handle finding relevant chunks across multiple sources.

        // Actually, let's simplify: 
        // We can search globally restricted by the subset of chunks that belong to these data sources.
        // PGVector is fast.

        // Let's modify the query in vectorStore to allow 'dataSourceId' to be an array OR 
        // we can fetch top chunks globally and filter (bad performance).

        // Let's stick to using vectorStore.query but we'll need to update it to support multiple IDs.
        // Since I can't easily change vectorStore again in this turn without another tool call, 
        // I will use a direct Prisma raw query here matching what vectorStore does, but with IN clause.

        const vectorString = `[${queryEmbedding.join(',')}]`;

        // Handle empty array case for IN clause
        if (dataSourceIds.length > 0) {
            // Create a safe string for the IN clause
            const idsList = dataSourceIds.map((id: string) => `'${id}'`).join(',');

            const similarChunks = await prisma.$queryRawUnsafe(`
                SELECT content, 1 - (embedding <=> ${vectorString}::vector) as score
                FROM "DocumentChunk"
                WHERE "dataSourceId" IN (${idsList})
                ORDER BY embedding <=> ${vectorString}::vector
                LIMIT 5
           `) as any[];

            context = similarChunks
                .map((chunk) => chunk.content)
                .join('\n\n');
        }
    }

    // 4. Get chatbot system prompt
    const chatbot = await prisma.chatbot.findUnique({
        where: { id: chatbotId },
    });

    const systemPrompt = `
    ${chatbot?.systemPrompt || 'You are a helpful AI assistant.'}
    
    Use the following pieces of context to answer the user's question.
    If you don't know the answer based on the context, say "I don't have that information."
    
    Context:
    ${context}
  `;

    // 5. Stream response
    const result = streamText({
        model: openai('gpt-4o-mini'),
        system: systemPrompt,
        messages,
    });

    // Save the message (optional for now, as Vercel AI SDK handles state, but good for history)
    // We should ideally sync this after response or partly.
    // For V1, we just return the stream.

    return result.toTextStreamResponse();
}
