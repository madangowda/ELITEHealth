
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from the current directory.
  // The third parameter '' allows loading variables without the VITE_ prefix.
  // Fix: Property 'cwd' does not exist on type 'Process'. Casting process to any to access the Node.js cwd method in the config environment.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    // Relative base path is critical for GitHub Pages sub-directory hosting
    base: './',
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      rollupOptions: {
        output: {
          // Splitting large libraries into separate chunks to satisfy build performance warnings
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-ui': ['lucide-react'],
            'vendor-charts': ['recharts'],
            'vendor-ai': ['@google/genai']
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
    define: {
      // Injects the API key into the browser environment at build-time.
      // This maps the system environment variable to process.env.API_KEY as required by the SDK instructions.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.VITE_GEMINI_API_KEY || "")
    }
  };
});
