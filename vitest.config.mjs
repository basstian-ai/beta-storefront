import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react'; // Import the plugin

export default defineConfig({
  plugins: [react()], // Add the React plugin
  test: {
    globals: true, // Makes describe, it, expect, etc. available globally
    environment: 'jsdom', // Simulates a browser environment
    setupFiles: ['./tests/setup.js'], // Path to the global setup file
    css: true, // Process CSS files, important for CSS Modules
  },
});
