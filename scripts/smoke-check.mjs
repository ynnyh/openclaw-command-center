import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = process.cwd();

function fail(message) {
  throw new Error(message);
}

function expectFile(path) {
  const fullPath = join(repoRoot, path);
  if (!existsSync(fullPath)) {
    fail(`Missing required file: ${path}`);
  }
  return fullPath;
}

function read(path) {
  return readFileSync(expectFile(path), 'utf8');
}

function expectIncludes(path, snippet) {
  const content = read(path);
  if (!content.includes(snippet)) {
    fail(`Expected ${path} to include: ${snippet}`);
  }
}

function expectNotIncludes(path, snippet) {
  const content = read(path);
  if (content.includes(snippet)) {
    fail(`Expected ${path} not to include: ${snippet}`);
  }
}

function expectNoBundledPreviewPngs(dir) {
  const fullPath = expectFile(dir);
  const pngs = readdirSync(fullPath).filter((name) => name.toLowerCase().endsWith('.png'));
  if (pngs.length) {
    fail(`Expected ${dir} to be free of bundled PNG screenshots, found: ${pngs.join(', ')}`);
  }
}

[
  'README.md',
  'README.en.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'install.ps1',
  'install.sh',
  '.env.example',
  'docs/AI-QUICKSTART.md',
  'docs/architecture.md',
  'docs/compatibility.md',
  'docs/troubleshooting.md',
  'examples/openclaw.command-center.patch.json',
  'examples/docker-compose.command-center.override.yml',
  'scripts/command-center-helper.mjs',
  'scripts/ensure-command-center-helper.ps1',
  'scripts/install-command-center-helper-autostart.ps1',
  'shell/index.html',
  'shell/mission-control.html',
  'shell/mission-control-overview.html',
  'shell/mission-control-assets/README.md',
  '.github/workflows/smoke.yml',
  '.github/pull_request_template.md',
  '.github/ISSUE_TEMPLATE/bug_report.md',
  '.github/ISSUE_TEMPLATE/feature_request.md',
  '.github/ISSUE_TEMPLATE/config.yml'
].forEach(expectFile);

expectIncludes('README.md', '[English](README.en.md)');
expectIncludes('README.md', '## 这是什么');

expectIncludes('README.en.md', 'The public README does not embed product screenshots');
expectIncludes('README.en.md', '[中文](README.md)');
expectIncludes('README.md', '贡献指南：`CONTRIBUTING.md`');
expectIncludes('README.md', '安全策略：`SECURITY.md`');
expectIncludes('README.en.md', 'Contribution guide: `CONTRIBUTING.md`');
expectIncludes('README.en.md', 'Security policy: `SECURITY.md`');

expectIncludes('install.sh', 'examples/openclaw.command-center.patch.json');
expectIncludes('install.sh', 'examples/docker-compose.command-center.override.yml');
expectIncludes('install.ps1', 'openclaw.command-center.patch.json');
expectIncludes('install.ps1', 'docker-compose.command-center.override.yml');

expectIncludes('.env.example', 'COMMAND_CENTER_HELPER_HOST=127.0.0.1');
expectIncludes('.env.example', 'COMMAND_CENTER_ALLOWED_ORIGINS=');
expectIncludes('.env.example', 'COMMAND_CENTER_OUTPUT_DIR=');

expectIncludes('shell/index.html', 'Control Center');
expectIncludes('shell/index.html', 'Loading models...');
expectNotIncludes('shell/index.html', '鎸囨尌');
expectNotIncludes('shell/index.html', '妯″瀷鍔犺浇');

expectNotIncludes('shell/mission-control.html', 'overview-hero-zh.png');
expectNotIncludes('shell/mission-control.html', 'token-share-zh.png');
expectNotIncludes('shell/mission-control.html', 'staff-zh.png');
expectIncludes('shell/mission-control-assets/README.md', 'free of bundled product screenshots');

expectNoBundledPreviewPngs('shell/mission-control-assets');

[
  'docs/command-center-installer-spec.md',
  'docs/command-center-open-source-plan.md',
  'docs/command-center-public-file-manifest.md',
  'docs/command-center-public-readme-template.md',
  'README.zh-CN.md',
  'screenshots/overview-hero-zh.png',
  'screenshots/staff-zh.png',
  'screenshots/token-share-zh.png'
].forEach((path) => {
  if (existsSync(join(repoRoot, path))) {
    fail(`Unexpected legacy file still present: ${path}`);
  }
});

console.log('Smoke check passed.');
