import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],

  build: {
    outDir: 'dist',
    emptyOutDir: true,

    // Removes the warning about chunks larger than 500 kB
    chunkSizeWarningLimit: 1000
  }
});