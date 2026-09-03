import fs from 'fs';
import path from 'path';

const type = process.argv[2]; // 'vitest' or 'playwright'
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const pipelineSource = process.env.CI_PIPELINE_SOURCE || 'unknown';
const userLogin = process.env.GITLAB_USER_LOGIN || 'unknown';
const refSlug = process.env.CI_COMMIT_REF_SLUG || 'unknown';
const iid = process.env.CI_PIPELINE_IID || 'unknown';
const sha = process.env.CI_COMMIT_SHORT_SHA || 'unknown';

const reportName = `${type}_${pipelineSource}_${userLogin}_${refSlug}_pipeline-${iid}_${sha}_${timestamp}`;

fs.mkdirSync('reports', { recursive: true });

if (type === 'vitest') {
    if (fs.existsSync('vitest-junit.xml')) fs.renameSync('vitest-junit.xml', `reports/${reportName}_junit.xml`);
    if (fs.existsSync('coverage/cobertura-coverage.xml')) fs.renameSync('coverage/cobertura-coverage.xml', `reports/${reportName}_cobertura.xml`);
    if (fs.existsSync('reports/vitest-report.md')) fs.renameSync('reports/vitest-report.md', `reports/${reportName}_report.md`);
} else if (type === 'playwright') {
    if (fs.existsSync('playwright-junit.xml')) fs.renameSync('playwright-junit.xml', `reports/${reportName}_junit.xml`);
    if (fs.existsSync('reports/playwright-report.md')) fs.renameSync('reports/playwright-report.md', `reports/${reportName}_report.md`);
}

console.log(`Successfully renamed ${type} reports to ${reportName}`);
