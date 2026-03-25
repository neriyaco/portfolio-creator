/**
 * /functions/media/[[path]].js
 *
 * Cloudflare Pages Function — Supabase Storage Image Proxy
 *
 * Proxies requests from /media/<filename> to the corresponding
 * Supabase Storage public object and caches the response at the
 * Cloudflare edge with long-lived headers.
 *
 * Environment variable required (set in Cloudflare Pages dashboard):
 *   SUPABASE_URL — e.g. https://xyzxyz.supabase.co
 */

export async function onRequest(context) {
  const { request, env, params } = context;

  const supabaseUrl = env.SUPABASE_URL;
  if (!supabaseUrl) {
    return new Response('SUPABASE_URL environment variable is not set', { status: 500 });
  }

  // params.path is an array of path segments after /media/
  const pathSegments = params.path ?? [];
  const assetPath = pathSegments.join('/');

  if (!assetPath) {
    return new Response('Not found', { status: 404 });
  }

  const storageUrl = `${supabaseUrl}/storage/v1/object/public/portfolio/${assetPath}`;

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(storageUrl, {
      method: 'GET',
      headers: {
        // Forward range requests for large files
        ...(request.headers.has('Range')
          ? { Range: request.headers.get('Range') }
          : {}),
      },
      cf: {
        // Tell Cloudflare's cache to treat this as a cacheable resource
        cacheEverything: true,
        cacheTtl: 31536000,
      },
    });
  } catch (err) {
    return new Response('Failed to fetch from storage', { status: 502 });
  }

  if (!upstreamResponse.ok) {
    return new Response(upstreamResponse.statusText, {
      status: upstreamResponse.status,
    });
  }

  // Build response with immutable cache headers
  const headers = new Headers(upstreamResponse.headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  // Remove Supabase-internal headers that shouldn't leak
  headers.delete('x-sb-request-id');

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers,
  });
}
