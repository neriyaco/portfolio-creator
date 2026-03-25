/**
 * /functions/admin/[[path]].js
 *
 * Cloudflare Pages Function — Auth Gate for /admin/*
 *
 * UX gate only: prevents unauthenticated users from downloading the admin
 * JS bundle. Real security is enforced by Supabase RLS.
 *
 * next() only resolves exact static file matches — it does NOT process
 * _redirects. For SPA routes we must explicitly serve /admin/index.html
 * via env.ASSETS.fetch().
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

function serveShell(request, env) {
  return env.ASSETS.fetch(new URL('/admin/index.html', request.url).toString());
}

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Static assets (hashed JS/CSS/fonts/images): serve directly via next()
  if (/\.(js|css|ico|png|jpe?g|gif|svg|woff2?|ttf|eot|map)(\?.*)?$/.test(pathname)) {
    return next();
  }

  // Login page is public — serve SPA shell without auth check
  if (pathname === '/admin/login' || pathname === '/admin/login/') {
    return serveShell(request, env);
  }

  // All other /admin/* routes require a valid session cookie
  const cookieHeader = request.headers.get('Cookie');
  if (!hasValidSessionCookie(cookieHeader)) {
    return Response.redirect(new URL('/admin/login', request.url).toString(), 302);
  }

  // Authenticated: serve SPA shell for all non-asset routes
  return serveShell(request, env);
}
