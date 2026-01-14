export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace('/nintendo-philosophy', '') || '/';

  const targetUrl = `https://nintendo-philosophy.pages.dev${path}${url.search}`;

  const response = await fetch(targetUrl, {
    method: context.request.method,
    headers: context.request.headers,
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
