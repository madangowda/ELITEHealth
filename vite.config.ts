
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Essential for GitHub Pages sub-folder hosting
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        // Splits large dependencies into separate files to fix the 500kb warning
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-utils': ['lucide-react', 'recharts'],
          'vendor-ai': ['@google/genai']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  define: {
    // Ensures process.env.API_KEY is available in the browser environment
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
