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
      'src/**/*.test.{ts,tsx,js,jsx}',
    ],
    // Ensure tests are colocated with their routes; prevent loose tests in api root
    exclude: ['src/app/api/*.test.{ts,tsx,js,jsx}'],
    coverage: {
      exclude: ['src/lib/api.ts', 'src/lib/telemetry.js', 'src/lib/pim/**'],
    },
  },
});
