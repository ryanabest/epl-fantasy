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
        main: resolve(__dirname, 'index.html'),
        2024: resolve(__dirname, '2024.html'),
        2025: resolve(__dirname, '2025.html'),
      },
    },
  },
})
