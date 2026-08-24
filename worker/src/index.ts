import { Env, UserRow, MatchRow, MessageRow } from './types';
import {
  newId, randomToken, hashToken, hashPassword, verifyPassword, newTicket, verifyTicketAsync,
  requireUser, json, corsPreflight, now,
} from './auth';
import { ChatRoom, CallSignals } from './rooms';

export { ChatRoom, CallSignals };

const SESSION_DAYS = 365;

// 1 coin = N100. Coin packs map qty -> naira price.
const COIN_PACKS: Record<number, number> = { 10: 1000, 25: 2500, 50: 5000, 100: 10000, 200: 20000 };
const PLAN_COINS: Record<string, number> = { premium: 49, surplus: 79, platinum: 109 };
const PLAN_NAMES: Record<string, string> = { premium: 'Odogwu Premium', surplus: 'Odogwu Surplus', platinum: 'Odogwu Platinum' };
const SUPERLIKE_DAILY: Record<string, number> = { premium: 2, surplus: 5, platinum: 7 };
const LIKES_DAILY = 10;
const PREMIUM_DAYS = 30;
const COIN_RATE_NAIRA = 100;
const WAT_OFFSET_MS = 60 * 60 * 1000;

// ===== Serializers (Appwrite-compatible document shape) =====

function isOnboarded(user: UserRow | null): boolean {
  return !!user && !!user.gender && !!user.age;
}

function toProfile(r: any): any {
  let photos: string[] = [];
  try { photos = JSON.parse(r.photos || '[]'); } catch {}
  let interests: string[] = [];
  try { interests = JSON.parse(r.interests || '[]'); } catch {}
  const premiumActive = !!r.is_premium && (!r.premium_expires_at || new Date(r.premium_expires_at).getTime() > Date.now());
  return {
    $id: r.id,
    id: r.id,
    email: r.email,
    fullName: r.full_name,
    dateOfBirth: r.date_of_birth,
    gender: r.gender,
    interestedIn: r.interested_in,
    bio: r.bio,
    photos,
    interests,
    latitude: r.latitude,
    longitude: r.longitude,
    city: r.city,
    isPremium: premiumActive,
    verified: !!r.verified,
    age: r.age,
    premiumPlan: r.premium_plan,
    premiumExpiresAt: r.premium_expires_at || '',
    coins: r.coins ?? 0,
    superlikesRemaining: r.superlikes_remaining ?? 0,
    superlikesDailyLimit: superlikeAllowance(r),
    lastActive: r.last_active,
    showOnlineStatus: !!r.show_online_status,
    profileVisibility: r.profile_visibility || 'everyone',
    dataAnalytics: !!r.data_analytics,
    height: r.height || '',
    weight: r.weight || '',
    relationshipGoals: r.relationship_goals || '',
    createdAt: r.created_at,
  };
}

function toMatchDoc(r: any): any {
  return { $id: r.id, id: r.id, userId: r.user_id, matchedUserId: r.matched_user_id, matchedAt: r.matched_at };
}

function toMessageDoc(r: MessageRow | any): any {
  let replyTo: any = undefined;
  if (r.reply_to) {
    try { replyTo = JSON.parse(r.reply_to); } catch {}
  }
  let reactions: string[] = [];
  try { reactions = JSON.parse(r.reactions || '[]'); } catch {}
  return {
    $id: r.id,
    id: r.id,
    matchId: r.match_id,
    senderId: r.sender_id,
    text: r.text,
    type: r.type,
    mediaUrl: r.media_url,
    replyTo,
    editedAt: r.edited_at || undefined,
    createdAt: r.created_at,
    readAt: r.read_at || undefined,
    reactions,
  };
}

function toSignalDoc(r: any): any {
  return {
    $id: r.id,
    id: r.id,
    from: r.from_user,
    to: r.to_user,
    matchId: r.match_id,
    type: r.type,
    callType: r.call_type,
    data: r.data,
    createdAt: r.created_at,
  };
}

function toCallLogDoc(r: any): any {
  return {
    $id: r.id,
    id: r.id,
    from: r.from_user,
    to: r.to_user,
    matchId: r.match_id,
    callType: r.call_type,
    status: r.status,
    duration: r.duration,
    createdAt: r.created_at,
  };
}

// ===== Session helpers =====

async function createSession(env: Env, userId: string): Promise<string> {
  const token = randomToken();
  const tokenHash = await hashToken(token, env.SESSION_SECRET);
  const createdAt = now();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000).toISOString();
  await env.DB.prepare(
    'INSERT OR REPLACE INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'
  ).bind(tokenHash, userId, createdAt, expiresAt).run();
  return token;
}

function sessionResponse(env: Env, token: string, body: unknown, status = 200): Response {
  return json(body, status, {
    'Set-Cookie': `cf_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`,
  });
}

// ===== Profile upsert / update mapping =====

const PROFILE_FIELDS: Record<string, string> = {
  fullName: 'full_name',
  dateOfBirth: 'date_of_birth',
  gender: 'gender',
  interestedIn: 'interested_in',
  bio: 'bio',
  photos: 'photos',
  interests: 'interests',
  city: 'city',
  latitude: 'latitude',
  longitude: 'longitude',
  isPremium: 'is_premium',
  verified: 'verified',
  age: 'age',
  premiumPlan: 'premium_plan',
  lastActive: 'last_active',
  showOnlineStatus: 'show_online_status',
  profileVisibility: 'profile_visibility',
  dataAnalytics: 'data_analytics',
  height: 'height',
  weight: 'weight',
  relationshipGoals: 'relationship_goals',
};

function mapProfileValues(data: Record<string, any>): { cols: string[]; vals: any[] } {
  const cols: string[] = [];
  const vals: any[] = [];
  for (const [k, v] of Object.entries(data)) {
    const col = PROFILE_FIELDS[k];
    if (!col) continue;
    let value = v;
    if (col === 'photos' || col === 'interests') value = JSON.stringify(v || []);
    if (col === 'is_premium' || col === 'verified') value = v ? 1 : 0;
    if (col === 'show_online_status' || col === 'data_analytics') value = v ? 1 : 0;
    cols.push(col);
    vals.push(value);
  }
  return { cols, vals };
}

async function getUserRow(env: Env, userId: string): Promise<UserRow | null> {
  return (await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first()) as UserRow | null;
}

// ===== Super Likes wallet =====

// Today's date in Nigeria time (WAT = UTC+1), e.g. "2026-08-13".
function superlikeDate(): string {
  return new Date(Date.now() + WAT_OFFSET_MS).toISOString().slice(0, 10);
}

// ISO instant when the current WAT day ends (super likes refill).
function superlikeRefillsAt(): string {
  const next = new Date(Date.now() + WAT_OFFSET_MS + 86400000);
  next.setUTCHours(0, 0, 0, 0);
  return new Date(next.getTime() - WAT_OFFSET_MS).toISOString();
}

function premiumActive(user: UserRow | null): boolean {
  return !!user?.is_premium && (!user.premium_expires_at || new Date(user.premium_expires_at).getTime() > Date.now());
}

function superlikeAllowance(user: UserRow | null): number {
  if (!premiumActive(user)) return 0;
  return SUPERLIKE_DAILY[user!.premium_plan] ?? 2;
}

// Ensures the stored remaining count matches today's allowance (resets once per day).
async function ensureSuperlikes(env: Env, user: UserRow | null): Promise<UserRow | null> {
  if (!user) return user;
  const allowance = superlikeAllowance(user);
  const date = superlikeDate();
  if (user.superlikes_date !== date || (user.superlikes_remaining ?? 0) > allowance || user.superlikes_remaining === undefined) {
    await env.DB.prepare(
      'UPDATE users SET superlikes_remaining = ?, superlikes_date = ?, updated_at = ? WHERE id = ?'
    ).bind(allowance, date, now(), user.id).run();
    return { ...user, superlikes_remaining: allowance, superlikes_date: date };
  }
  return user;
}

function superlikeStatusDoc(user: UserRow): any {
  const dailyLimit = superlikeAllowance(user);
  const remaining = Math.max(0, user.superlikes_remaining ?? 0);
  return {
    remaining,
    used: Math.max(0, dailyLimit - remaining),
    dailyLimit,
    refillsAt: superlikeRefillsAt(),
    isPremium: !!user.is_premium,
  };
}

// ===== Likes wallet =====

// Ensures the stored like count matches today's allowance. -1 = unlimited (premium).
async function ensureLikes(env: Env, user: UserRow | null): Promise<UserRow | null> {
  if (!user) return user;
  const date = superlikeDate();
  const unlimited = premiumActive(user);
  const want = unlimited ? -1 : LIKES_DAILY;
  const cur = user.likes_remaining ?? 0;
  const stale =
    user.likes_date !== date ||
    (unlimited ? cur !== -1 : cur < 0 || cur > LIKES_DAILY);
  if (stale) {
    await env.DB.prepare(
      'UPDATE users SET likes_remaining = ?, likes_date = ?, updated_at = ? WHERE id = ?'
    ).bind(want, date, now(), user.id).run();
    return { ...user, likes_remaining: want, likes_date: date };
  }
  return user;
}

function likeStatusDoc(user: UserRow): any {
  const unlimited = premiumActive(user);
  const remaining = unlimited ? -1 : Math.max(0, user.likes_remaining ?? 0);
  return {
    remaining,
    used: unlimited ? 0 : Math.max(0, LIKES_DAILY - remaining),
    dailyLimit: unlimited ? -1 : LIKES_DAILY,
    refillsAt: unlimited ? '' : superlikeRefillsAt(),
    isPremium: !!user.is_premium,
  };
}

async function handleGetLikesStatus(env: Env, _req: Request, me: string): Promise<Response> {
  const user = await ensureLikes(env, await getUserRow(env, me));
  return json(likeStatusDoc(user!));
}

