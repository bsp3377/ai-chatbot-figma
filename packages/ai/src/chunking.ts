// Content chunking utilities

export interface Chunk {
    id: string;
    content: string;
    metadata: {
        sourceId: string;
        sourceType: 'website' | 'file' | 'text';
        url?: string;
        title?: string;
        position: number;
    };
}

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

export function chunkText(
    text: string,
    sourceId: string,
    sourceType: 'website' | 'file' | 'text',
    options?: { url?: string; title?: string }
): Chunk[] {
    const chunks: Chunk[] = [];

    // Clean and normalize text
    const cleanedText = text
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();

    if (cleanedText.length <= CHUNK_SIZE) {
        chunks.push({
            id: `${sourceId}-0`,
            content: cleanedText,
            metadata: {
                sourceId,
                sourceType,
                url: options?.url,
                title: options?.title,
                position: 0,
            },
        });
        return chunks;
    }

    // Split by paragraphs first
    const paragraphs = cleanedText.split(/\n\n+/);
    let currentChunk = '';
    let position = 0;

    for (const paragraph of paragraphs) {
        if (currentChunk.length + paragraph.length > CHUNK_SIZE) {
            // Save current chunk if not empty
            if (currentChunk.trim()) {
                chunks.push({
                    id: `${sourceId}-${position}`,
                    content: currentChunk.trim(),
                    metadata: {
                        sourceId,
                        sourceType,
                        url: options?.url,
                        title: options?.title,
                        position,
                    },
                });
                position++;

                // Keep overlap from end of current chunk
                const words = currentChunk.trim().split(' ');
                const overlapWords = Math.ceil(CHUNK_OVERLAP / 5); // ~5 chars per word
                currentChunk = words.slice(-overlapWords).join(' ') + ' ';
            }
        }

        currentChunk += paragraph + '\n\n';
    }

    // Don't forget the last chunk
    if (currentChunk.trim()) {
        chunks.push({
            id: `${sourceId}-${position}`,
            content: currentChunk.trim(),
            metadata: {
                sourceId,
                sourceType,
                url: options?.url,
                title: options?.title,
                position,
            },
        });
    }

    console.log(`[Chunking] Created ${chunks.length} chunks from source ${sourceId}`);

    return chunks;
}

export function estimateTokenCount(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
}
