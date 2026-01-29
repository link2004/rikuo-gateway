const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Markdownファイルを再帰的に取得
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

// ビルド実行
function build() {
  console.log('Building...');

  // Markdownファイルを取得
  const mdFiles = getMarkdownFiles('.');
  console.log(`Found ${mdFiles.length} markdown files`);

  // 各ファイルをHTMLに変換
  const articles = {};
  for (const file of mdFiles) {
    const relativePath = file.startsWith('./') ? file : './' + file;
    const content = fs.readFileSync(file, 'utf-8');
    const html = marked.parse(content);
    articles[relativePath] = html;
    console.log(`  Converted: ${relativePath}`);
  }

  // index.htmlを読み込み
  let indexHtml = fs.readFileSync('index.html', 'utf-8');

  // 埋め込みデータのプレースホルダーを探すか、新規挿入
  const articlesJson = JSON.stringify(articles);
  const scriptTag = `<script>window.__ARTICLES__ = ${articlesJson};</script>`;

  // 既存の埋め込みがあれば置換、なければ</head>の前に挿入
  if (indexHtml.includes('window.__ARTICLES__')) {
    indexHtml = indexHtml.replace(
      /<script>window\.__ARTICLES__\s*=\s*.*?<\/script>/s,
      scriptTag
    );
  } else {
    indexHtml = indexHtml.replace('</head>', `${scriptTag}\n</head>`);
  }

  // index.htmlを保存
  fs.writeFileSync('index.html', indexHtml);
  console.log('Build complete!');
}

build();
