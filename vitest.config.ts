// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'; // Required for testing React components

export default defineConfig({
  plugins: [react()], // Add if you're testing React components
  test: {
    globals: true, // Use Vitest global APIs without importing them
    environment: 'jsdom', // Simulate a browser environment for tests
    setupFiles: './vitest.setup.ts', // Optional: for global test setup
    include: ['src/**/*.test.{ts,tsx}'], // Pattern to find test files
  },
});