async function requireMatchMembership(env: Env, matchId: string, userId: string): Promise<MatchRow | null> {
  return (await env.DB.prepare(
    `SELECT * FROM matches WHERE id = ? AND (user_id = ? OR matched_user_id = ?)`
  ).bind(matchId, userId, userId).first()) as MatchRow | null;
}

// One conversation key per user pair, regardless of which direction created the match row.
function pairKey(a: string, b: string): string {
  return [a, b].sort().join('|');
}

async function isBlockedEitherWay(env: Env, a: string, b: string): Promise<boolean> {
  const row = await env.DB.prepare(
    'SELECT 1 FROM blocks WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)'
  ).bind(a, b, b, a).first();
  return !!row;
}

async function blockedIds(env: Env, userId: string): Promise<string[]> {
  const { results } = await env.DB.prepare('SELECT blocked_id FROM blocks WHERE blocker_id = ?').bind(userId).all();
  return results.map((r: any) => String(r.blocked_id));
}

async function blockerIds(env: Env, userId: string): Promise<string[]> {
  const { results } = await env.DB.prepare('SELECT blocker_id FROM blocks WHERE blocked_id = ?').bind(userId).all();
  return results.map((r: any) => String(r.blocker_id));
}

function publicize(p: any): any {
  if (!p) return p;
  const copy = { ...p };
  if (copy.showOnlineStatus === false || copy.showOnlineStatus === undefined) copy.lastActive = '';
  delete copy.superlikesRemaining;
  delete copy.superlikesDailyLimit;
  return copy;
}

async function relayToRoom(env: Env, matchId: string, payload: unknown): Promise<void> {
  const room = env.ChatRoom.get(env.ChatRoom.idFromName(matchId));
  await room.fetch('http://chatroom/broadcast', { method: 'POST', body: JSON.stringify(payload) }).catch(() => {});
}

async function relaySignal(env: Env, userId: string, signal: unknown): Promise<void> {
  const relay = env.CallSignals.get(env.CallSignals.idFromName('global'));
  await relay.fetch('http://calls/broadcast', { method: 'POST', body: JSON.stringify({ userId, signal }) }).catch(() => {});
}

// ===== Google verification (server-side) =====

async function verifyGoogleUser(accessToken: string): Promise<any> {
  const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Google verification failed');
  return res.json();
}

// ===== Auth handlers =====

async function handleRegister(env: Env, req: Request): Promise<Response> {
  const body = await req.json() as any;
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const fullName = String(body.fullName || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Invalid email' }, 400);
  if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) return json({ error: 'An account with this email already exists' }, 409);

  const userId = newId();
  const { salt, hash } = await (async () => {
    const [s, h] = (await hashPassword(password)).split(':');
    return { salt: s, hash: h };
  })();
  const ts = now();
  await env.DB.prepare(
    `INSERT INTO users (id, email, full_name, password_salt, password_hash, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(userId, email, fullName, salt, hash, ts, ts).run();

  const token = await createSession(env, userId);
  const user = await getUserRow(env, userId);
  return sessionResponse(env, token, { token, user: { $id: userId, email, name: fullName }, profile: toProfile(user), hasProfile: false });
}

async function handleLogin(env: Env, req: Request): Promise<Response> {
  const body = await req.json() as any;
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first() as UserRow | null;
  if (!user || !user.password_hash) return json({ error: 'Invalid email or password' }, 401);
  const ok = await verifyPassword(password, `${user.password_salt}:${user.password_hash}`);
  if (!ok) return json({ error: 'Invalid email or password' }, 401);

  const token = await createSession(env, user.id);
  return sessionResponse(env, token, {
    token,
    user: { $id: user.id, email: user.email, name: user.full_name },
    profile: toProfile(user),
    hasProfile: isOnboarded(user),
  });
}

async function handleForgotPassword(env: Env, req: Request): Promise<Response> {
  const body = await req.json() as any;
  const email = String(body.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Invalid email' }, 400);
  const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (!user) return json({ message: 'If an account with that email exists, a reset code has been generated.' });
  const ticket = await newTicket(env.SESSION_SECRET, { userId: user.id as string, purpose: 'reset-password', exp: String(Date.now() + 30 * 60 * 1000) });
  const shortCode = ticket.split('.')[0].slice(0, 8).toUpperCase();
  return json({ message: 'Reset code generated', ticket, shortCode });
}

async function handleResetPassword(env: Env, req: Request): Promise<Response> {
  const body = await req.json() as any;
  const ticket = String(body.ticket || '');
  const newPassword = String(body.password || '');
  if (!ticket || !newPassword) return json({ error: 'Ticket and password are required' }, 400);
  if (newPassword.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);
  const payload = await verifyTicketAsync(env.SESSION_SECRET, ticket);
  if (!payload || payload.purpose !== 'reset-password') return json({ error: 'Invalid or expired reset ticket' }, 400);
  const { salt, hash } = await (async () => {
    const [s, h] = (await hashPassword(newPassword)).split(':');
    return { salt: s, hash: h };
  })();
  await env.DB.prepare('UPDATE users SET password_salt = ?, password_hash = ? WHERE id = ?').bind(salt, hash, payload.userId).run();
  return json({ message: 'Password updated successfully' });
}

async function handleLogout(env: Env, req: Request): Promise<Response> {
  const auth = await requireUser(req, env);
  if ('error' in auth) return auth.error;
  const token = auth.user && (
    req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ||
    (req.headers.get('Cookie')?.split(';').find(c => c.trim().startsWith('cf_session='))?.split('=')[1] || '')
  );
  if (token) {
    const tokenHash = await hashToken(token, env.SESSION_SECRET);
    await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run();
  }
  return json({ ok: true }, 200, { 'Set-Cookie': 'cf_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0' });
}

async function upsertGoogleUser(env: Env, googleId: string, email: string, name: string): Promise<UserRow> {
  let user = await env.DB.prepare('SELECT * FROM users WHERE google_sub = ?').bind(googleId).first() as UserRow | null;
  if (!user) {
    user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first() as UserRow | null;
    if (user) {
      await env.DB.prepare('UPDATE users SET google_sub = ?, updated_at = ? WHERE id = ?').bind(googleId, now(), user.id).run();
    }
  }

  if (!user) {
    const userId = newId();
    const ts = now();
    await env.DB.prepare(
      `INSERT INTO users (id, email, full_name, google_sub, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(userId, email, name, googleId, ts, ts).run();
    user = await getUserRow(env, userId);
  }

  return user!;
}

function googleSessionBody(user: UserRow, fallbackName: string): any {
  return {
    user: { $id: user.id, email: user.email, name: user.full_name || fallbackName },
    profile: toProfile(user),
    hasProfile: isOnboarded(user),
  };
}

async function handleGoogle(env: Env, req: Request): Promise<Response> {
  const body = await req.json() as any;
  const googleId = String(body.googleId || '');
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim() || email.split('@')[0] || 'User';

  const googleUser = await verifyGoogleUser(String(body.accessToken || ''));
  if (!googleUser || String(googleUser.id || '') !== googleId || String(googleUser.email || '').toLowerCase() !== email) {
    return json({ error: 'Google verification failed' }, 401);
  }

  const user = await upsertGoogleUser(env, googleId, email, name);
  const token = await createSession(env, user.id);
  return sessionResponse(env, token, { token, ...googleSessionBody(user, name) });
}

// ===== Google OAuth for native apps (web flow, redirects to app deep link) =====

async function handleGoogleStart(env: Env, req: Request): Promise<Response> {
  const clientId = env.GOOGLE_CLIENT_ID;
  if (!clientId) return json({ error: 'Google OAuth not configured' }, 500);
  const url = new URL(req.url);
  const redirectTo = url.searchParams.get('redirectTo') || 'odogwu-dating://oauth';

  const state = newId();
  const ts = now();
  await env.DB.prepare('INSERT OR REPLACE INTO oauth_flows (state, redirect_to, created_at) VALUES (?, ?, ?)')
    .bind(state, redirectTo, ts).run();

  const redirectUri = `${url.origin}/api/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  });
  return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`, 302);
}

async function handleGoogleCallback(env: Env, req: Request): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const errorParam = url.searchParams.get('error');

  const failRedirect = (reason: string) => {
    const target = new URL('odogwu-dating://oauth');
    target.searchParams.set('error', reason);
    return Response.redirect(target.toString(), 302);
  };

  if (errorParam || !code || !state) return failRedirect('access_denied');

  const flow = await env.DB.prepare('SELECT * FROM oauth_flows WHERE state = ?').bind(state).first() as any;
  if (!flow) return failRedirect('invalid_state');
  await env.DB.prepare('DELETE FROM oauth_flows WHERE state = ?').bind(state).run();

  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return failRedirect('not_configured');

  const redirectUri = `${url.origin}/api/auth/google/callback`;
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code, client_id: clientId, client_secret: clientSecret,
      redirect_uri: redirectUri, grant_type: 'authorization_code',
    }),
  });
  if (!tokenRes.ok) return failRedirect('token_failed');
  const tokens = await tokenRes.json() as any;

  const infoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!infoRes.ok) return failRedirect('userinfo_failed');
  const googleUser = await infoRes.json() as any;

  const email = String(googleUser.email || '').trim().toLowerCase();
  if (!email) return failRedirect('no_email');
  const name = String(googleUser.name || '').trim() || email.split('@')[0] || 'User';
  const googleId = String(googleUser.id || '');

  const user = await upsertGoogleUser(env, googleId, email, name);
  const token = await createSession(env, user.id);

  const target = new URL(flow.redirect_to || 'odogwu-dating://oauth');
  target.searchParams.set('token', token);
  target.searchParams.set('userId', user.id);
  return Response.redirect(target.toString(), 302);
}

