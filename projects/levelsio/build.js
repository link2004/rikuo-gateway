const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

function getMarkdownFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!item.startsWith('.') && item !== 'node_modules') {
        getMarkdownFiles(fullPath, files);
      }
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

function build() {
  console.log('Building...');

  const mdFiles = getMarkdownFiles('.');
  console.log(`Found ${mdFiles.length} markdown files`);

  const articles = {};
  for (const file of mdFiles) {
    const relativePath = file.startsWith('./') ? file : './' + file;
    const content = fs.readFileSync(file, 'utf-8');
    const html = marked.parse(content);
    articles[relativePath] = html;
    console.log(`  Converted: ${relativePath}`);
  }

  let indexHtml = fs.readFileSync('index.html', 'utf-8');

  const articlesJson = JSON.stringify(articles);
  const scriptTag = `<script>window.__ARTICLES__ = ${articlesJson};</script>`;

  if (indexHtml.includes('window.__ARTICLES__')) {
    indexHtml = indexHtml.replace(
      /<script>window\.__ARTICLES__\s*=\s*.*?<\/script>/s,
      scriptTag
    );
  } else {
    indexHtml = indexHtml.replace('</head>', `${scriptTag}\n</head>`);
  }

  fs.writeFileSync('index.html', indexHtml);
  console.log('Build complete!');
}

build();
