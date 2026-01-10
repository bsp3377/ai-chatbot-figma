import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { generateEmbedding } from '@chatbot-ai/ai';

// Default system prompt for conversational AI
const DEFAULT_SYSTEM_PROMPT = `You are a friendly, helpful customer support agent.

COMMUNICATION STYLE:
- Be warm, conversational, and natural — like a helpful human, not a robot
- Use short, clear sentences
- Be confident and direct, but never cold
- Show empathy when the customer seems frustrated
- Don't just repeat information verbatim — explain it naturally

RESPONSE GUIDELINES:
- Start with a brief, friendly acknowledgment
- Answer the question directly and concisely
- End with an offer to help further

WHAT TO AVOID:
- Don't sound like you're reading from a manual
- Don't use overly formal or corporate language
- Don't give unnecessary disclaimers

WHEN YOU DON'T KNOW:
- Be honest: "I don't have that specific info, but here's what might help..."
- Offer to connect them with someone who can help

Remember: You're having a conversation, not giving a presentation. Be helpful, be human, be brief.`;

// POST /api/widget/chat - Handle visitor chat messages (PUBLIC)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { chatbotId, visitorId, messages, conversationId } = body;

        if (!chatbotId) {
            return NextResponse.json(
                { error: 'chatbotId is required' },
                { status: 400 }
            );
        }

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: 'messages array is required' },
                { status: 400 }
            );
        }

        // Find chatbot by publicId
        const chatbot = await db.chatbot.findFirst({
            where: {
                publicId: chatbotId,
                status: 'ACTIVE',
            },
        });

        if (!chatbot) {
            return NextResponse.json(
                { error: 'Chatbot not found or inactive' },
                { status: 404 }
            );
        }

        // Get or create conversation
        let conversation;
        const effectiveVisitorId = visitorId || `visitor_${crypto.randomUUID()}`;

        if (conversationId) {
            conversation = await db.conversation.findUnique({
                where: { id: conversationId },
            });
        }

        if (!conversation) {
            conversation = await db.conversation.create({
                data: {
                    chatbotId: chatbot.id,
                    visitorId: effectiveVisitorId,
                    status: 'ACTIVE',
                    startedAt: new Date(),
                },
            });
        }

        // Get user's last message
        const lastMessage = messages[messages.length - 1];
        const userQuery = lastMessage.content;

        // Save user message
        await db.message.create({
            data: {
                conversationId: conversation.id,
                role: 'USER',
                content: userQuery,
            },
        });

        // Get data sources for this chatbot
        const chatbotDataSources = await db.chatbotDataSource.findMany({
            where: { chatbotId: chatbot.id },
            select: { dataSourceId: true },
        });

        const dataSourceIds = chatbotDataSources.map((ds) => ds.dataSourceId);

        // RAG: Get context from vector store
        let context = '';

        if (dataSourceIds.length > 0) {
            try {
                // Generate embedding for query
                const queryEmbedding = await generateEmbedding(userQuery);
                const vectorString = `'[${queryEmbedding.join(',')}]'`;
                const idsList = dataSourceIds.map((id) => `'${id}'`).join(',');

                const similarChunks = await db.$queryRawUnsafe(`
                    SELECT content, 1 - (embedding <=> ${vectorString}::vector) as score
                    FROM "DocumentChunk"
                    WHERE "dataSourceId" IN (${idsList})
                    ORDER BY embedding <=> ${vectorString}::vector
                    LIMIT 5
                `) as Array<{ content: string; score: number }>;

                context = similarChunks
                    .map((chunk) => chunk.content)
                    .join('\n\n');
            } catch (error) {
                console.error('RAG search error:', error);
                // Continue without context if RAG fails
            }
        }

        // Build system prompt
        const basePrompt = chatbot.systemPrompt || DEFAULT_SYSTEM_PROMPT;
        const systemPrompt = `${basePrompt}

---
KNOWLEDGE BASE (use this to answer questions, but explain naturally):
${context || 'No specific knowledge base content available. Use general knowledge to help.'}
---

Answer like a helpful human would, not like a search engine!`;

        // Stream response using AI SDK
        const result = streamText({
            model: openai('gpt-4o-mini'),
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages.map((m: { role: string; content: string }) => ({
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                })),
            ],
            async onFinish({ text }) {
                // Save assistant message after streaming completes
                try {
                    await db.message.create({
                        data: {
                            conversationId: conversation!.id,
                            role: 'ASSISTANT',
                            content: text,
                        },
                    });
                } catch (error) {
                    console.error('Failed to save assistant message:', error);
                }
            },
        });

        // Return streaming response with conversation ID in header
        const response = result.toDataStreamResponse();
        response.headers.set('X-Conversation-Id', conversation.id);

        return response;
    } catch (error) {
        console.error('Widget chat error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
