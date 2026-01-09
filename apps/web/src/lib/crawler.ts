import * as cheerio from 'cheerio';

export async function crawlUrl(url: string): Promise<{ title: string; content: string }> {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove scripts, styles, and other noise
    $('script').remove();
    $('style').remove();
    $('nav').remove();
    $('footer').remove();
    $('iframe').remove();

    const title = $('title').text().trim();
    const content = $('body').text().replace(/\s+/g, ' ').trim();

    return { title, content };
}

export function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
        const end = start + chunkSize;
        let chunk = text.slice(start, end);

        // Try to cut at a punctuation mark if possible
        if (end < text.length) {
            const lastPeriod = chunk.lastIndexOf('.');
            if (lastPeriod > chunkSize * 0.8) {
                chunk = chunk.slice(0, lastPeriod + 1);
            }
        }

        chunks.push(chunk);
        start += chunk.length - overlap;
    }

    return chunks;
}
