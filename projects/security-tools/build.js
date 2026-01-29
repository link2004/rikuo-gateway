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
  const mdFiles = getMarkdownFiles('.');
  const articles = {};

  for (const file of mdFiles) {
    const relativePath = file.startsWith('./') ? file : './' + file;
    const content = fs.readFileSync(file, 'utf-8');
    const html = marked.parse(content);
    articles[relativePath] = html;
  }

  const articlesJson = JSON.stringify(articles);
  const scriptTag = `<script>window.__ARTICLES__ = ${articlesJson};</script>`;

  let indexHtml = fs.readFileSync('index.html', 'utf-8');
  indexHtml = indexHtml.replace('<!-- ARTICLES_PLACEHOLDER -->', scriptTag);

  fs.writeFileSync('dist/index.html', indexHtml);
  console.log('Build complete! Output: dist/index.html');
}

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

build();
