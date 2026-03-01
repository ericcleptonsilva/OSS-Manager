import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => {
    // Explicitly loading environment variables to ensure they are available
    const env = loadEnv(mode, process.cwd(), '');

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        nodePolyfills({
          protocolImports: true,
        }),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(''),
        'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || ''),
        // Explicitly defining them guarantees injection, regardless of how Docker/Vite parses the .env
        'import.meta.env.VITE_PARSE_APP_ID': JSON.stringify(process.env.VITE_PARSE_APP_ID || env.VITE_PARSE_APP_ID || ''),
        'import.meta.env.VITE_PARSE_JS_KEY': JSON.stringify(process.env.VITE_PARSE_JS_KEY || env.VITE_PARSE_JS_KEY || '')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
