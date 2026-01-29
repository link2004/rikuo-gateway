# nintendo-philosophy

任天堂を作った伝説の人々と哲学を紹介するWebサイト。

## URL

- **本番**: https://rikuo.pages.dev/nintendo-philosophy/
- **直接**: https://nintendo-philosophy.pages.dev/

## 開発

### ローカルで確認

```bash
# 任意のHTTPサーバーで確認
npx serve .
```

### ビルド

Markdownファイルを事前にHTMLに変換して `index.html` に埋め込む。

```bash
npm install
npm run build
```

### 手動デプロイ

```bash
npm run build
npx wrangler pages deploy . --project-name nintendo-philosophy --branch main
```

## 自動デプロイ

GitHub Actions で `main` ブランチに push すると自動でビルド＆デプロイされる。

### 必要なSecrets

| Secret | 説明 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare APIトークン |
| `CLOUDFLARE_ACCOUNT_ID` | CloudflareアカウントID |

### Secretsの設定方法

1. [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) でトークン作成
   - テンプレート: **Edit Cloudflare Workers**
2. GitHubリポジトリの Settings → Secrets and variables → Actions に設定

## 構成

```
├── index.html          # メインHTML（ビルドでMarkdownが埋め込まれる）
├── build.js            # ビルドスクリプト
├── images/             # 画像ファイル
├── 岩田聡/              # 岩田聡のコンテンツ
├── 宮本茂/              # 宮本茂のコンテンツ
├── 桜井政博/            # 桜井政博のコンテンツ
└── 哲学/                # 哲学のコンテンツ
```

## コンテンツ追加

1. 該当ディレクトリに `.md` ファイルを追加
2. `index.html` の設定（icons等）を更新
3. `npm run build` でビルド
4. push で自動デプロイ
