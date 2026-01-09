import { prisma } from '@/lib/db';
import { generateEmbedding } from './embeddings';

export async function saveDocumentChunks(
    dataSourceId: string,
    chunks: { content: string; metadata?: any }[]
) {
    const embeddings = await Promise.all(
        chunks.map(async (chunk) => {
            const embedding = await generateEmbedding(chunk.content);
            return {
                dataSourceId,
                content: chunk.content,
                metadata: chunk.metadata || {},
                embedding,
            };
        })
    );

    // We have to insert one by one or use createMany without embedding first if we want typed access, 
    // but for vector we need raw query or specific handling. 
    // Prisma doesn't support writing vectors directly in createMany perfectly in all versions without specific setup.
    // Best approach: Use $executeRaw to insert with casting to vector.

    for (const chunk of embeddings) {
        const vectorString = `[${chunk.embedding.join(',')}]`;
        await prisma.$executeRaw`
      INSERT INTO "DocumentChunk" ("id", "dataSourceId", "content", "metadata", "embedding", "createdAt")
      VALUES (gen_random_uuid(), ${dataSourceId}, ${chunk.content}, ${chunk.metadata}, ${vectorString}::vector, NOW())
    `;
    }
}

export async function findSimilarChunks(embedding: number[], chatbotId: string, limit = 5) {
    // Query chunks associated with data sources that are linked to this chatbot
    const vectorString = `[${embedding.join(',')}]`;

    // 1-cosine_distance is similarity. <=> is cosine distance operator in pgvector.
    // We join ChatbotDataSource to filter by chatbotId
    const chunks = await prisma.$queryRaw`
    SELECT 
      dc.content,
      dc.metadata,
      1 - (dc.embedding <=> ${vectorString}::vector) as similarity
    FROM "DocumentChunk" dc
    JOIN "ChatbotDataSource" cds ON dc."dataSourceId" = cds."dataSourceId"
    WHERE cds."chatbotId" = ${chatbotId}
      AND cds.included = true
    ORDER BY dc.embedding <=> ${vectorString}::vector
    LIMIT ${limit};
  `;

    return chunks as { content: string; metadata: any; similarity: number }[];
}
