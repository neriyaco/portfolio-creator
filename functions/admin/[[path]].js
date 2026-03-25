/**
 * /functions/admin/[[path]].js
 *
 * Cloudflare Pages Function — Auth Gate for /admin/*
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

    // Match Supabase v2 auth cookie names: sb-*-auth-token or sb-*-auth-token-0 etc.
    if (name.startsWith('sb-') && name.includes('-auth-token')) {
      // Value may be URL-encoded JSON — check for JWT shape directly or inside JSON
      try {
        const decoded = decodeURIComponent(value);
        // Chunk 0 or only chunk contains the access_token
        if (decoded.startsWith('{')) {
          const parsed = JSON.parse(decoded);
          if (parsed.access_token && JWT_SHAPE.test(parsed.access_token)) {
            return true;
          }
        } else if (JWT_SHAPE.test(decoded)) {
          return true;
        }
      } catch {
        // If decoding/parsing fails, fall through to next cookie
      }
    }
  }
  return false;
}

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Always allow the login page through to prevent redirect loops
  if (pathname === '/admin/login' || pathname === '/admin/login/') {
    return next();
  }

  // Also allow static assets that the login page needs
  // (Cloudflare serves these directly, but belt-and-suspenders)
  const cookieHeader = request.headers.get('Cookie');
  if (hasValidSessionCookie(cookieHeader)) {
    return next();
  }

  // No valid session — redirect to login
  return Response.redirect(new URL('/admin/login', request.url).toString(), 302);
}