async function handleMe(env: Env, req: Request): Promise<Response> {
  const auth = await requireUser(req, env);
  if ('error' in auth) return auth.error;
  const profile = toProfile(auth.user);
  return json({
    user: { $id: auth.user.id, email: auth.user.email, name: auth.user.full_name },
    profile,
  });
}

// ===== Profile handlers =====

async function handleGetProfile(env: Env, req: Request, userId: string, me?: string): Promise<Response> {
  void req;
  const user = await getUserRow(env, userId);
  if (!user) return json({ error: 'Profile not found' }, 404);
  if (!me || userId !== me) {
    if (me && await isBlockedEitherWay(env, me, userId)) return json({ error: 'Profile not found' }, 404);
    if ((user.profile_visibility || 'everyone') === 'matches_only') {
      const [a, b] = await Promise.all([
        env.DB.prepare('SELECT 1 FROM matches WHERE user_id = ? AND matched_user_id = ?').bind(userId, me).first(),
        env.DB.prepare('SELECT 1 FROM matches WHERE user_id = ? AND matched_user_id = ?').bind(me, userId).first(),
      ]);
      if (!a || !b) return json({ error: 'Profile not found' }, 404);
    }
    return json(publicize(toProfile(user)));
  }
  return json(toProfile(user));
}

async function handleCreateProfile(env: Env, req: Request): Promise<Response> {
  const auth = await requireUser(req, env);
  if ('error' in auth) return auth.error;
  const body = await req.json() as any;
  const { cols, vals } = mapProfileValues(body);
  if (cols.length === 0) return json({ error: 'No profile fields provided' }, 400);

  const setSql = cols.map(c => `${c} = ?`).join(', ');
  const ts = now();
  await env.DB.prepare(
    `INSERT INTO users (id, email, ${cols.join(', ')}, created_at, updated_at)
     VALUES (?, ?, ${cols.map(() => '?').join(', ')}, ?, ?)
     ON CONFLICT(id) DO UPDATE SET ${setSql}, updated_at = ?`
  ).bind(auth.user.id, auth.user.email, ...vals, ts, ts, ...vals, ts).run();

  const user = await getUserRow(env, auth.user.id);
  return json(toProfile(user));
}

async function handleUpdateProfile(env: Env, req: Request, userId?: string): Promise<Response> {
  const auth = await requireUser(req, env);
  if ('error' in auth) return auth.error;
  const targetId = userId || auth.user.id;
  if (targetId !== auth.user.id) return json({ error: 'Forbidden' }, 403);
  const body = await req.json() as any;
  const { cols, vals } = mapProfileValues(body);
  if (cols.length === 0) return json({ error: 'No profile fields provided' }, 400);

  const setSql = cols.map(c => `${c} = ?`).join(', ');
  await env.DB.prepare(`UPDATE users SET ${setSql}, updated_at = ? WHERE id = ?`)
    .bind(...vals, now(), targetId).run();
  const user = await getUserRow(env, targetId);
  return json(toProfile(user));
}

