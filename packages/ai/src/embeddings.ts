import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.replace(/\n/g, ' '),
    });

    return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    // Filter out empty strings and whitespace-only strings
    const validTexts = texts
        .map(text => text.replace(/\n/g, ' ').trim())
        .filter(text => text.length > 0);

    if (validTexts.length === 0) {
        return [];
    }

    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: validTexts,
    });

    return response.data.map(item => item.embedding);
}
