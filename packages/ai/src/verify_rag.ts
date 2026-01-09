
import { generateEmbedding, generateEmbeddings } from './embeddings';
import { chunkText } from './chunking';
import { vectorStore } from './vectorStore';
import { prisma } from '@chatbot-ai/database';

async function main() {
    console.log('Starting RAG Verification...');

    // 1. Test Embeddings
    console.log('\n1. Testing Embeddings...');
    try {
        const text = "Hello, world!";
        const embedding = await generateEmbedding(text);
        console.log(`✅ Generated embedding for "${text}" (length: ${embedding.length})`);

        if (embedding.length !== 1536) {
            console.error('❌ Embedding length mismatch! Expected 1536.');
        }
    } catch (error) {
        console.error('❌ Embedding generation failed:', error);
    }

    // 2. Test Chunking
    console.log('\n2. Testing Chunking...');
    try {
        const longText = "This is a sentence. ".repeat(50);
        const chunks = await chunkText(longText, { chunkSize: 100, chunkOverlap: 20 });
        console.log(`✅ Chunked text into ${chunks.length} chunks.`);
        console.log(`Snapshot of first chunk: "${chunks[0]}"`);
    } catch (error) {
        console.error('❌ Chunking failed:', error);
    }

    // 3. Test Vector Store
    console.log('\n3. Testing Vector Store...');

    // Create prerequisites
    const workspaceId = 'test-workspace-' + Date.now();
    const dataSourceId = 'test-datasource-' + Date.now();

    try {
        // Create workspace
        await prisma.workspace.create({
            data: {
                id: workspaceId,
                name: 'Test Workspace',
                slug: workspaceId,
                plan: 'FREE'
            }
        });

        // Create data source
        await prisma.dataSource.create({
            data: {
                id: dataSourceId,
                workspaceId: workspaceId,
                type: 'TEXT',
                name: 'Test Source',
                status: 'READY'
            }
        });

        console.log('✅ Created test workspace and data source.');

        const text = "The capital of France is Paris.";
        const chunks = await chunkText(text);
        const embeddings = await generateEmbeddings(chunks);

        const entries = chunks.map((chunk, i) => ({
            id: 'test-chunk-' + Date.now() + '-' + i,
            vector: embeddings[i],
            content: chunk,
            metadata: { title: 'Test Doc' },
            dataSourceId
        }));

        await vectorStore.upsert(entries);
        console.log('✅ Upserted chunk to vector store.');

        // Query
        const query = "What is the capital of France?";
        const queryEmbedding = await generateEmbedding(query);
        const results = await vectorStore.query(queryEmbedding, { topK: 1 });

        if (results.length > 0 && results[0].content.includes('Paris')) {
            console.log(`✅ Query successful! Found: "${results[0].content}" with score ${results[0].score}`);
        } else {
            console.error('❌ Query failed or incorrect result.', results);
        }

    } catch (error) {
        console.error('❌ Vector Store test failed:', error);
    } finally {
        // Cleanup - cascade should handle datasource and chunks
        try {
            await prisma.workspace.delete({ where: { id: workspaceId } });
            console.log('✅ Cleaned up test data.');
        } catch (cleanupError) {
            console.error('❌ Cleanup failed:', cleanupError);
        }
    }

    console.log('\nVerification Complete.');
}

main().catch(console.error);
