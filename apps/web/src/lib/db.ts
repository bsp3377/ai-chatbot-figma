// Mock database client for development
// In production, use Prisma client from @chatbot-ai/database

export interface User {
    id: string;
    email: string;
    name: string | null;
    workspaceId: string;
    role: 'OWNER' | 'ADMIN' | 'VIEWER';
}

export interface Workspace {
    id: string;
    name: string;
    slug: string;
    plan: 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS';
}

export interface Chatbot {
    id: string;
    workspaceId: string;
    name: string;
    publicId: string;
    status: 'ACTIVE' | 'PAUSED' | 'TRAINING' | 'ERROR';
    language: string;
    welcomeMessage: string;
    personality: 'FORMAL' | 'FRIENDLY' | 'CASUAL';
    widgetConfig: Record<string, any>;
    lastTrainedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface DataSource {
    id: string;
    workspaceId: string;
    type: 'WEBSITE' | 'FILE' | 'TEXT';
    name: string;
    status: 'PENDING' | 'PROCESSING' | 'READY' | 'ERROR';
    config: Record<string, any>;
    metadata: Record<string, any>;
    createdAt: Date;
}

export interface Conversation {
    id: string;
    chatbotId: string;
    visitorId: string;
    status: 'ACTIVE' | 'RESOLVED' | 'ESCALATED';
    leadEmail?: string;
    leadName?: string;
    startedAt: Date;
    messageCount?: number;
}

export interface Message {
    id: string;
    conversationId: string;
    role: 'USER' | 'ASSISTANT' | 'SYSTEM';
    content: string;
    createdAt: Date;
}

// Mock data
export const mockChatbots: Chatbot[] = [
    {
        id: 'bot_1',
        workspaceId: 'ws_1',
        name: 'Support Bot',
        publicId: 'pub_support123',
        status: 'ACTIVE',
        language: 'en',
        welcomeMessage: 'Hi! How can I help you today?',
        personality: 'FRIENDLY',
        widgetConfig: {
            color: '#3B82F6',
            position: 'bottom-right',
            buttonText: 'Need help?',
        },
        lastTrainedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
        id: 'bot_2',
        workspaceId: 'ws_1',
        name: 'Sales Assistant',
        publicId: 'pub_sales456',
        status: 'ACTIVE',
        language: 'en',
        welcomeMessage: 'Hello! Looking for more information about our products?',
        personality: 'FRIENDLY',
        widgetConfig: {
            color: '#10B981',
            position: 'bottom-right',
            buttonText: 'Chat with us',
        },
        lastTrainedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
];

export const mockDataSources: DataSource[] = [
    {
        id: 'src_1',
        workspaceId: 'ws_1',
        type: 'WEBSITE',
        name: 'example.com',
        status: 'READY',
        config: { url: 'https://example.com', pages: 24 },
        metadata: { wordCount: 45000, pageCount: 24 },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
        id: 'src_2',
        workspaceId: 'ws_1',
        type: 'FILE',
        name: 'Product-Guide.pdf',
        status: 'READY',
        config: { fileName: 'Product-Guide.pdf', fileSize: 2400000 },
        metadata: { wordCount: 12000, pageCount: 45 },
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
];

export const mockConversations: Conversation[] = [
    {
        id: 'conv_1',
        chatbotId: 'bot_1',
        visitorId: 'visitor_abc123',
        status: 'RESOLVED',
        leadEmail: 'john@example.com',
        leadName: 'John Doe',
        startedAt: new Date(Date.now() - 5 * 60 * 1000),
        messageCount: 4,
    },
    {
        id: 'conv_2',
        chatbotId: 'bot_1',
        visitorId: 'visitor_def456',
        status: 'ACTIVE',
        startedAt: new Date(Date.now() - 12 * 60 * 1000),
        messageCount: 6,
    },
];

// Mock DB functions
export const db = {
    chatbot: {
        findMany: async (options?: { where?: { workspaceId?: string } }) => {
            if (options?.where?.workspaceId) {
                return mockChatbots.filter(c => c.workspaceId === options.where!.workspaceId);
            }
            return mockChatbots;
        },
        findFirst: async (options: { where: { id: string } }) => {
            return mockChatbots.find(c => c.id === options.where.id) || null;
        },
        create: async (data: Partial<Chatbot>) => {
            const newBot: Chatbot = {
                id: `bot_${Date.now()}`,
                workspaceId: data.workspaceId || 'ws_1',
                name: data.name || 'New Chatbot',
                publicId: `pub_${Date.now()}`,
                status: 'ACTIVE',
                language: data.language || 'en',
                welcomeMessage: data.welcomeMessage || 'Hi! How can I help?',
                personality: data.personality || 'FRIENDLY',
                widgetConfig: data.widgetConfig || {},
                lastTrainedAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockChatbots.push(newBot);
            return newBot;
        },
    },
    dataSource: {
        findMany: async (options?: { where?: { workspaceId?: string } }) => {
            if (options?.where?.workspaceId) {
                return mockDataSources.filter(s => s.workspaceId === options.where!.workspaceId);
            }
            return mockDataSources;
        },
    },
    conversation: {
        findMany: async (options?: { where?: { chatbotId?: string }; take?: number }) => {
            let results = mockConversations;
            if (options?.where?.chatbotId) {
                results = results.filter(c => c.chatbotId === options.where!.chatbotId);
            }
            if (options?.take) {
                results = results.slice(0, options.take);
            }
            return results;
        },
    },
};
