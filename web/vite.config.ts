/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from https://trickster-2005.github.io/Deutsch-Learning-Tool/
export default defineConfig({
  base: '/Deutsch-Learning-Tool/',
  plugins: [react()],
  build: { outDir: 'dist', chunkSizeWarningLimit: 800 },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
