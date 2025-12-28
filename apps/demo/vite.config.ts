import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {
      // Resolve workspace packages to their source during development
      '@react-solitaire/core': path.resolve(__dirname, '../../packages/core/src'),
      '@react-solitaire/react': path.resolve(__dirname, '../../packages/react/src'),
    },
  },
  optimizeDeps: {
    // Force Vite to pre-bundle these workspace packages
    include: ['react', 'react-dom', 'styled-components'],
  },
});
