'use server';

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { generateEmbedding } from '@chatbot-ai/ai';
import { prisma } from '@/lib/db';

export async function getChatResponse(messages: any[], chatbotId: string) {
    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content;

    // 1. Get embedding for user query
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
        const vectorString = `'[${queryEmbedding.join(',')}]'`;

        if (dataSourceIds.length > 0) {
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

    // 5. Stream response using AI SDK v4
    const result = streamText({
        model: openai('gpt-4o-mini'),
        messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map((m: any) => ({
                role: m.role as 'user' | 'assistant',
                content: m.content,
            })),
        ],
    });

    return result.toDataStreamResponse();
}
