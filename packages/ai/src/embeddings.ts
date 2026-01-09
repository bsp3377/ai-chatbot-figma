// Mock OpenAI embeddings service
// In production, replace with real OpenAI API calls

export async function generateEmbedding(text: string): Promise<number[]> {
    // Mock implementation - returns random 1536-dimension vector
    console.log('[Mock] Generating embedding for:', text.substring(0, 50) + '...');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Generate deterministic mock embedding based on text hash
    const hash = simpleHash(text);
    const embedding: number[] = [];

    for (let i = 0; i < 1536; i++) {
        embedding.push(Math.sin(hash + i) * 0.5);
    }

    return embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(text => generateEmbedding(text)));
}

function simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}
