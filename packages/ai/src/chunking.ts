export interface ChunkingOptions {
    chunkSize?: number;
    chunkOverlap?: number;
}

export class RecursiveCharacterTextSplitter {
    private chunkSize: number;
    private chunkOverlap: number;
    private separators: string[];

    constructor(options?: ChunkingOptions) {
        this.chunkSize = options?.chunkSize ?? 1000;
        this.chunkOverlap = options?.chunkOverlap ?? 200;
        this.separators = ["\n\n", "\n", " ", ""];
    }

    async splitText(text: string): Promise<string[]> {
        const finalChunks: string[] = [];
        let goodSplits: string[] = [];

        // Simplistic implementation of recursive splitting
        // Ideally we'd use LangChain's implementation, but this is a lightweight version

        goodSplits = await this._splitText(text, this.separators);

        return goodSplits;
    }

    private async _splitText(text: string, separators: string[]): Promise<string[]> {
        const finalChunks: string[] = [];
        let separator = separators[0];
        let newSeparators: string[] = [];

        for (let i = 0; i < separators.length; i++) {
            const s = separators[i];
            if (s === "") {
                separator = s;
                break;
            }
            if (text.includes(s)) {
                separator = s;
                newSeparators = separators.slice(i + 1);
                break;
            }
        }

        const splits = separator ? text.split(separator) : [text];
        let goodSplits: string[] = [];

        for (const split of splits) {
            if (split.length < this.chunkSize) {
                goodSplits.push(split);
            } else {
                if (newSeparators.length > 0) {
                    const subSplits = await this._splitText(split, newSeparators);
                    goodSplits.push(...subSplits);
                } else {
                    goodSplits.push(split); // Too big but can't split further
                }
            }
        }

        // Merge splits back together if they are small enough
        return this._mergeSplits(goodSplits, separator);
    }

    private _mergeSplits(splits: string[], separator: string): string[] {
        const docs: string[] = [];
        let currentDoc: string[] = [];
        let total = 0;

        for (const split of splits) {
            const len = split.length;
            if (total + len + (currentDoc.length > 0 ? separator.length : 0) > this.chunkSize) {
                if (currentDoc.length > 0) {
                    const doc = currentDoc.join(separator);
                    if (doc !== null && doc !== undefined) {
                        docs.push(doc);
                    }

                    // Keep overlap
                    while (total > this.chunkOverlap || (total + len > this.chunkSize && total > 0)) {
                        total -= currentDoc[0].length + (currentDoc.length > 1 ? separator.length : 0);
                        currentDoc.shift();
                    }
                }
            }

            currentDoc.push(split);
            total += len + (currentDoc.length > 1 ? separator.length : 0);
        }

        const doc = currentDoc.join(separator);
        if (doc !== null && doc !== undefined) {
            docs.push(doc);
        }

        return docs;
    }

}

export async function chunkText(text: string, options?: ChunkingOptions): Promise<string[]> {
    const splitter = new RecursiveCharacterTextSplitter(options);
    return splitter.splitText(text);
}

export interface Chunk {
    content: string;
    tokens: number;
}

export function estimateTokenCount(text: string): number {
    // Rough estimation: 1 token ~= 4 chars in English
    return Math.ceil(text.length / 4);
}
