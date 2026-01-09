'use server';

import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { generateEmbedding } from '@chatbot-ai/ai';
import { prisma } from '@/lib/db';

export async function getChatResponse(messages: any[], chatbotId: string) {
    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content;

    // 1. Get embedding for user query
    // This now uses Gemini embeddings (768 dimensions) via the updated @chatbot-ai/ai package
    const queryEmbedding = await generateEmbedding(userQuery);

    // 2. Find similar chunks
    const chatbotDataSources = await prisma.chatbotDataSource.findMany({
        where: { chatbotId },
        select: { dataSourceId: true }
    });

    const dataSourceIds = chatbotDataSources.map((ds: { dataSourceId: string }) => ds.dataSourceId);

    // If no sources, just chat without context
    let context = '';

    if (dataSourceIds.length > 0) {
        const vectorString = `[${queryEmbedding.join(',')}]`;

        // Handle empty array case for IN clause
        if (dataSourceIds.length > 0) {
            // Create a safe string for the IN clause
            const idsList = dataSourceIds.map((id: string) => `'${id}'`).join(',');

            // We use raw query to search with pgvector
            // Note: embedding is now 768 dimensions, passing generic array works if types match
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

    // 5. Stream response using Gemini
    const result = streamText({
        model: google('gemini-1.5-flash'),
        system: systemPrompt,
        messages,
    });

    return result.toTextStreamResponse();
}
