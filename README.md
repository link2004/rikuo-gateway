# rikuo-gateway

`rikuo.pages.dev` のゲートウェイ。複数の独立したリポジトリをサブパスで公開する。

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────────────┐
│                        rikuo.pages.dev                          │
│                       (このリポジトリ)                            │
├─────────────────────────────────────────────────────────────────┤
│  /                      → index.html (ランディング)              │
│  /nintendo-philosophy/* → nintendo-philosophy.pages.dev へプロキシ│
│  /xxx/*                 → xxx.pages.dev へプロキシ               │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ プロキシ (Pages Functions)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              nintendo-philosophy.pages.dev                      │
│              (別リポジトリ・別Pagesプロジェクト)                   │
└─────────────────────────────────────────────────────────────────┘
```

## アクセス方法

各プロジェクトは **2つのURL** でアクセス可能:

| URL | 説明 |
|-----|------|
| `rikuo.pages.dev/nintendo-philosophy/` | 本番URL（推奨） |
| `nintendo-philosophy.pages.dev` | 直接アクセス（プロキシなし） |

※ リダイレクトはしない。どちらも同じ内容が表示される。

## 仕組み

### プロキシ処理

Cloudflare Pages Functions でリクエストを対応する Pages プロジェクトにプロキシ。

```
functions/
├── nintendo-philosophy.js        ← /nintendo-philosophy をハンドル
└── nintendo-philosophy/
    └── [[path]].js               ← /nintendo-philosophy/* をハンドル
```

### 相対パスの解決

プロキシ時に `<base href="/nintendo-philosophy/">` タグをHTMLに挿入。
これにより、画像やリンクの相対パスが正しく解決される。

## 新しいプロジェクトを追加する方法

### 1. 新プロジェクト用の Pages プロジェクトを作成

```bash
npx wrangler pages project create <project-name> --production-branch main
```

### 2. プロジェクトをデプロイ

```bash
cd /path/to/project
npx wrangler pages deploy . --project-name <project-name> --branch main
```

### 3. ルーティング用の Function を追加

2つのファイルを作成:

**`functions/<project-name>.js`** (末尾スラッシュなしのパス用):

```javascript
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const targetUrl = `https://<project-name>.pages.dev/${url.search}`;

  const response = await fetch(targetUrl, {
    method: context.request.method,
    headers: context.request.headers,
  });

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('text/html')) {
    let html = await response.text();
    html = html.replace('<head>', '<head>\n<base href="/<project-name>/">');

    const headers = new Headers(response.headers);
    headers.delete('content-length');

    return new Response(html, { status: response.status, headers });
  }

  return response;
}
```

**`functions/<project-name>/[[path]].js`** (サブパス用):

```javascript
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace('/<project-name>', '') || '/';
  const targetUrl = `https://<project-name>.pages.dev${path}${url.search}`;

  const response = await fetch(targetUrl, {
    method: context.request.method,
    headers: context.request.headers,
  });

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('text/html')) {
    let html = await response.text();
    html = html.replace('<head>', '<head>\n<base href="/<project-name>/">');

    const headers = new Headers(response.headers);
    headers.delete('content-length');

    return new Response(html, { status: response.status, headers });
  }

  return response;
}
```

### 4. ランディングページにリンクを追加（任意）

`index.html` にリンクを追加:

```html
<a href="/<project-name>/">Project Name</a>
```

### 5. デプロイ

```bash
npx wrangler pages deploy . --project-name rikuo --branch main
```

## 現在のプロジェクト一覧

| パス | プロキシ先 | リポジトリ |
|------|-----------|-----------|
| `/nintendo-philosophy/` | nintendo-philosophy.pages.dev | [link2004/nintendo-philosophy](https://github.com/link2004/nintendo-philosophy) |

## 自動デプロイ

GitHub Actions で `main` ブランチに push すると自動デプロイされる。

### 必要なSecrets

| Secret | 説明 |
|--------|------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare APIトークン |
| `CLOUDFLARE_ACCOUNT_ID` | CloudflareアカウントID |

### Secretsの設定方法

1. [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens) でトークン作成
   - テンプレート: **Edit Cloudflare Workers**
2. GitHubリポジトリの Settings → Secrets and variables → Actions に設定

## 備考

- 各プロジェクトは独立したリポジトリで管理
- プロキシ先のプロジェクトが更新されると、`rikuo.pages.dev` 経由のアクセスにも自動反映
- `main` に push すると GitHub Actions で自動デプロイ