// ===== Discover =====

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function handleDiscover(env: Env, req: Request, me: string): Promise<Response> {
  const url = new URL(req.url);
  const gender = url.searchParams.get('gender') || 'both';
  const minAge = Number(url.searchParams.get('minAge')) || 18;
  const maxAge = Number(url.searchParams.get('maxAge')) || 99;
  const maxDistance = Number(url.searchParams.get('maxDistance')) || 0;
  const minHeight = Number(url.searchParams.get('minHeight')) || 0;
  const maxHeight = Number(url.searchParams.get('maxHeight')) || 0;
  const minWeight = Number(url.searchParams.get('minWeight')) || 0;
  const maxWeight = Number(url.searchParams.get('maxWeight')) || 0;
  const city = (url.searchParams.get('city') || '').trim().toLowerCase();
  const relationshipGoals = (url.searchParams.get('relationshipGoals') || '').trim().toLowerCase();

  let sql = `SELECT * FROM users WHERE id != ? AND age BETWEEN ? AND ?
             AND id NOT IN (SELECT matched_user_id FROM matches WHERE user_id = ?)
             AND profile_visibility != 'matches_only'
             AND id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = ?)
             AND id NOT IN (SELECT blocker_id FROM blocks WHERE blocked_id = ?)`;
  const binds: any[] = [me, minAge, maxAge, me, me, me];
  if (gender !== 'both') {
    sql += ' AND gender = ?';
    binds.push(gender);
  }
  sql += ' ORDER BY updated_at DESC';
  const { results } = await env.DB.prepare(sql).bind(...binds).all();

  const meRow = await getUserRow(env, me);
  const myLat = Number(meRow?.latitude);
  const myLng = Number(meRow?.longitude);
  const hasMeCoords = myLat && myLng;

  let docs = results.map(toProfile).map(publicize).map(d => {
    if (!hasMeCoords || !d.latitude || !d.longitude) return d;
    return { ...d, distanceKm: Math.round(haversineKm(myLat, myLng, d.latitude, d.longitude)) };
  });
  if (maxDistance > 0 && hasMeCoords) {
    docs = docs
      .filter(d => typeof d.distanceKm === 'number' && d.distanceKm <= maxDistance)
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }

  function heightToInches(h: string): number | null {
    if (!h) return null;
    const m = h.match(/^(\d+)'(\d+)"?$/);
    if (!m) return null;
    return Number(m[1]) * 12 + Number(m[2]);
  }

  if (minHeight > 0 || maxHeight > 0) {
    docs = docs.filter(d => {
      const inches = heightToInches(d.height);
      if (inches === null) return false;
      if (minHeight > 0 && inches < minHeight) return false;
      if (maxHeight > 0 && inches > maxHeight) return false;
      return true;
    });
  }

  if (minWeight > 0 || maxWeight > 0) {
    docs = docs.filter(d => {
      const w = Number(d.weight);
      if (!w) return false;
      if (minWeight > 0 && w < minWeight) return false;
      if (maxWeight > 0 && w > maxWeight) return false;
      return true;
    });
  }

  if (city) {
    docs = docs.filter(d => (d.city || '').toLowerCase().includes(city));
  }

  if (relationshipGoals) {
    docs = docs.filter(d => (d.relationshipGoals || '').toLowerCase() === relationshipGoals);
  }

  return json({ documents: docs });
}

// ===== Likes / matches =====

async function handleLikes(env: Env, req: Request, me: string): Promise<Response> {
  const url = new URL(req.url);

  if (url.searchParams.has('whoLikedMe')) {
    const { results } = await env.DB.prepare(
      `SELECT m.* FROM matches m WHERE m.matched_user_id = ?
       AND NOT EXISTS (SELECT 1 FROM matches r WHERE r.user_id = ? AND r.matched_user_id = m.user_id)
       AND NOT EXISTS (SELECT 1 FROM blocks b WHERE b.blocker_id = ? AND b.blocked_id = m.user_id)
       AND NOT EXISTS (SELECT 1 FROM blocks b WHERE b.blocker_id = m.user_id AND b.blocked_id = ?)
       ORDER BY m.matched_at DESC`
    ).bind(me, me, me, me).all();
    const docs = await Promise.all(results.map(async (d: any) => {
      const p = await getUserRow(env, d.user_id);
      return { ...toMatchDoc(d), matchedUser: p ? publicize(toProfile(p)) : null };
    }));
    return json({ documents: docs });
  }

  const other = url.searchParams.get('other');
  if (other) {
    const [a, b] = await Promise.all([
      env.DB.prepare('SELECT 1 FROM matches WHERE user_id = ? AND matched_user_id = ?').bind(me, other).first(),
      env.DB.prepare('SELECT 1 FROM matches WHERE user_id = ? AND matched_user_id = ?').bind(other, me).first(),
    ]);
    return json({ likedByA: !!a, likedByB: !!b });
  }

  const { results } = await env.DB.prepare(
    'SELECT * FROM matches WHERE user_id = ? ORDER BY matched_at DESC'
  ).bind(me).all();
  const docs: any[] = [];
  for (const d of results) {
    const r = d as any;
    if (await isBlockedEitherWay(env, me, r.matched_user_id)) continue;
    docs.push(toMatchDoc(r));
  }
  return json({ documents: docs });
}

async function handleCreateLike(env: Env, req: Request, me: string): Promise<Response> {
  const body = await req.json() as any;
  const matchedUserId = String(body.matchedUserId || '');
  if (!matchedUserId || matchedUserId === me) return json({ error: 'Invalid user' }, 400);
  if (await isBlockedEitherWay(env, me, matchedUserId)) return json({ error: 'Cannot like a blocked user' }, 403);

  const user = await ensureLikes(env, await getUserRow(env, me));
  const status = likeStatusDoc(user!);

  // Idempotent — if already liked, don't spend a like.
  const alreadyLiked = !!(await env.DB.prepare(
    'SELECT 1 FROM matches WHERE user_id = ? AND matched_user_id = ?'
  ).bind(me, matchedUserId).first());
  const mutual = !!(await env.DB.prepare(
    'SELECT 1 FROM matches WHERE user_id = ? AND matched_user_id = ?'
  ).bind(matchedUserId, me).first());
  if (alreadyLiked) {
    return json({ ...status, mutual, match: toMatchDoc({ id: '', user_id: me, matched_user_id: matchedUserId, matched_at: '' }) });
  }

  // Free users get LIKES_DAILY per day; premium members get unlimited.
  if (!status.isPremium && status.remaining <= 0) {
    return json({ error: 'You have used up all your likes for today. Upgrade to premium for unlimited likes.', code: 'NO_LIKES' }, 402);
  }

  if (!status.isPremium) {
    const spent = await env.DB.prepare(
      'UPDATE users SET likes_remaining = likes_remaining - 1, updated_at = ? WHERE id = ? AND likes_remaining >= 1'
    ).bind(now(), me).run();
    if (spent.meta.changes === 0) {
      return json({ error: 'You have used up all your likes for today. Upgrade to premium for unlimited likes.', code: 'NO_LIKES' }, 402);
    }
  }

  const id = newId();
  const ts = now();
  await env.DB.prepare(
    'INSERT OR IGNORE INTO matches (id, user_id, matched_user_id, matched_at) VALUES (?, ?, ?, ?)'
  ).bind(id, me, matchedUserId, ts).run();
  const doc = toMatchDoc({ id, user_id: me, matched_user_id: matchedUserId, matched_at: ts });

  const updated = await getUserRow(env, me);
  return json({ ...likeStatusDoc(updated!), mutual, match: doc });
}

// ===== Super Likes =====

async function handleGetSuperlikes(env: Env, _req: Request, me: string): Promise<Response> {
  const user = await ensureSuperlikes(env, await getUserRow(env, me));
  return json(superlikeStatusDoc(user!));
}

async function handleSuperLike(env: Env, req: Request, me: string): Promise<Response> {
  const body = await req.json() as any;
  const matchedUserId = String(body.matchedUserId || '');
  if (!matchedUserId || matchedUserId === me) return json({ error: 'Invalid user' }, 400);
  if (await isBlockedEitherWay(env, me, matchedUserId)) return json({ error: 'Cannot super like a blocked user' }, 403);

  const user = await ensureSuperlikes(env, await getUserRow(env, me));
  const status = superlikeStatusDoc(user!);

  // Idempotent — if already liked, don't spend a super like.
  const alreadyLiked = !!(await env.DB.prepare(
    'SELECT 1 FROM matches WHERE user_id = ? AND matched_user_id = ?'
  ).bind(me, matchedUserId).first());
  const mutual = !!(await env.DB.prepare(
    'SELECT 1 FROM matches WHERE user_id = ? AND matched_user_id = ?'
  ).bind(matchedUserId, me).first());
  if (alreadyLiked) {
    return json({ ...status, mutual, match: toMatchDoc({ id: '', user_id: me, matched_user_id: matchedUserId, matched_at: '' }) });
  }

  if (status.remaining <= 0) {
    return json({ error: 'No super likes left for today. Upgrade to premium for more.', code: 'NO_SUPERLIKES' }, 402);
  }

  const spent = await env.DB.prepare(
    'UPDATE users SET superlikes_remaining = superlikes_remaining - 1, updated_at = ? WHERE id = ? AND superlikes_remaining >= 1'
  ).bind(now(), me).run();
  if (spent.meta.changes === 0) {
    return json({ error: 'No super likes left for today. Upgrade to premium for more.', code: 'NO_SUPERLIKES' }, 402);
  }

  const id = newId();
  const ts = now();
  await env.DB.prepare(
    'INSERT OR IGNORE INTO matches (id, user_id, matched_user_id, matched_at) VALUES (?, ?, ?, ?)'
  ).bind(id, me, matchedUserId, ts).run();
  const match = toMatchDoc({ id, user_id: me, matched_user_id: matchedUserId, matched_at: ts });

  const updated = await getUserRow(env, me);
  return json({ ...superlikeStatusDoc(updated!), mutual, match });
}

async function handleGetMatches(env: Env, req: Request, me: string): Promise<Response> {
  void req;
  const { results } = await env.DB.prepare(
    `SELECT m.* FROM matches m
     WHERE m.user_id = ?
       AND EXISTS (SELECT 1 FROM matches r WHERE r.user_id = m.matched_user_id AND r.matched_user_id = m.user_id)
       AND NOT EXISTS (SELECT 1 FROM blocks b WHERE (b.blocker_id = ? AND b.blocked_id = m.matched_user_id) OR (b.blocker_id = m.matched_user_id AND b.blocked_id = ?))
     ORDER BY m.matched_at DESC`
  ).bind(me, me, me).all();
  const docs = await Promise.all(results.map(async (d: any) => {
    const p = await getUserRow(env, d.matched_user_id);
    return { ...toMatchDoc(d), matchedUser: p ? publicize(toProfile(p)) : null };
  }));
  return json({ documents: docs });
}

async function handleGetMatch(env: Env, req: Request, matchId: string, me: string): Promise<Response> {
  void req;
  const doc = (await env.DB.prepare('SELECT * FROM matches WHERE id = ?').bind(matchId).first()) as any;
  if (!doc) return json({ error: 'Match not found' }, 404);
  if (doc.user_id !== me && doc.matched_user_id !== me) return json({ error: 'Forbidden' }, 403);
  const other = doc.user_id === me ? doc.matched_user_id : doc.user_id;
  if (await isBlockedEitherWay(env, me, other)) return json({ error: 'Forbidden' }, 403);
  return json(toMatchDoc(doc));
}

async function handleCreateMatch(env: Env, req: Request, me: string): Promise<Response> {
  const body = await req.json() as any;
  const userId = String(body.userId || me);
  const matchedUserId = String(body.matchedUserId || '');
  if (!matchedUserId) return json({ error: 'matchedUserId is required' }, 400);
  if (await isBlockedEitherWay(env, userId, matchedUserId)) return json({ error: 'Cannot match a blocked user' }, 403);

  const existing = await env.DB.prepare(
    'SELECT * FROM matches WHERE (user_id = ? AND matched_user_id = ?) OR (user_id = ? AND matched_user_id = ?) LIMIT 1'
  ).bind(userId, matchedUserId, matchedUserId, userId).first() as any;
  if (existing) return json(toMatchDoc(existing));

  const user = await getUserRow(env, userId);
  if (!premiumActive(user)) {
    return json({ error: 'Messaging before matching is a premium feature. Upgrade to send a message first.', code: 'PREMIUM_REQUIRED' }, 402);
  }

  const id = newId();
  const ts = now();
  await env.DB.prepare(
    'INSERT INTO matches (id, user_id, matched_user_id, matched_at) VALUES (?, ?, ?, ?)'
  ).bind(id, userId, matchedUserId, ts).run();
  return json(toMatchDoc({ id, user_id: userId, matched_user_id: matchedUserId, matched_at: ts }));
}

// ===== Messages =====

async function handleSendMessage(env: Env, req: Request, me: string): Promise<Response> {
  const body = await req.json() as any;
  const matchId = String(body.matchId || '');
  const senderId = String(body.senderId || '');
  if (senderId !== me) return json({ error: 'Forbidden' }, 403);
  const membership = await requireMatchMembership(env, matchId, me);
  if (!membership) return json({ error: 'Not a match participant' }, 403);
  const other = membership.user_id === me ? membership.matched_user_id : membership.user_id;
  if (await isBlockedEitherWay(env, me, other)) return json({ error: 'You blocked this user or were blocked' }, 403);
  const roomKey = pairKey(membership.user_id, membership.matched_user_id);

  const id = newId();
  const ts = now();
  await env.DB.prepare(
    `INSERT INTO messages (id, match_id, sender_id, text, type, media_url, reply_to, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, roomKey, senderId,
    String(body.text || ''),
    String(body.type || 'text'),
    String(body.mediaUrl || ''),
    body.replyTo ? JSON.stringify(body.replyTo) : '',
    ts,
  ).run();

  const row = await env.DB.prepare('SELECT * FROM messages WHERE id = ?').bind(id).first() as MessageRow;
  const doc = toMessageDoc(row);
  await relayToRoom(env, roomKey, { type: 'message', message: doc });
  return json(doc, 201);
}

async function handleGetMessages(env: Env, req: Request, me: string): Promise<Response> {
  const url = new URL(req.url);
  const matchId = url.searchParams.get('matchId') || '';
  const membership = await requireMatchMembership(env, matchId, me);
  if (!membership) return json({ error: 'Not a match participant' }, 403);
  const other = membership.user_id === me ? membership.matched_user_id : membership.user_id;
  if (await isBlockedEitherWay(env, me, other)) return json({ error: 'Forbidden' }, 403);
  const roomKey = pairKey(membership.user_id, membership.matched_user_id);
  const { results } = await env.DB.prepare(
    'SELECT * FROM messages WHERE match_id = ? ORDER BY created_at ASC LIMIT 2000'
  ).bind(roomKey).all();
  return json({ documents: results.map(toMessageDoc) });
}

async function handleEditMessage(env: Env, req: Request, me: string, messageId: string): Promise<Response> {
  const body = await req.json() as any;
  const row = await env.DB.prepare('SELECT * FROM messages WHERE id = ?').bind(messageId).first() as MessageRow | null;
  if (!row) return json({ error: 'Message not found' }, 404);
  if (row.sender_id !== me) return json({ error: 'Forbidden' }, 403);
  await env.DB.prepare('UPDATE messages SET text = ?, edited_at = ? WHERE id = ?')
    .bind(String(body.text || ''), now(), messageId).run();
  const updated = await env.DB.prepare('SELECT * FROM messages WHERE id = ?').bind(messageId).first() as MessageRow;
  const doc = toMessageDoc(updated);
  await relayToRoom(env, row.match_id, { type: 'message:updated', message: doc });
  return json(doc);
}

async function handleReactToMessage(env: Env, req: Request, me: string, messageId: string): Promise<Response> {
  const body = await req.json() as any;
  const row = await env.DB.prepare('SELECT * FROM messages WHERE id = ?').bind(messageId).first() as MessageRow | null;
  if (!row) return json({ error: 'Message not found' }, 404);
  const membership = await requireMatchMembership(env, row.match_id, me);
  if (!membership) return json({ error: 'Forbidden' }, 403);
  const other = membership.user_id === me ? membership.matched_user_id : membership.user_id;
  if (await isBlockedEitherWay(env, me, other)) return json({ error: 'Forbidden' }, 403);
  const reactions = Array.isArray(body.reactions) ? body.reactions : [];
  await env.DB.prepare('UPDATE messages SET reactions = ? WHERE id = ?')
    .bind(JSON.stringify(reactions), messageId).run();
  const updated = await env.DB.prepare('SELECT * FROM messages WHERE id = ?').bind(messageId).first() as MessageRow;
  const doc = toMessageDoc(updated);
  await relayToRoom(env, row.match_id, { type: 'message:updated', message: doc });
  return json(doc);
}

// ===== Call signals / logs =====

async function handleSendSignal(env: Env, req: Request, me: string): Promise<Response> {
  const body = await req.json() as any;
  const id = newId();
  const ts = now();
  await env.DB.prepare(
    `INSERT INTO call_signals (id, from_user, to_user, match_id, type, call_type, data, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    String(body.from || me),
    String(body.to || ''),
    String(body.matchId || ''),
    String(body.type || ''),
    String(body.callType || 'audio'),
    String(body.data || ''),
    ts,
  ).run();
  const doc = toSignalDoc({
    id, from_user: String(body.from || me), to_user: String(body.to || ''),
    match_id: String(body.matchId || ''), type: String(body.type || ''),
    call_type: String(body.callType || 'audio'), data: String(body.data || ''), created_at: ts,
  });
  await relaySignal(env, doc.to, doc);
  return json(doc, 201);
}

async function handleGetSignals(env: Env, req: Request): Promise<Response> {
  const url = new URL(req.url);
  const to = url.searchParams.get('to') || '';
  const { results } = await env.DB.prepare(
    'SELECT * FROM call_signals WHERE to_user = ? ORDER BY created_at DESC LIMIT 100'
  ).bind(to).all();
  return json({ documents: results.map(toSignalDoc) });
}

async function handleCreateCallLog(env: Env, req: Request, me: string): Promise<Response> {
  const body = await req.json() as any;
  const id = newId();
  const ts = now();
  await env.DB.prepare(
    `INSERT INTO call_logs (id, from_user, to_user, match_id, call_type, status, duration, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    String(body.from || me),
    String(body.to || ''),
    String(body.matchId || ''),
    String(body.callType || 'audio'),
    String(body.status || 'missed'),
    Number(body.duration) || 0,
    ts,
  ).run();
  return json(toCallLogDoc({
    id, from_user: String(body.from || me), to_user: String(body.to || ''),
    match_id: String(body.matchId || ''), call_type: String(body.callType || 'audio'),
    status: String(body.status || 'missed'), duration: Number(body.duration) || 0, created_at: ts,
  }), 201);
}

async function handleGetCallLogs(env: Env, req: Request, me: string): Promise<Response> {
  const url = new URL(req.url);
  const matchId = url.searchParams.get('matchId');
  if (matchId) {
    const { results } = await env.DB.prepare(
      'SELECT * FROM call_logs WHERE match_id = ? AND (from_user = ? OR to_user = ?) ORDER BY created_at ASC'
    ).bind(matchId, me, me).all();
    return json({ documents: results.map(toCallLogDoc) });
  }
  const { results } = await env.DB.prepare(
    'SELECT * FROM call_logs WHERE from_user = ? OR to_user = ? ORDER BY created_at DESC LIMIT 200'
  ).bind(me, me).all();
  return json({ documents: results.map(toCallLogDoc) });
}

async function handleCallTurn(env: Env): Promise<Response> {
  const keyId = env.TURN_KEY_ID;
  const keyToken = env.TURN_KEY_TOKEN;
  if (!keyId || !keyToken) return json({ error: 'TURN not configured' }, 501);
  try {
    const res = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${encodeURIComponent(keyId)}/credentials/generate-ice-servers`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${keyToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ttl: 3600 }),
    });
    if (!res.ok) return json({ error: 'TURN unavailable' }, 502);
    const data = await res.json() as any;
    const iceServers = (Array.isArray(data?.iceServers) ? data.iceServers : [])
      .map((s: any) => ({
        ...s,
        urls: Array.isArray(s.urls) ? s.urls.filter((u: string) => !/:53\b/.test(u)) : s.urls,
      }))
      .filter((s: any) => Array.isArray(s.urls) && s.urls.length > 0);
    return json({ iceServers });
  } catch (e) {
    console.error('[call-turn] error:', e);
    return json({ error: 'TURN unavailable' }, 502);
  }
}

