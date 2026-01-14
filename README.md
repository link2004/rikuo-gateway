# rikuo-gateway

`rikuo.pages.dev` のゲートウェイ。複数の独立したリポジトリをサブパスで公開する。

## 構成

```
rikuo.pages.dev/                     → index.html（ランディング）
rikuo.pages.dev/nintendo-philosophy/ → nintendo-philosophy.pages.dev へプロキシ
rikuo.pages.dev/xxx/                 → xxx.pages.dev へプロキシ
```

## 仕組み

Cloudflare Pages Functions を使用。各サブパスへのリクエストを対応する Pages プロジェクトにプロキシする。

```
functions/
└── nintendo-philosophy/
    └── [[path]].js      ← /nintendo-philosophy/* を nintendo-philosophy.pages.dev にプロキシ
```

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

`functions/<project-name>/[[path]].js` を作成:

```javascript
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace('/<project-name>', '') || '/';

  const targetUrl = `https://<project-name>.pages.dev${path}${url.search}`;

  const response = await fetch(targetUrl, {
    method: context.request.method,
    headers: context.request.headers,
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
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
