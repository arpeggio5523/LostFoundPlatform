import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup/setup.js',
    include: [
      'tests/unit/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'tests/integration/**/*.{test,spec}.{js,jsx,ts,tsx}',
    ],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'cobertura'],
    },
    reporters: ['default', 'junit'],
    outputFile: {
      junit: 'vitest-junit.xml'
    },
  },
});
