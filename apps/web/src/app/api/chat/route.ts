import { getChatResponse } from '@/actions/chat-actions';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    const { messages, chatbotId } = await req.json();

    if (!chatbotId) {
        return new Response('Chatbot ID required', { status: 400 });
    }

    return getChatResponse(messages, chatbotId);
}
