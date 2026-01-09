// Mock Chat Completion Service
// In production, replace with real OpenAI API calls

import { generateEmbedding } from './embeddings';
import { vectorStore } from './vectorStore';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ChatResponse {
    reply: string;
    sources: Array<{
        sourceId: string;
        url?: string;
        title?: string;
        snippet: string;
        score: number;
    }>;
    tokensUsed: number;
    latencyMs: number;
}

const MOCK_RESPONSES: Record<string, string> = {
    pricing: `We offer three plans:

• **Starter**: $19/month - Perfect for small websites
  - 2 chatbots, 500 chats/month
  
• **Pro**: $49/month - Best for growing businesses
  - 5 chatbots, 2,000 chats/month
  
• **Business**: $199/month - For large teams
  - Unlimited chatbots, 10,000 chats/month

All plans include a 14-day free trial. Would you like more details on any specific plan?`,

    started: `Getting started is easy! Here's how:

1. **Sign up** for a free account
2. **Create your first chatbot** and give it a name
3. **Add your content** - website URL, files, or custom text
4. **Train your bot** - we'll process your content automatically
5. **Install the widget** on your website with a simple code snippet

The whole process takes about 5 minutes. Would you like me to help with any specific step?`,

    trial: `Yes! We offer a **14-day free trial** on all paid plans:

✓ No credit card required
✓ Full access to all features
✓ Cancel anytime

You can start your free trial right from the signup page. Would you like me to explain what's included?`,

    default: `I'd be happy to help you with that! Based on your question, here's what I can tell you:

Our platform helps businesses create AI-powered chatbots that can answer customer questions 24/7. The chatbots learn from your content - websites, documents, and custom text.

Is there something specific you'd like to know more about?`,
};

export async function generateChatResponse(
    chatbotId: string,
    message: string,
    history: ChatMessage[] = [],
    personality: 'formal' | 'friendly' | 'casual' = 'friendly'
): Promise<ChatResponse> {
    const startTime = Date.now();

    console.log(`[Mock Chat] Generating response for chatbot: ${chatbotId}`);
    console.log(`[Mock Chat] User message: ${message}`);

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(message);

    // Query vector store for relevant context
    const relevantChunks = await vectorStore.query(queryEmbedding, {
        topK: 3,
        filter: { chatbotId },
    });

    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    // Determine response based on keywords
    const lowerMessage = message.toLowerCase();
    let reply: string;

    if (lowerMessage.includes('pricing') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
        reply = MOCK_RESPONSES.pricing;
    } else if (lowerMessage.includes('start') || lowerMessage.includes('begin') || lowerMessage.includes('how do i')) {
        reply = MOCK_RESPONSES.started;
    } else if (lowerMessage.includes('trial') || lowerMessage.includes('free')) {
        reply = MOCK_RESPONSES.trial;
    } else {
        reply = MOCK_RESPONSES.default;
    }

    // Adjust tone based on personality
    if (personality === 'formal') {
        reply = reply.replace(/!/g, '.').replace(/Would you like/g, 'Should you require');
    } else if (personality === 'casual') {
        reply = reply.replace(/Would you like/g, 'Want').replace(/I'd be happy to/g, 'Sure, I can');
    }

    const latencyMs = Date.now() - startTime;

    return {
        reply,
        sources: relevantChunks.map(chunk => ({
            sourceId: chunk.metadata.sourceId,
            url: chunk.metadata.url,
            title: chunk.metadata.title,
            snippet: chunk.metadata.content.substring(0, 200),
            score: chunk.score,
        })),
        tokensUsed: Math.floor(reply.length / 4) + Math.floor(message.length / 4),
        latencyMs,
    };
}
