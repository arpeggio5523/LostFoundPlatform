import fs from 'fs';

export default class MarkdownReporter {
  onBegin(config, suite) {
    this.suite = suite;
  }

  onEnd(result) {
    let md = `# Playwright Test Results\n\n`;
    md += `**Status:** ${result.status}\n`;
    md += `**Start Time:** ${result.startTime.toLocaleString()}\n`;
    md += `**Duration:** ${result.duration}ms\n\n`;

    const addTests = (suite, depth) => {
      for (const test of suite.tests) {
        const icon = test.outcome() === 'expected' ? '✅' : test.outcome() === 'skipped' ? '⏭️' : '❌';
        md += `${'#'.repeat(depth)} ${icon} ${test.title}\n`;
        for (const testResult of test.results) {
            if (testResult.error) {
                md += `\n\`\`\`\n${testResult.error.stack || testResult.error.message}\n\`\`\`\n`;
            }
        }
      }
      for (const child of suite.suites) {
        if (child.title) {
            md += `${'#'.repeat(depth)} ${child.title}\n`;
        }
        addTests(child, depth + (child.title ? 1 : 0));
      }
    };
    
    if (this.suite) {
        addTests(this.suite, 2);
    }

    fs.mkdirSync('reports', { recursive: true });
    fs.writeFileSync('reports/playwright-report.md', md);
  }
}
