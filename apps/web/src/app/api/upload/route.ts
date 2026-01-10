import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { chunkText, generateEmbeddings, vectorStore } from '@chatbot-ai/ai';
import { revalidatePath } from 'next/cache';
import * as pdfjsLib from 'pdfjs-dist';

export const dynamic = 'force-dynamic';

// Helper function to extract text from PDF
async function extractTextFromPDF(buffer: Buffer): Promise<{ text: string; numpages: number }> {
    const uint8Array = new Uint8Array(buffer);
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            .map((item: any) => item.str || '')
            .join(' ');
        fullText += pageText + '\n';
    }

    return { text: fullText, numpages: pdf.numPages };
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;
        const chatbotId = formData.get('chatbotId') as string;

        if (!file || !chatbotId) {
            return NextResponse.json({ message: 'File and chatbot ID required' }, { status: 400 });
        }

        // Verify chatbot ownership
        const chatbot = await prisma.chatbot.findUnique({
            where: { id: chatbotId },
            include: { workspace: true },
        });

        if (!chatbot) {
            return NextResponse.json({ message: 'Chatbot not found' }, { status: 404 });
        }

        // Create data source entry
        const source = await prisma.dataSource.create({
            data: {
                workspaceId: chatbot.workspaceId,
                type: 'FILE',
                name: file.name,
                status: 'PROCESSING',
                config: {
                    fileName: file.name,
                    fileSize: file.size,
                    fileType: file.type
                },
            },
        });

        // Link to chatbot
        await prisma.chatbotDataSource.create({
            data: {
                chatbotId,
                dataSourceId: source.id,
            },
        });

        // Process PDF
        try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Extract text from PDF
            const pdfData = await extractTextFromPDF(buffer);
            const textContent = pdfData.text;

            if (!textContent || textContent.trim().length === 0) {
                throw new Error('No text content found in PDF');
            }

            // Chunk the text
            const rawChunks = await chunkText(textContent);
            const chunks = rawChunks
                .map(c => c.replace(/\n/g, ' ').trim())
                .filter(c => c.length > 0);

            if (chunks.length === 0) {
                await prisma.dataSource.update({
                    where: { id: source.id },
                    data: { status: 'READY', lastSyncedAt: new Date() },
                });
                return NextResponse.json({ message: 'PDF processed but no content found' });
            }

            // Generate embeddings
            const embeddings = await generateEmbeddings(chunks);

            // Store in vector database
            const vectorEntries = chunks.map((chunk, index) => ({
                id: crypto.randomUUID(),
                vector: embeddings[index],
                content: chunk,
                metadata: {
                    fileName: file.name,
                    chunkIndex: index,
                    pageCount: pdfData.numpages
                },
                dataSourceId: source.id,
            }));

            await vectorStore.upsert(vectorEntries);

            // Update source status
            await prisma.dataSource.update({
                where: { id: source.id },
                data: {
                    status: 'READY',
                    lastSyncedAt: new Date(),
                    metadata: {
                        pageCount: pdfData.numpages,
                        chunkCount: chunks.length,
                    }
                },
            });

            // Update chatbot trained timestamp
            await prisma.chatbot.update({
                where: { id: chatbotId },
                data: { lastTrainedAt: new Date(), status: 'ACTIVE' },
            });

            revalidatePath(`/chatbots/${chatbotId}/knowledge`);

            return NextResponse.json({
                message: 'PDF processed successfully',
                sourceId: source.id,
                chunks: chunks.length
            });

        } catch (processingError) {
            console.error('PDF processing failed:', processingError);
            await prisma.dataSource.update({
                where: { id: source.id },
                data: {
                    status: 'ERROR',
                    errorMessage: (processingError as Error).message
                },
            });
            return NextResponse.json({
                message: 'PDF processing failed',
                error: (processingError as Error).message
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({
            message: 'Upload failed',
            error: (error as Error).message
        }, { status: 500 });
    }
}
