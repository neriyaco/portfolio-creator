/**
 * /functions/admin/[[path]].js
 *
 * Cloudflare Pages Function — Auth Gate for /admin/*
 *
 * UX gate only: prevents unauthenticated users from downloading the admin
 * JS bundle. Real security is enforced by Supabase RLS.
 *
 * SPA routing is handled by _redirects (/admin/* → /admin/index.html 200).
 * next() passes through the full CF Pages asset pipeline (static files +
 * _redirects), so there is no need to call env.ASSETS.fetch() directly.
 *
 * Supabase JS v2 stores the session in localStorage AND sets cookies named:
 *   sb-<project-ref>-auth-token  (chunked: -0, -1, …)
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

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Login page: allow through without auth check.
  // _redirects serves /admin/index.html (SPA shell) since no static file exists.
  if (pathname === '/admin/login' || pathname === '/admin/login/') {
    return next();
  }

  // All other /admin/* routes require a valid session cookie
  const cookieHeader = request.headers.get('Cookie');
  if (!hasValidSessionCookie(cookieHeader)) {
    return Response.redirect(new URL('/admin/login', request.url).toString(), 302);
  }

  // Authenticated: let the CF Pages asset pipeline handle the rest.
  // Static assets (.js/.css/etc.) are served directly.
  // Unknown SPA routes fall through to _redirects → /admin/index.html 200.
  return next();
}