// ===== Media (R2) =====

const MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif',
  mp3: 'audio/mpeg', m4a: 'audio/mp4', webm: 'audio/webm', ogg: 'audio/ogg', wav: 'audio/wav',
  mp4: 'video/mp4', mov: 'video/quicktime',
};

function extOf(name: string): string {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  return m ? m[1].toLowerCase() : 'bin';
}

async function handleUploadMedia(env: Env, req: Request, me: string): Promise<Response> {
  const contentType = req.headers.get('Content-Type') || '';
  let file: { bytes: ArrayBuffer; name: string } | null = null;

  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    const f = form.get('file') as File | null;
    if (f) file = { bytes: await f.arrayBuffer(), name: f.name };
  } else {
    const url = new URL(req.url);
    const name = url.searchParams.get('name') || 'file.jpg';
    file = { bytes: await req.arrayBuffer(), name };
  }

  if (!file || file.bytes.byteLength === 0) return json({ error: 'Empty upload' }, 400);

  const ext = extOf(file.name);
  const key = `m/${me}/${newId()}.${ext}`;
  await env.MEDIA.put(key, file.bytes, {
    httpMetadata: { contentType: MIME[ext] || 'application/octet-stream' },
  });
  return json({ $id: key, key });
}

async function serveMedia(env: Env, key: string): Promise<Response> {
  const obj = await env.MEDIA.get(key);
  if (!obj) return json({ error: 'Not found' }, 404);
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Access-Control-Allow-Origin', '*');
  return new Response(obj.body, { headers });
}

// ===== Coins / Wallet =====

async function logCoinTx(env: Env, userId: string, type: string, amount: number, balanceAfter: number, counterparty = '', meta: any = null): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO coin_transactions (id, user_id, type, amount, balance_after, counterparty, meta, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(newId(), userId, type, amount, balanceAfter, counterparty, meta ? JSON.stringify(meta) : '', now()).run();
}

async function getWalletDoc(env: Env, me: string): Promise<any> {
  const user = await getUserRow(env, me);
  const { results } = await env.DB.prepare(
    `SELECT * FROM coin_transactions WHERE user_id = ? ORDER BY created_at DESC, rowid DESC LIMIT 50`
  ).bind(me).all();
  return {
    coins: user ? (user.coins ?? 0) : 0,
    transactions: results.map((r: any) => {
      let meta: any = null;
      if (r.meta) { try { meta = JSON.parse(r.meta); } catch {} }
      return {
        id: r.id,
        type: r.type,
        amount: r.amount,
        balanceAfter: r.balance_after,
        counterparty: r.counterparty,
        meta,
        createdAt: r.created_at,
      };
    }),
  };
}

async function handleGetWallet(env: Env, _req: Request, me: string): Promise<Response> {
  return json(await getWalletDoc(env, me));
}

async function handlePurchaseInit(env: Env, req: Request, me: string): Promise<Response> {
  const body = await req.json() as any;
  const coinQty = Number(body.coinQty);
  const naira = COIN_PACKS[coinQty];
  if (!naira) return json({ error: 'Invalid coin pack' }, 400);
  if (!env.PAYSTACK_SECRET_KEY) return json({ error: 'Payments not configured' }, 500);
  const user = await getUserRow(env, me);
  if (!user) return json({ error: 'User not found' }, 404);

  const reference = `OGW-${newId().slice(0, 16)}`.toUpperCase();
  const amountKobo = naira * 100;
  const callbackUrl = env.PAYSTACK_CALLBACK_URL || 'https://odogwudating.com/wallet';

  await env.DB.prepare(
    `INSERT INTO paystack_payments (reference, user_id, coin_qty, amount_kobo, status, created_at) VALUES (?, ?, ?, ?, 'pending', ?)`
  ).bind(reference, me, coinQty, amountKobo, now()).run();

  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email, amount: amountKobo, currency: 'NGN', reference, callback_url: callbackUrl }),
  });
  const data: any = await res.json();
  if (!data.status || !data.data?.authorization_url) {
    return json({ error: data?.message || 'Failed to initialize payment' }, 502);
  }
  return json({ authorization_url: data.data.authorization_url, reference });
}

