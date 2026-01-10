import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/analytics - Get detailed analytics for workspace
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.workspaceId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const workspaceId = session.user.workspaceId;
        const url = new URL(request.url);
        const period = url.searchParams.get('period') || '30d';

        // Calculate date range
        let startDate = new Date();
        switch (period) {
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(startDate.getDate() - 90);
                break;
            default:
                startDate.setDate(startDate.getDate() - 30);
        }

        // Get all chatbots for workspace
        const chatbots = await db.chatbot.findMany({
            where: { workspaceId },
            select: { id: true, name: true },
        });

        const chatbotIds = chatbots.map(c => c.id);

        // Skip if no chatbots
        if (chatbotIds.length === 0) {
            return NextResponse.json({
                overview: {
                    totalConversations: 0,
                    uniqueVisitors: 0,
                    totalMessages: 0,
                    avgMessagesPerConversation: 0,
                    resolvedConversations: 0,
                    escalatedConversations: 0,
                    resolutionRate: 0,
                    escalationRate: 0,
                    leadsCapptured: 0,
                },
                conversationsByDay: [],
                conversationsByChatbot: [],
                topQuestions: [],
                period,
            });
        }

        // Total conversations
        const totalConversations = await db.conversation.count({
            where: {
                chatbotId: { in: chatbotIds },
                createdAt: { gte: startDate },
            },
        });

        // Unique visitors
        const uniqueVisitors = await db.conversation.groupBy({
            by: ['visitorId'],
            where: {
                chatbotId: { in: chatbotIds },
                createdAt: { gte: startDate },
            },
        });

        // Total messages
        const totalMessages = await db.message.count({
            where: {
                conversation: {
                    chatbotId: { in: chatbotIds },
                    createdAt: { gte: startDate },
                },
            },
        });

        // Resolved conversations
        const resolvedConversations = await db.conversation.count({
            where: {
                chatbotId: { in: chatbotIds },
                createdAt: { gte: startDate },
                status: 'RESOLVED',
            },
        });

        // Escalated conversations
        const escalatedConversations = await db.conversation.count({
            where: {
                chatbotId: { in: chatbotIds },
                createdAt: { gte: startDate },
                status: 'ESCALATED',
            },
        });

        // Leads captured
        const leadsCaptured = await db.conversation.count({
            where: {
                chatbotId: { in: chatbotIds },
                createdAt: { gte: startDate },
                leadEmail: { not: null },
            },
        });

        // Conversations by day
        const conversationsByDay = await db.$queryRaw<Array<{ date: string; count: bigint }>>`
            SELECT DATE("createdAt") as date, COUNT(*) as count
            FROM "Conversation"
            WHERE "chatbotId" = ANY(${chatbotIds})
            AND "createdAt" >= ${startDate}
            GROUP BY DATE("createdAt")
            ORDER BY date ASC
        `;

        // Conversations by chatbot
        const conversationsByChatbot = await db.conversation.groupBy({
            by: ['chatbotId'],
            where: {
                chatbotId: { in: chatbotIds },
                createdAt: { gte: startDate },
            },
            _count: { id: true },
        });

        // Top questions (most frequent user messages)
        const topQuestions = await db.$queryRaw<Array<{ content: string; count: bigint }>>`
            SELECT m.content, COUNT(*) as count
            FROM "Message" m
            JOIN "Conversation" c ON m."conversationId" = c.id
            WHERE c."chatbotId" = ANY(${chatbotIds})
            AND c."createdAt" >= ${startDate}
            AND m.role = 'USER'
            AND LENGTH(m.content) > 10
            AND LENGTH(m.content) < 200
            GROUP BY m.content
            ORDER BY count DESC
            LIMIT 10
        `;

        // Calculate rates
        const resolutionRate = totalConversations > 0
            ? Math.round((resolvedConversations / totalConversations) * 100)
            : 0;
        const escalationRate = totalConversations > 0
            ? Math.round((escalatedConversations / totalConversations) * 100)
            : 0;
        const avgMessagesPerConversation = totalConversations > 0
            ? Math.round(totalMessages / totalConversations)
            : 0;

        return NextResponse.json({
            overview: {
                totalConversations,
                uniqueVisitors: uniqueVisitors.length,
                totalMessages,
                avgMessagesPerConversation,
                resolvedConversations,
                escalatedConversations,
                resolutionRate,
                escalationRate,
                leadsCaptured,
            },
            conversationsByDay: conversationsByDay.map(d => ({
                date: d.date,
                count: Number(d.count),
            })),
            conversationsByChatbot: conversationsByChatbot.map(c => ({
                chatbotId: c.chatbotId,
                chatbotName: chatbots.find(b => b.id === c.chatbotId)?.name || 'Unknown',
                count: c._count.id,
            })),
            topQuestions: topQuestions.map(q => ({
                question: q.content,
                count: Number(q.count),
            })),
            period,
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
