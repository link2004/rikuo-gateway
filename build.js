const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECTS_DIR = 'projects';
const DIST_DIR = 'dist';
const SRC_DIR = 'src';

// プロジェクト設定
const projects = [
  { dir: 'nintendo-philosophy', name: 'Nintendo Philosophy', icon: '🎮', desc: '任天堂を作った伝説の人々と哲学' },
  { dir: 'security-tools', name: 'Security Tools', icon: '🔐', desc: 'セキュリティツールの知識集' },
  { dir: 'claude-code', name: 'Claude Code', icon: '🤖', desc: 'Claude Codeベストプラクティス' },
  { dir: 'levelsio', name: 'Levelsio Research', icon: '🚀', desc: 'Pieter Levelsのプロダクトと戦略' },
];

function cleanDist() {
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip node_modules, .git, .wrangler, .github, .claude
    if (['.git', 'node_modules', '.wrangler', '.github', '.claude'].includes(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function buildProject(project) {
  const projectPath = path.join(PROJECTS_DIR, project.dir);
  const distPath = path.join(DIST_DIR, project.dir);

  console.log(`\n📦 Building ${project.name}...`);

  // Check if project has build.js
  const buildScript = path.join(projectPath, 'build.js');
  if (fs.existsSync(buildScript)) {
    // Run project's build script
    try {
      execSync(`node build.js`, { cwd: projectPath, stdio: 'inherit' });
    } catch (e) {
      console.error(`  ⚠️  Build script failed, copying as-is`);
    }
  }

  // Copy built project to dist
  copyDir(projectPath, distPath);

  // Remove unnecessary files from dist
  const filesToRemove = ['build.js', 'package.json', 'package-lock.json', 'README.md'];
  for (const file of filesToRemove) {
    const filePath = path.join(distPath, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  // Remove dist subdirectory if exists (security-tools has one)
  const subDist = path.join(distPath, 'dist');
  if (fs.existsSync(subDist)) {
    fs.rmSync(subDist, { recursive: true });
  }

  console.log(`  ✅ ${project.name} → dist/${project.dir}/`);
}

function buildLandingPage() {
  console.log('\n🏠 Building landing page...');

  const landingPath = path.join(SRC_DIR, 'index.html');
  if (fs.existsSync(landingPath)) {
    fs.copyFileSync(landingPath, path.join(DIST_DIR, 'index.html'));
  } else {
    // Generate landing page
    const projectLinks = projects.map(p => `
      <a href="/${p.dir}/" class="card">
        <span class="icon">${p.icon}</span>
        <span class="title">${p.name}</span>
        <span class="desc">${p.desc}</span>
      </a>`).join('');

    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>rikuo</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      background: #0a0a0a;
      color: #fff;
      padding: 60px 20px;
    }
    .container { max-width: 800px; margin: 0 auto; }
    h1 {
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 16px;
      text-align: center;
    }
    .subtitle {
      font-size: 32px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 48px;
      letter-spacing: -0.02em;
    }
    .projects {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }
    .card {
      display: flex;
      flex-direction: column;
      padding: 32px 24px;
      background: #1a1a1a;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      text-decoration: none;
      color: inherit;
      transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    }
    .card:hover {
      transform: translateY(-4px);
      border-color: rgba(255,255,255,0.15);
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }
    .icon { font-size: 48px; margin-bottom: 20px; }
    .title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      letter-spacing: -0.01em;
    }
    .desc {
      font-size: 14px;
      color: #888;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Knowledge Base</h1>
    <p class="subtitle">Projects</p>
    <div class="projects">${projectLinks}
    </div>
  </div>
</body>
</html>`;

    fs.writeFileSync(path.join(DIST_DIR, 'index.html'), html);
  }
  console.log('  ✅ Landing page → dist/index.html');
}

// Main
console.log('🚀 Building rikuo-gateway...\n');
console.log('━'.repeat(40));

cleanDist();

for (const project of projects) {
  buildProject(project);
}

buildLandingPage();

console.log('\n' + '━'.repeat(40));
console.log('\n✨ Build complete! Output: dist/\n');
