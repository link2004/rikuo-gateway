const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// マークダウンファイルのパス
const mdFiles = [
    'ベストプラクティス/01_検証方法を提供する.md',
    'ベストプラクティス/02_探索から計画そして実装へ.md',
    'ベストプラクティス/03_具体的なコンテキストを提供する.md',
    'ベストプラクティス/04_リッチなコンテンツを提供する.md',
    'ベストプラクティス/05_環境を設定する.md',
    'ベストプラクティス/06_効果的にコミュニケーションする.md',
    'ベストプラクティス/07_セッションを管理する.md',
    'ベストプラクティス/08_自動化とスケーリング.md',
    'ベストプラクティス/09_よくある失敗パターンを避ける.md',
    'ベストプラクティス/10_直感を養う.md'
];

// 各マークダウンファイルをHTMLに変換
const articles = {};
for (const filePath of mdFiles) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        articles[filePath] = marked.parse(content);
        console.log(`✓ ${filePath}`);
    } catch (e) {
        console.error(`✗ ${filePath}: ${e.message}`);
    }
}

// index.htmlを読み込み
let html = fs.readFileSync('index.html', 'utf-8');

// 事前ビルドされた記事を埋め込む
const articlesScript = `<script>window.__ARTICLES__ = ${JSON.stringify(articles)};</script>`;
html = html.replace('</head>', `${articlesScript}\n</head>`);

// 保存
fs.writeFileSync('index.html', html);
console.log('\n✓ Build complete!');
