import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  base: '/epl-fantasy/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        2024: resolve(import.meta.dirname, '2024.html'),
        2025: resolve(import.meta.dirname, '2025.html'),
        2026: resolve(import.meta.dirname, '2026.html'),
      },
    },
  },
})
