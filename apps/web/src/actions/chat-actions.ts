'use server';

import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { generateEmbedding } from '@chatbot-ai/ai';
import { prisma } from '@/lib/db';

// Default humanized system prompt for conversational AI
const DEFAULT_SYSTEM_PROMPT = `You are a friendly, helpful customer support agent.

COMMUNICATION STYLE:
- Be warm, conversational, and natural — like a helpful human, not a robot
- Use short, clear sentences
- Be confident and direct, but never cold
- Show empathy when the customer seems frustrated
- Don't just repeat information verbatim — explain it naturally
- Use casual greetings like "Hey!", "Happy to help!", "Great question!"

RESPONSE GUIDELINES:
- Start with a brief, friendly acknowledgment
- Answer the question directly and concisely
- If helpful, break down steps in a natural way (not robotic numbered lists)
- End with an offer to help further

WHAT TO AVOID:
- Don't sound like you're reading from a manual
- Don't use overly formal or corporate language
- Don't give unnecessary disclaimers
- Don't repeat the question back word-for-word
- Don't write long paragraphs — keep it scannable

WHEN YOU DON'T KNOW:
- Be honest: "I don't have that specific info, but here's what might help..."
- Offer to connect them with someone who can help

Remember: You're having a conversation, not giving a presentation. Be helpful, be human, be brief.`;

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

    // 4. Get chatbot settings
    const chatbot = await prisma.chatbot.findUnique({
        where: { id: chatbotId },
    });

    // Build the system prompt with humanized instructions
    const basePrompt = chatbot?.systemPrompt || DEFAULT_SYSTEM_PROMPT;

    const systemPrompt = `${basePrompt}

---
KNOWLEDGE BASE (use this to answer questions, but explain naturally in your own words):
${context || 'No specific knowledge base content available. Use your general knowledge to help.'}
---

Remember: Answer like a helpful human would, not like a search engine. Be conversational and friendly!`;

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
