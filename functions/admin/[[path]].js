/**
 * /functions/admin/[[path]].js
 *
 * Cloudflare Pages Function — Auth Gate + SPA fallback for /admin/*
 *
 * UX gate only: prevents unauthenticated users from downloading the admin
 * JS bundle. Real security is enforced by Supabase RLS. No cryptographic
 * JWT verification is performed here.
 *
 * Supabase JS v2 stores the session in localStorage AND sets cookies named:
 *   sb-<project-ref>-auth-token  (chunked: -0, -1, …)
 * The approach here: look for any cookie that starts with "sb-" and "-auth-token"
 * and contains a plausible JWT shape (three base64url segments separated by dots).
 */

const JWT_SHAPE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

function hasValidSessionCookie(cookieHeader) {
  if (!cookieHeader) return false;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    const eqIdx = cookie.indexOf('=');
    if (eqIdx === -1) continue;
    const name = cookie.slice(0, eqIdx).trim();
    const value = cookie.slice(eqIdx + 1).trim();

    if (name.startsWith('sb-') && name.includes('-auth-token')) {
      try {
        const decoded = decodeURIComponent(value);
        if (decoded.startsWith('{')) {
          const parsed = JSON.parse(decoded);
          if (parsed.access_token && JWT_SHAPE.test(parsed.access_token)) {
            return true;
          }
        } else if (JWT_SHAPE.test(decoded)) {
          return true;
        }
      } catch {
        // fall through
      }
    }
  }
  return false;
}

/**
 * Serve dist/admin/index.html directly via ASSETS binding.
 * This is the SPA shell — React Router handles client-side routing.
 */
function serveAdminIndex(env, request) {
  const indexUrl = new URL('/admin/index.html', request.url);
  return env.ASSETS.fetch(new Request(indexUrl.toString(), { method: 'GET', headers: request.headers }));
}

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Login page: no auth check needed, but still needs SPA fallback
  if (pathname === '/admin/login' || pathname === '/admin/login/') {
    const response = await next();
    return response.status === 404 ? serveAdminIndex(env, request) : response;
  }

  // All other /admin/* routes require a valid session
  const cookieHeader = request.headers.get('Cookie');
  if (!hasValidSessionCookie(cookieHeader)) {
    return Response.redirect(new URL('/admin/login', request.url).toString(), 302);
  }

  // Serve the static asset (JS chunks, CSS, images, etc.)
  // If not found (i.e. a client-side route like /admin/posts/123), serve the SPA shell
  const response = await next();
  return response.status === 404 ? serveAdminIndex(env, request) : response;
}
