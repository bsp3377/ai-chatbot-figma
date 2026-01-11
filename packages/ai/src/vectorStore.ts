import { prisma } from '@chatbot-ai/database';

interface VectorEntry {
    id: string;
    vector: number[];
    content: string;
    metadata: any;
    dataSourceId: string;
}

interface DocumentChunkResult {
    id: string;
    content: string;
    dataSourceId: string;
    metadata: any;
    tokens: number;
    score: number;
}

export const vectorStore = {
    async upsert(entries: VectorEntry[]): Promise<void> {
        // Prisma doesn't support bulk create with unsupported types (vector) easily in one go 
        // if we want to be type-safe, but we can do it with a loop or raw query.
        // For simplicity and safety with the vector type, we'll use a transaction of creates/updates
        // or just simple creates. Since these are chunks, we usually delete old ones and re-create.

        // However, standard prisma create works if we cast the vector.
        // But the input 'embedding' field in schema is Unsupported("vector(1536)")
        // So we must use $executeRaw or similar for correct casting, OR rely on Prisma 5+ features if enabled.
        // The schema uses `extensions = [vector]`.

        // Recommended approach for pgvector in Prisma:
        // Use $executeRaw to insert vectors.

        for (const entry of entries) {
            // We need to format the vector as a string for PostgreSQL
            const vectorString = `[${entry.vector.join(',')}]`;

            await prisma.$executeRaw`
                INSERT INTO "DocumentChunk" ("id", "content", "metadata", "embedding", "dataSourceId", "tokens", "createdAt")
                VALUES (${entry.id}, ${entry.content}, ${entry.metadata}, ${vectorString}::vector, ${entry.dataSourceId}, 0, NOW())
                ON CONFLICT ("id") DO UPDATE SET
                "content" = ${entry.content},
                "metadata" = ${entry.metadata},
                "embedding" = ${vectorString}::vector
            `;
        }
    },

    async query(
        queryVector: number[],
        options: {
            topK?: number;
            filter?: { dataSourceId?: string };
        }
    ): Promise<Array<DocumentChunkResult>> {
        const { topK = 5, filter } = options;
        const vectorString = `[${queryVector.join(',')}]`;

        // If filtering by dataSourceId
        if (filter?.dataSourceId) {
            return prisma.$queryRaw`
                SELECT id, content, "dataSourceId", metadata, tokens, 1 - (embedding <=> ${vectorString}::vector) as score
                FROM "DocumentChunk"
                WHERE "dataSourceId" = ${filter.dataSourceId}
                ORDER BY embedding <=> ${vectorString}::vector
                LIMIT ${topK}
            `;
        }

        // Global search (if needed)
        return prisma.$queryRaw`
            SELECT id, content, "dataSourceId", metadata, tokens, 1 - (embedding <=> ${vectorString}::vector) as score
            FROM "DocumentChunk"
            ORDER BY embedding <=> ${vectorString}::vector
            LIMIT ${topK}
        `;
    },

    async delete(options: { dataSourceId: string }): Promise<void> {
        await prisma.documentChunk.deleteMany({
            where: {
                dataSourceId: options.dataSourceId
            }
        });
    }
};

