import type { Env, UserRow } from './types';

const enc = (s: string) => new TextEncoder().encode(s);
const dec = (b: ArrayBuffer) => new TextDecoder().decode(b);

export function newId(): string {
  const b = crypto.getRandomValues(new Uint8Array(16));
  let s = '';
  for (let i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, '0');
  return s;
}

export function randomToken(): string {
  const b = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...b))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map(x => x.toString(16).padStart(2, '0')).join('');
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', key, enc(data)));
}

export async function hashToken(token: string, secret: string): Promise<string> {
  return hmac(secret, `session:${token}`);
}

// PBKDF2 password hashing (Web Crypto — no native deps needed on Workers)
// Note: Workers runtime rejects iteration counts above 100000.
export async function hashPassword(password: string): Promise<string> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = toHex(saltBytes.buffer);
  const hash = await pbkdf2(password, salt, 100000, 32);
  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, expected] = stored.split(':');
  if (!salt || !expected) return false;
  const hash = await pbkdf2(password, salt, 100000, 32);
  const a = Uint8Array.from(enc(expected));
  const b = Uint8Array.from(enc(hash));
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function pbkdf2(password: string, salt: string, iterations: number, length: number): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey('raw', enc(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc(salt), iterations, hash: 'SHA-256' },
    keyMaterial,
    length * 8,
  );
  return toHex(bits);
}

export function newTicket(secret: string, payload: Record<string, string>): Promise<string> {
  const body = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return hmac(secret, `ticket:${body}`).then(sig => `${body}.${sig}`);
}

export async function verifyTicketAsync(secret: string, ticket: string): Promise<Record<string, string> | null> {
  const [body, sig] = ticket.split('.');
  if (!body || !sig) return null;
  const expected = await hmac(secret, `ticket:${body}`);
  if (expected !== sig) return null;
  let payload: Record<string, string>;
  try {
    payload = JSON.parse(atob(body.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
  if (payload.exp && Number(payload.exp) < Date.now()) return null;
  return payload;
}

export function cookieToken(req: Request): string | null {
  const header = req.headers.get('Cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === 'cf_session') return v.join('=');
  }
  return null;
}

export function bearerToken(req: Request): string | null {
  const auth = req.headers.get('Authorization');
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

export async function requireUser(req: Request, env: Env): Promise<{ user: UserRow } | { error: Response }> {
  const token = bearerToken(req) || cookieToken(req);
  if (!token) return { error: json({ error: 'Unauthorized' }, 401) };
  const tokenHash = await hashToken(token, env.SESSION_SECRET);
  const row = await env.DB.prepare(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?`
  ).bind(tokenHash, new Date().toISOString()).first<UserRow>();
  if (!row) return { error: json({ error: 'Invalid or expired session' }, 401) };
  return { user: row };
}

export function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      ...extraHeaders,
    },
  });
}

export function corsPreflight(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export function now(): string {
  return new Date().toISOString();
}
