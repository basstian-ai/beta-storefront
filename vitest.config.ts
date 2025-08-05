// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'; // Required for testing React components
import path from 'node:path'; // Import path module for alias resolution

export default defineConfig({
  plugins: [react()], // Add if you're testing React components
  resolve: { // Add resolve section for aliases
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@root': path.resolve(__dirname, './'),
    },
  },
  test: {
    globals: true, // Use Vitest global APIs without importing them
    environment: 'jsdom', // Simulate a browser environment for tests
    setupFiles: './vitest.setup.ts', // Optional: for global test setup
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'tests/**/*.{test,spec}.{ts,tsx}',
      '__tests__/unit/**/*.{test,spec}.{ts,tsx}',
    ],
    coverage: {
      exclude: ['lib/api.ts', 'lib/telemetry.js', 'lib/pim/**'],
    },
  },
});
