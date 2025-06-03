import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Makes describe, it, expect, etc. available globally
    environment: 'jsdom', // Simulates a browser environment
    setupFiles: ['./tests/setup.js'], // Path to the global setup file
  },
});
