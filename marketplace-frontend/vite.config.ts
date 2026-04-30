import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { UserConfig } from 'vite';
import type { InlineConfig } from 'vitest/node';

interface VitestConfigExport extends UserConfig {
  test?: InlineConfig;
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
} as VitestConfigExport)
