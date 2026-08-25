import svelteConfig from './svelte.config.js';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';

export default defineConfig([
  globalIgnores(['dist/', 'ref/']),
  js.configs.recommended,
  svelte.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ['**/*.svelte', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        svelteConfig
      }
    }
  }
]);
