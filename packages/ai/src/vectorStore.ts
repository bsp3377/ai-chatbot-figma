// Mock Vector Store - In-memory implementation
// In production, replace with Pinecone or pgvector

interface VectorEntry {
    id: string;
    vector: number[];
    metadata: {
        chatbotId: string;
        sourceId: string;
        content: string;
        url?: string;
        title?: string;
    };
}

class MockVectorStore {
    private vectors: Map<string, VectorEntry> = new Map();

    async upsert(entries: VectorEntry[]): Promise<void> {
        console.log(`[Mock VectorStore] Upserting ${entries.length} vectors`);

        for (const entry of entries) {
            this.vectors.set(entry.id, entry);
        }
    }

    async query(
        queryVector: number[],
        options: {
            topK?: number;
            filter?: { chatbotId: string };
        }
    ): Promise<Array<{ id: string; score: number; metadata: VectorEntry['metadata'] }>> {
        const { topK = 5, filter } = options;

        console.log(`[Mock VectorStore] Querying with topK=${topK}`);

        let entries = Array.from(this.vectors.values());

        // Apply filter
        if (filter?.chatbotId) {
            entries = entries.filter(e => e.metadata.chatbotId === filter.chatbotId);
        }

        // Calculate cosine similarity
        const results = entries.map(entry => ({
            id: entry.id,
            score: cosineSimilarity(queryVector, entry.vector),
            metadata: entry.metadata,
        }));

        // Sort by score descending and take topK
        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
    }

    async delete(filter: { chatbotId: string }): Promise<void> {
        console.log(`[Mock VectorStore] Deleting vectors for chatbot: ${filter.chatbotId}`);

        for (const [id, entry] of this.vectors) {
            if (entry.metadata.chatbotId === filter.chatbotId) {
                this.vectors.delete(id);
            }
        }
    }

    getCount(): number {
        return this.vectors.size;
    }
}

function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Singleton instance
export const vectorStore = new MockVectorStore();
