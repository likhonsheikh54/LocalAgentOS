import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.test.js'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});