import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/widget.ts'),
            name: 'ChatBotAI',
            fileName: 'chatbot-widget',
            formats: ['iife'],
        },
        outDir: 'dist',
        minify: 'esbuild',
        rollupOptions: {
            output: {
                extend: true,
            },
        },
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
    },
});
