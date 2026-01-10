import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/training/[chatbotId]/status - Get training status
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ chatbotId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.workspaceId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { chatbotId } = await params;

        const chatbot = await db.chatbot.findFirst({
            where: {
                id: chatbotId,
                workspaceId: session.user.workspaceId,
            },
            select: {
                id: true,
                name: true,
                status: true,
                lastTrainedAt: true,
            },
        });

        if (!chatbot) {
            return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
        }

        // Get count of data sources and document chunks
        const dataSources = await db.chatbotDataSource.findMany({
            where: { chatbotId },
            include: {
                dataSource: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        status: true,
                        _count: {
                            select: { documentChunks: true }
                        }
                    }
                }
            }
        });

        const totalChunks = dataSources.reduce((sum, ds) => sum + ds.dataSource._count.documentChunks, 0);
        const processedSources = dataSources.filter(ds => ds.dataSource.status === 'READY').length;
        const totalSources = dataSources.length;

        // Calculate progress percentage
        let progress = 0;
        if (chatbot.status === 'ACTIVE') {
            progress = 100;
        } else if (chatbot.status === 'TRAINING') {
            progress = totalSources > 0
                ? Math.round((processedSources / totalSources) * 100)
                : 50;
        } else if (chatbot.status === 'DRAFT') {
            progress = 0;
        }

        return NextResponse.json({
            chatbotId: chatbot.id,
            name: chatbot.name,
            status: chatbot.status,
            lastTrainedAt: chatbot.lastTrainedAt,
            progress,
            dataSources: dataSources.map(ds => ({
                id: ds.dataSource.id,
                name: ds.dataSource.name,
                type: ds.dataSource.type,
                status: ds.dataSource.status,
                chunksCount: ds.dataSource._count.documentChunks,
            })),
            totalChunks,
            totalSources,
            processedSources,
        });
    } catch (error) {
        console.error('Training status error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