async function handlePurchaseVerify(env: Env, req: Request, me: string): Promise<Response> {
  const body = await req.json() as any;
  const reference = String(body.reference || '');
  if (!reference) return json({ error: 'Reference required' }, 400);
  if (!env.PAYSTACK_SECRET_KEY) return json({ error: 'Payments not configured' }, 500);
  const pay = await env.DB.prepare('SELECT * FROM paystack_payments WHERE reference = ?').bind(reference).first() as any;
  if (!pay || pay.user_id !== me) return json({ error: 'Payment not found' }, 404);

  if (pay.status === 'success') return json({ verified: true, wallet: await getWalletDoc(env, me) });

  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}` },
  });
  const data: any = await res.json();
  if (!data.status) return json({ error: data?.message || 'Verification failed' }, 502);
  if (data.data?.status !== 'success') {
    await env.DB.prepare(`UPDATE paystack_payments SET status = ? WHERE reference = ?`).bind(String(data.data?.status || 'failed'), reference).run();
    return json({ verified: false, error: 'Payment not successful' }, 402);
  }
  if (Number(data.data.amount) !== pay.amount_kobo) return json({ error: 'Payment amount mismatch' }, 400);

  const claimed = await env.DB.prepare(
    `UPDATE paystack_payments SET status = 'success', verified_at = ? WHERE reference = ? AND status = 'pending'`
  ).bind(now(), reference).run();
  if (claimed.meta.changes === 0) return json({ verified: true, wallet: await getWalletDoc(env, me) });

  await env.DB.prepare(`UPDATE users SET coins = coins + ?, updated_at = ? WHERE id = ?`).bind(pay.coin_qty, now(), me).run();
  const user = await getUserRow(env, me);
  await logCoinTx(env, me, 'purchase', pay.coin_qty, user!.coins ?? 0, '', { reference, pack: pay.coin_qty, amountKobo: pay.amount_kobo });
  return json({ verified: true, wallet: await getWalletDoc(env, me) });
}

async function handleGiftCoins(env: Env, req: Request, me: string): Promise<Response> {
  const body = await req.json() as any;
  const toUserId = String(body.toUserId || '');
  const coins = Math.floor(Number(body.coins));
  if (!toUserId || toUserId === me) return json({ error: 'Invalid recipient' }, 400);
  if (!Number.isFinite(coins) || coins < 1 || coins > 100000) return json({ error: 'Invalid coin amount' }, 400);

  const recipient = await getUserRow(env, toUserId);
  if (!recipient) return json({ error: 'Recipient not found' }, 404);
  if (await isBlockedEitherWay(env, me, toUserId)) return json({ error: 'Cannot gift a blocked user' }, 403);

  const match = await env.DB.prepare(
    `SELECT * FROM matches WHERE (user_id = ? AND matched_user_id = ?) OR (user_id = ? AND matched_user_id = ?) ORDER BY matched_at DESC LIMIT 1`
  ).bind(me, toUserId, toUserId, me).first() as MatchRow | null;
  if (!match) return json({ error: 'You can only gift your matches' }, 403);

  const deducted = await env.DB.prepare(`UPDATE users SET coins = coins - ?, updated_at = ? WHERE id = ? AND coins >= ?`)
    .bind(coins, now(), me, coins).run();
  if (deducted.meta.changes === 0) return json({ error: 'Insufficient coins' }, 402);

  await env.DB.prepare(`UPDATE users SET coins = coins + ?, updated_at = ? WHERE id = ?`).bind(coins, now(), toUserId).run();
  const meRow = await getUserRow(env, me);
  const toRow = await getUserRow(env, toUserId);
  await logCoinTx(env, me, 'gift_out', coins, meRow!.coins ?? 0, toUserId);
  await logCoinTx(env, toUserId, 'gift_in', coins, toRow!.coins ?? 0, me);

  try {
    const mid = newId();
    const ts = now();
    await env.DB.prepare(
      `INSERT INTO messages (id, match_id, sender_id, text, type, media_url, reply_to, created_at) VALUES (?, ?, ?, ?, 'gift', '', '', ?)`
    ).bind(mid, match.id, me, String(coins), ts).run();
    const row = await env.DB.prepare('SELECT * FROM messages WHERE id = ?').bind(mid).first();
    const doc = toMessageDoc(row);
    await relayToRoom(env, match.id, { type: 'message', message: doc });
  } catch {}

  return json({ coins: meRow!.coins ?? 0, giftedTo: toUserId, amount: coins });
}

async function handlePremiumWithCoins(env: Env, req: Request, me: string): Promise<Response> {
  const body = await req.json() as any;
  const planId = String(body.planId || '');
  const cost = PLAN_COINS[planId];
  if (!cost) return json({ error: 'Invalid plan' }, 400);

  const expires = new Date(Date.now() + PREMIUM_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const updated = await env.DB.prepare(
    `UPDATE users SET coins = coins - ?, is_premium = 1, premium_plan = ?, premium_expires_at = ?, updated_at = ? WHERE id = ? AND coins >= ?`
  ).bind(cost, planId, expires, now(), me, cost).run();
  if (updated.meta.changes === 0) return json({ error: 'Insufficient coins' }, 402);

  const user = await getUserRow(env, me);
  await logCoinTx(env, me, 'premium_paid', cost, user!.coins ?? 0, '', { plan: planId, planName: PLAN_NAMES[planId] || planId, expires });
  return json(toProfile(user));
}

// ===== Blocks / privacy =====

function toBlockDoc(r: any): any {
  return { $id: r.id, id: r.id, blockerId: r.blocker_id, blockedId: r.blocked_id, createdAt: r.created_at };
}

async function handleListBlocks(env: Env, req: Request, me: string): Promise<Response> {
  void req;
  const { results } = await env.DB.prepare(
    'SELECT * FROM blocks WHERE blocker_id = ? ORDER BY created_at DESC'
  ).bind(me).all();
  const docs = await Promise.all(results.map(async (d: any) => {
    const p = await getUserRow(env, d.blocked_id);
    return { ...toBlockDoc(d), blockedUser: p ? publicize(toProfile(p)) : null };
  }));
  return json({ documents: docs });
}

async function handleCreateBlock(env: Env, req: Request, me: string): Promise<Response> {
  const body = await req.json() as any;
  const blockedId = String(body.blockedId || '');
  if (!blockedId || blockedId === me) return json({ error: 'Invalid user' }, 400);
  const target = await getUserRow(env, blockedId);
  if (!target) return json({ error: 'User not found' }, 404);
  const id = newId();
  const ts = now();
  await env.DB.prepare(
    'INSERT OR IGNORE INTO blocks (id, blocker_id, blocked_id, created_at) VALUES (?, ?, ?, ?)'
  ).bind(id, me, blockedId, ts).run();
  return json({ blockedId }, 201);
}

async function handleUnblock(env: Env, req: Request, me: string, blockedId: string): Promise<Response> {
  void req;
  await env.DB.prepare('DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?')
    .bind(me, blockedId).run();
  return json({ ok: true });
}

// ===== Feed (Instagram-style timeline) =====

function toFeedPostDoc(r: any, likedByMe = false, savedByMe = false): any {
  let images: string[] = [];
  try { images = JSON.parse(r.images || '[]'); } catch {}
  return {
    id: r.id,
    userId: r.user_id,
    userName: r.full_name || '',
    userPhoto: r.user_photo || '',
    images,
    caption: r.caption || '',
    visibility: r.visibility || 'public',
    likesCount: r.likes_count ?? 0,
    commentsCount: r.comments_count ?? 0,
    likedByMe,
    savedByMe,
    createdAt: r.created_at,
    interest: r.interest || '',
  };
}

function toFeedCommentDoc(r: any): any {
  return {
    id: r.id,
    postId: r.post_id,
    userId: r.user_id,
    userName: r.full_name || '',
    userPhoto: r.user_photo || '',
    text: r.text || '',
    createdAt: r.created_at,
  };
}

// Resolves a list of posts with user info and the current user's like/save status.
async function resolveFeedPosts(env: Env, rows: any[], me: string): Promise<any[]> {
  if (rows.length === 0) return [];
  const postIds = rows.map((r: any) => r.id);

  // Batch-fetch user info for all post authors
  const userIds = [...new Set(rows.map((r: any) => r.user_id))];
  const placeholders = userIds.map(() => '?').join(',');
  const { results: userRows } = await env.DB.prepare(
    `SELECT id, full_name, photos FROM users WHERE id IN (${placeholders})`
  ).bind(...userIds).all();
  const userMap = new Map<string, any>();
  for (const u of userRows) {
    let photos: string[] = [];
    try { photos = JSON.parse((u as any).photos || '[]'); } catch {}
    userMap.set((u as any).id, { full_name: (u as any).full_name, photo: photos[0] || '' });
  }

  // Batch-fetch my likes for these posts
  const likePlaceholders = postIds.map(() => '?').join(',');
  const { results: myLikes } = await env.DB.prepare(
    `SELECT post_id FROM feed_post_likes WHERE post_id IN (${likePlaceholders}) AND user_id = ?`
  ).bind(...postIds, me).all();
  const likedSet = new Set(myLikes.map((r: any) => r.post_id));

  // Batch-fetch my saves for these posts
  const { results: mySaves } = await env.DB.prepare(
    `SELECT post_id FROM feed_post_saves WHERE post_id IN (${likePlaceholders}) AND user_id = ?`
  ).bind(...postIds, me).all();
  const savedSet = new Set(mySaves.map((r: any) => r.post_id));

  // Build blocked user list to filter
  const blockedByMe = new Set((await blockedIds(env, me)));
  const iBlocked = new Set((await blockerIds(env, me)));

  return rows
    .filter((r: any) => !blockedByMe.has(r.user_id) && !iBlocked.has(r.user_id))
    .map((r: any) => {
      const u = userMap.get(r.user_id) || { full_name: '', photo: '' };
      return toFeedPostDoc(
        { ...r, full_name: u.full_name, user_photo: u.photo },
        likedSet.has(r.id),
        savedSet.has(r.id),
      );
    });
}

// Shared: resolve a list of comment rows with user info
async function resolveFeedComments(env: Env, rows: any[]): Promise<any[]> {
  if (rows.length === 0) return [];
  const userIds = [...new Set(rows.map((r: any) => r.user_id))];
  const placeholders = userIds.map(() => '?').join(',');
  const { results: userRows } = await env.DB.prepare(
    `SELECT id, full_name, photos FROM users WHERE id IN (${placeholders})`
  ).bind(...userIds).all();
  const userMap = new Map<string, any>();
  for (const u of userRows) {
    let photos: string[] = [];
    try { photos = JSON.parse((u as any).photos || '[]'); } catch {}
    userMap.set((u as any).id, { full_name: (u as any).full_name, photo: photos[0] || '' });
  }
  return rows.map((r: any) => {
    const u = userMap.get(r.user_id) || { full_name: '', photo: '' };
    return toFeedCommentDoc({ ...r, full_name: u.full_name, user_photo: u.photo });
  });
}

async function handleGetFeedCounts(env: Env, req: Request, me: string): Promise<Response> {
  void me;
  const url = new URL(req.url);
  const interests = (url.searchParams.get('interests') || '').split(',').map(s => s.trim()).filter(Boolean);
  if (interests.length === 0) return json({ counts: {} });

  // D1 allows a maximum of 100 bound parameters per query
  const CHUNK_SIZE = 90;
  const statements = [];
  for (let i = 0; i < interests.length; i += CHUNK_SIZE) {
    const chunk = interests.slice(i, i + CHUNK_SIZE);
    const placeholders = chunk.map(() => '?').join(',');
    statements.push(
      env.DB.prepare(
        `SELECT interest, COUNT(*) as cnt FROM feed_posts WHERE interest IN (${placeholders}) GROUP BY interest`
      ).bind(...chunk)
    );
  }

  const batches = await env.DB.batch(statements);
  const counts: Record<string, number> = {};
  for (const batch of batches) {
    for (const r of batch.results as any[]) {
      counts[r.interest] = r.cnt;
    }
  }
  return json({ counts });
}

async function handleGetFeed(env: Env, req: Request, me: string): Promise<Response> {
  const url = new URL(req.url);
  const cursor = url.searchParams.get('cursor') || '';
  // Accepts a list of tags (a category plus the interests that belong to it).
  // A post is only ever visible in the feed(s) of the category it was published under.
  const rawTags = url.searchParams.get('interests') || url.searchParams.get('interest') || '';
  const tags = rawTags.split(',').map(s => s.trim()).filter(Boolean);
  const limit = 20;

  if (tags.length === 0) return json({ documents: [], cursor: '' });

  const sql = `SELECT p.*, u.full_name, u.photos
               FROM feed_posts p
               JOIN users u ON u.id = p.user_id
               WHERE p.interest IN (${tags.map(() => '?').join(',')})
                 AND p.user_id NOT IN (SELECT blocked_id FROM blocks WHERE blocker_id = ?)
                 AND p.user_id NOT IN (SELECT blocker_id FROM blocks WHERE blocked_id = ?)
               ${cursor ? 'AND p.created_at < (SELECT created_at FROM feed_posts WHERE id = ?)' : ''}
               ORDER BY p.created_at DESC LIMIT ?`;
  const binds: any[] = [...tags, me, me];
  if (cursor) binds.push(cursor);
  binds.push(limit + 1);

  const { results } = await env.DB.prepare(sql).bind(...binds).all();
  const hasMore = results.length > limit;
  const rows = hasMore ? results.slice(0, limit) : results;

  const mappedRows = rows.map((r: any) => {
    let photos: string[] = [];
    try { photos = JSON.parse(r.photos || '[]'); } catch {}
    return { ...r, user_photo: photos[0] || '' };
  });

  const posts = await resolveFeedPosts(env, mappedRows, me);
  return json({ documents: posts, cursor: hasMore ? rows[rows.length - 1]?.id || '' : '' });
}

async function handleCreatePost(env: Env, req: Request, me: string): Promise<Response> {
  const body = await req.json() as any;
  const images = Array.isArray(body.images) ? body.images.map(String) : [];
  const caption = String(body.caption || '').trim();
  const interest = String(body.interest || '').trim();

  if (images.length === 0) return json({ error: 'At least one image is required' }, 400);
  if (images.length > 10) return json({ error: 'Maximum 10 images allowed' }, 400);
  if (caption.length > 2200) return json({ error: 'Caption too long (max 2200 characters)' }, 400);
  if (!interest) return json({ error: 'Interest is required' }, 400);

  const id = newId();
  const ts = now();
  await env.DB.prepare(
    `INSERT INTO feed_posts (id, user_id, images, caption, visibility, interest, likes_count, comments_count, created_at) VALUES (?, ?, ?, ?, 'public', ?, 0, 0, ?)`
  ).bind(id, me, JSON.stringify(images), caption, interest, ts).run();

  // Fetch user info for the response
  const user = await getUserRow(env, me);
  let userPhoto = '';
  if (user) {
    try { userPhoto = (JSON.parse(user.photos || '[]') as string[])[0] || ''; } catch {}
  }

  return json(toFeedPostDoc({
    id, user_id: me, full_name: user?.full_name || '', user_photo: userPhoto,
    images: JSON.stringify(images), caption, visibility: 'public',
    likes_count: 0, comments_count: 0, created_at: ts,
  }), 201);
}

async function handleDeletePost(env: Env, req: Request, me: string, postId: string): Promise<Response> {
  void req;
  const post = await env.DB.prepare('SELECT * FROM feed_posts WHERE id = ?').bind(postId).first() as any;
  if (!post) return json({ error: 'Post not found' }, 404);
  if (post.user_id !== me) return json({ error: 'Forbidden' }, 403);

  await env.DB.prepare('DELETE FROM feed_posts WHERE id = ?').bind(postId).run();
  await env.DB.prepare('DELETE FROM feed_post_likes WHERE post_id = ?').bind(postId).run();
  await env.DB.prepare('DELETE FROM feed_post_saves WHERE post_id = ?').bind(postId).run();
  await env.DB.prepare('DELETE FROM feed_comments WHERE post_id = ?').bind(postId).run();
  return json({ ok: true });
}

async function handleLikePost(env: Env, req: Request, me: string, postId: string): Promise<Response> {
  void req;
  const post = await env.DB.prepare('SELECT * FROM feed_posts WHERE id = ?').bind(postId).first() as any;
  if (!post) return json({ error: 'Post not found' }, 404);
  if (post.user_id === me) return json({ error: 'Cannot like your own post' }, 400);

  const existing = await env.DB.prepare(
    'SELECT 1 FROM feed_post_likes WHERE post_id = ? AND user_id = ?'
  ).bind(postId, me).first();
  if (existing) return json({ ok: true, alreadyLiked: true });

  const ts = now();
  await env.DB.prepare(
    'INSERT INTO feed_post_likes (post_id, user_id, created_at) VALUES (?, ?, ?)'
  ).bind(postId, me, ts).run();
  await env.DB.prepare(
    'UPDATE feed_posts SET likes_count = likes_count + 1 WHERE id = ?'
  ).bind(postId).run();

  return json({ ok: true });
}

async function handleUnlikePost(env: Env, req: Request, me: string, postId: string): Promise<Response> {
  void req;
  const deleted = await env.DB.prepare(
    'DELETE FROM feed_post_likes WHERE post_id = ? AND user_id = ?'
  ).bind(postId, me).run();
  if (deleted.meta.changes > 0) {
    await env.DB.prepare(
      'UPDATE feed_posts SET likes_count = MAX(0, likes_count - 1) WHERE id = ?'
    ).bind(postId).run();
  }
  return json({ ok: true });
}

async function handleGetFeedComments(env: Env, req: Request, me: string): Promise<Response> {
  void me;
  const url = new URL(req.url);
  const postId = url.searchParams.get('postId') || '';
  const cursor = url.searchParams.get('cursor') || '';
  if (!postId) return json({ error: 'postId required' }, 400);

  let sql = `SELECT c.*, u.full_name, u.photos
             FROM feed_comments c
             JOIN users u ON u.id = c.user_id
             WHERE c.post_id = ?`;
  const binds: any[] = [postId];

  if (cursor) {
    sql += ` AND c.created_at > (SELECT created_at FROM feed_comments WHERE id = ?)`;
    binds.push(cursor);
  }

  sql += ` ORDER BY c.created_at ASC LIMIT 50`;
  const { results } = await env.DB.prepare(sql).bind(...binds).all();

  const mapped = results.map((r: any) => {
    let photos: string[] = [];
    try { photos = JSON.parse(r.photos || '[]'); } catch {}
    return { ...r, user_photo: photos[0] || '' };
  });

  const comments = await resolveFeedComments(env, mapped);
  return json({ documents: comments });
}

async function handleAddFeedComment(env: Env, req: Request, me: string): Promise<Response> {
  const body = await req.json() as any;
  const postId = String(body.postId || '');
  const text = String(body.text || '').trim();
  if (!postId) return json({ error: 'postId required' }, 400);
  if (!text) return json({ error: 'Comment text required' }, 400);
  if (text.length > 1000) return json({ error: 'Comment too long (max 1000 characters)' }, 400);

  const post = await env.DB.prepare('SELECT id FROM feed_posts WHERE id = ?').bind(postId).first();
  if (!post) return json({ error: 'Post not found' }, 404);

  const id = newId();
  const ts = now();
  await env.DB.prepare(
    `INSERT INTO feed_comments (id, post_id, user_id, text, created_at) VALUES (?, ?, ?, ?, ?)`
  ).bind(id, postId, me, text, ts).run();
  await env.DB.prepare(
    'UPDATE feed_posts SET comments_count = comments_count + 1 WHERE id = ?'
  ).bind(postId).run();

  const user = await getUserRow(env, me);
  let userPhoto = '';
  if (user) {
    try { userPhoto = (JSON.parse(user.photos || '[]') as string[])[0] || ''; } catch {}
  }

  return json(toFeedCommentDoc({
    id, post_id: postId, user_id: me, full_name: user?.full_name || '', user_photo: userPhoto, text, created_at: ts,
  }), 201);
}

async function handleDeleteFeedComment(env: Env, req: Request, me: string, commentId: string): Promise<Response> {
  void req;
  const comment = await env.DB.prepare('SELECT * FROM feed_comments WHERE id = ?').bind(commentId).first() as any;
  if (!comment) return json({ error: 'Comment not found' }, 404);
  if (comment.user_id !== me) return json({ error: 'Forbidden' }, 403);

  await env.DB.prepare('DELETE FROM feed_comments WHERE id = ?').bind(commentId).run();
  await env.DB.prepare(
    'UPDATE feed_posts SET comments_count = MAX(0, comments_count - 1) WHERE id = ?'
  ).bind(comment.post_id).run();
  return json({ ok: true });
}

async function handleSavePost(env: Env, req: Request, me: string, postId: string): Promise<Response> {
  void req;
  const post = await env.DB.prepare('SELECT id FROM feed_posts WHERE id = ?').bind(postId).first();
  if (!post) return json({ error: 'Post not found' }, 404);

  await env.DB.prepare(
    'INSERT OR IGNORE INTO feed_post_saves (post_id, user_id, created_at) VALUES (?, ?, ?)'
  ).bind(postId, me, now()).run();
  return json({ ok: true });
}

async function handleUnsavePost(env: Env, req: Request, me: string, postId: string): Promise<Response> {
  void req;
  await env.DB.prepare('DELETE FROM feed_post_saves WHERE post_id = ? AND user_id = ?')
    .bind(postId, me).run();
  return json({ ok: true });
}

// ===== WebSocket upgrade handlers =====
async function handleChatWS(req: Request, env: Env, url: URL): Promise<Response> {
  const token = url.searchParams.get('token');
  const authReq = token
    ? new Request('http://internal/ws', { headers: { Authorization: `Bearer ${token}` } })
    : req;
  const auth = await requireUser(authReq, env);
  if ('error' in auth) return auth.error;
  const matchId = url.searchParams.get('matchId') || '';
  const membership = await requireMatchMembership(env, matchId, auth.user.id);
  if (!membership) return json({ error: 'Not a match participant' }, 403);
  const other = membership.user_id === auth.user.id ? membership.matched_user_id : membership.user_id;
  if (await isBlockedEitherWay(env, auth.user.id, other)) return json({ error: 'Forbidden' }, 403);
  const roomKey = pairKey(membership.user_id, membership.matched_user_id);
  const room = env.ChatRoom.get(env.ChatRoom.idFromName(roomKey));
  const wsReq = new Request('http://chatroom/ws?uid=' + encodeURIComponent(auth.user.id), {
    headers: req.headers,
  });
  return room.fetch(wsReq);
}

async function handleCallWS(req: Request, env: Env, url: URL): Promise<Response> {
  const token = url.searchParams.get('token');
  const authReq = token
    ? new Request('http://internal/ws', { headers: { Authorization: `Bearer ${token}` } })
    : req;
  const auth = await requireUser(authReq, env);
  if ('error' in auth) return auth.error;
  const userId = url.searchParams.get('userId') || '';
  if (userId !== auth.user.id) return json({ error: 'Forbidden' }, 403);
  const relay = env.CallSignals.get(env.CallSignals.idFromName('global'));
  const wsReq = new Request('http://calls/ws?uid=' + encodeURIComponent(auth.user.id), {
    headers: req.headers,
  });
  return relay.fetch(wsReq);
}

// ===== Router =====

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;

    if (req.method === 'OPTIONS') return corsPreflight();

    // Public media
    if (path.startsWith('/media/')) return serveMedia(env, decodeURIComponent(path.slice('/media/'.length)));

    // WebSocket upgrades
    if (path === '/ws/chat') return handleChatWS(req, env, url);
    if (path === '/ws/call') return handleCallWS(req, env, url);

    // Auth (public)
    if (path === '/api/auth/register' && req.method === 'POST') return handleRegister(env, req);
    if (path === '/api/auth/login' && req.method === 'POST') return handleLogin(env, req);
    if (path === '/api/auth/forgot-password' && req.method === 'POST') return handleForgotPassword(env, req);
    if (path === '/api/auth/reset-password' && req.method === 'POST') return handleResetPassword(env, req);
    if (path === '/api/auth/logout' && req.method === 'POST') return handleLogout(env, req);
    if (path === '/api/auth/google' && req.method === 'POST') return handleGoogle(env, req);
    if (path === '/api/auth/google/start' && req.method === 'GET') return handleGoogleStart(env, req);
    if (path === '/api/auth/google/callback' && req.method === 'GET') return handleGoogleCallback(env, req);
    if (path === '/api/me' && req.method === 'GET') return handleMe(env, req);

    // Everything below requires a session
    const auth = await requireUser(req, env);
    if ('error' in auth) return auth.error;
    const me = auth.user.id;

    // Media upload
    if (path === '/api/media' && req.method === 'POST') return handleUploadMedia(env, req, me);

    // Profile
    if (path === '/api/profile' && req.method === 'POST') return handleCreateProfile(env, req);
    if (path === '/api/profile' && req.method === 'PUT') return handleUpdateProfile(env, req);
    const profileMatch = path.match(/^\/api\/profile\/([^/]+)$/);
    if (profileMatch && req.method === 'GET') return handleGetProfile(env, req, decodeURIComponent(profileMatch[1]), me);

    // Discover
    if (path === '/api/discover' && req.method === 'GET') return handleDiscover(env, req, me);

    // Likes
    if (path === '/api/likes/status' && req.method === 'GET') return handleGetLikesStatus(env, req, me);
    if (path === '/api/likes' && req.method === 'GET') return handleLikes(env, req, me);
    if (path === '/api/likes' && req.method === 'POST') return handleCreateLike(env, req, me);

    // Super Likes
    if (path === '/api/superlikes' && req.method === 'GET') return handleGetSuperlikes(env, req, me);
    if (path === '/api/superlikes' && req.method === 'POST') return handleSuperLike(env, req, me);

    // Matches
    if (path === '/api/matches' && req.method === 'GET') return handleGetMatches(env, req, me);
    if (path === '/api/matches' && req.method === 'POST') return handleCreateMatch(env, req, me);
    const matchMatch = path.match(/^\/api\/matches\/([^/]+)$/);
    if (matchMatch && req.method === 'GET') return handleGetMatch(env, req, decodeURIComponent(matchMatch[1]), me);

    // Messages
    if (path === '/api/messages' && req.method === 'POST') return handleSendMessage(env, req, me);
    if (path === '/api/messages' && req.method === 'GET') return handleGetMessages(env, req, me);
    const msgEdit = path.match(/^\/api\/messages\/([^/]+)\/reactions$/);
    if (msgEdit && req.method === 'POST') return handleReactToMessage(env, req, me, decodeURIComponent(msgEdit[1]));
    const msgMatch = path.match(/^\/api\/messages\/([^/]+)$/);
    if (msgMatch && req.method === 'PUT') return handleEditMessage(env, req, me, decodeURIComponent(msgMatch[1]));

    // Call signals / logs
    if (path === '/api/call-signals' && req.method === 'POST') return handleSendSignal(env, req, me);
    if (path === '/api/call-signals' && req.method === 'GET') return handleGetSignals(env, req);
    if (path === '/api/call-logs' && req.method === 'POST') return handleCreateCallLog(env, req, me);
    if (path === '/api/call-logs' && req.method === 'GET') return handleGetCallLogs(env, req, me);
    if (path === '/api/call-turn' && req.method === 'GET') return handleCallTurn(env);

    // Wallet / coins
    if (path === '/api/wallet' && req.method === 'GET') return handleGetWallet(env, req, me);
    if (path === '/api/wallet/purchase' && req.method === 'POST') return handlePurchaseInit(env, req, me);
    if (path === '/api/wallet/verify' && req.method === 'POST') return handlePurchaseVerify(env, req, me);
    if (path === '/api/wallet/gift' && req.method === 'POST') return handleGiftCoins(env, req, me);
    if (path === '/api/wallet/premium' && req.method === 'POST') return handlePremiumWithCoins(env, req, me);

    // Blocks / privacy
    if (path === '/api/blocks' && req.method === 'GET') return handleListBlocks(env, req, me);
    if (path === '/api/blocks' && req.method === 'POST') return handleCreateBlock(env, req, me);
    const blockMatch = path.match(/^\/api\/blocks\/([^/]+)$/);
    if (blockMatch && req.method === 'DELETE') return handleUnblock(env, req, me, decodeURIComponent(blockMatch[1]));

    // Feed (posts)
    if (path === '/api/feed/counts' && req.method === 'GET') return handleGetFeedCounts(env, req, me);
    if (path === '/api/feed' && req.method === 'GET') return handleGetFeed(env, req, me);
    if (path === '/api/feed' && req.method === 'POST') return handleCreatePost(env, req, me);
    const feedPostMatch = path.match(/^\/api\/feed\/([^/]+)$/);
    if (feedPostMatch && req.method === 'DELETE') return handleDeletePost(env, req, me, decodeURIComponent(feedPostMatch[1]));
    const feedLikeMatch = path.match(/^\/api\/feed\/([^/]+)\/like$/);
    if (feedLikeMatch && req.method === 'POST') return handleLikePost(env, req, me, decodeURIComponent(feedLikeMatch[1]));
    if (feedLikeMatch && req.method === 'DELETE') return handleUnlikePost(env, req, me, decodeURIComponent(feedLikeMatch[1]));
    const feedSaveMatch = path.match(/^\/api\/feed\/([^/]+)\/save$/);
    if (feedSaveMatch && req.method === 'POST') return handleSavePost(env, req, me, decodeURIComponent(feedSaveMatch[1]));
    if (feedSaveMatch && req.method === 'DELETE') return handleUnsavePost(env, req, me, decodeURIComponent(feedSaveMatch[1]));

    // Feed comments
    if (path === '/api/feed/comments' && req.method === 'GET') return handleGetFeedComments(env, req, me);
    if (path === '/api/feed/comments' && req.method === 'POST') return handleAddFeedComment(env, req, me);
    const feedCommentMatch = path.match(/^\/api\/feed\/comments\/([^/]+)$/);
    if (feedCommentMatch && req.method === 'DELETE') return handleDeleteFeedComment(env, req, me, decodeURIComponent(feedCommentMatch[1]));

    return json({ error: 'Not found' }, 404);
  },
};
