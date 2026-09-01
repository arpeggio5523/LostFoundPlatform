import { defineConfig } from 'vitest/config';
import { VitestMarkdownReporter } from 'vitest-markdown-reporter';

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
      reporter: ['text', 'cobertura', 'html'],
    },
    reporters: ['default', 'junit', 'html', new VitestMarkdownReporter()],
    outputFile: {
      junit: 'vitest-junit.xml',
      markdown: 'reports/vitest-report.md'
    },
  },
});
