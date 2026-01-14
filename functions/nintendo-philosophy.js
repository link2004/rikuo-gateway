// /nintendo-philosophy へのアクセスもプロキシ（<base>タグ挿入）
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const targetUrl = `https://nintendo-philosophy.pages.dev/${url.search}`;

  const response = await fetch(targetUrl, {
    method: context.request.method,
    headers: context.request.headers,
  });

  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('text/html')) {
    let html = await response.text();
    html = html.replace('<head>', '<head>\n<base href="/nintendo-philosophy/">');

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.set('cache-control', 'no-cache');

    return new Response(html, {
      status: response.status,
      headers,
    });
  }

  return response;
}
