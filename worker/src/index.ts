import { Env, UserRow, MatchRow, MessageRow } from './types';
import {
  newId, randomToken, hashToken, hashPassword, verifyPassword,
  requireUser, json, corsPreflight, now,
} from './auth';
import { ChatRoom, CallSignals } from './rooms';

export { ChatRoom, CallSignals };

const SESSION_DAYS = 365;

// ===== Serializers (Appwrite-compatible document shape) =====

function isOnboarded(user: UserRow | null): boolean {
  return !!user && !!user.gender && !!user.age;
}

function toProfile(r: any): any {
  let photos: string[] = [];
  try { photos = JSON.parse(r.photos || '[]'); } catch {}
  let interests: string[] = [];
  try { interests = JSON.parse(r.interests || '[]'); } catch {}
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
    isPremium: !!r.is_premium,
    verified: !!r.verified,
    age: r.age,
    premiumPlan: r.premium_plan,
    lastActive: r.last_active,
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
    cols.push(col);
    vals.push(value);
  }
  return { cols, vals };
}

async function getUserRow(env: Env, userId: string): Promise<UserRow | null> {
  return (await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first()) as UserRow | null;
}

async function requireMatchMembership(env: Env, matchId: string, userId: string): Promise<MatchRow | null> {
  return (await env.DB.prepare(
    `SELECT * FROM matches WHERE id = ? AND (user_id = ? OR matched_user_id = ?)`
  ).bind(matchId, userId, userId).first()) as MatchRow | null;
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

async function handleGetProfile(env: Env, req: Request, userId: string): Promise<Response> {
  void req;
  const user = await getUserRow(env, userId);
  if (!user) return json({ error: 'Profile not found' }, 404);
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

async function handleDiscover(env: Env, req: Request, me: string): Promise<Response> {
  const url = new URL(req.url);
  const gender = url.searchParams.get('gender') || 'both';
  const minAge = Number(url.searchParams.get('minAge')) || 18;
  const maxAge = Number(url.searchParams.get('maxAge')) || 99;

  let sql = `SELECT * FROM users WHERE id != ? AND age BETWEEN ? AND ?
             AND id NOT IN (SELECT matched_user_id FROM matches WHERE user_id = ?)`;
  const binds: any[] = [me, minAge, maxAge, me];
  if (gender !== 'both') {
    sql += ' AND gender = ?';
    binds.push(gender);
  }
  sql += ' ORDER BY updated_at DESC';
  const { results } = await env.DB.prepare(sql).bind(...binds).all();
  return json({ documents: results.map(toProfile) });
}

// ===== Likes / matches =====

async function handleLikes(env: Env, req: Request, me: string): Promise<Response> {
  const url = new URL(req.url);

  if (url.searchParams.has('whoLikedMe')) {
    const { results } = await env.DB.prepare(
      `SELECT m.* FROM matches m WHERE m.matched_user_id = ?
       AND NOT EXISTS (SELECT 1 FROM matches r WHERE r.user_id = ? AND r.matched_user_id = m.user_id)
       ORDER BY m.matched_at DESC`
    ).bind(me, me).all();
    const docs = await Promise.all(results.map(async (d: any) => {
      const p = await getUserRow(env, d.user_id);
      return { ...toMatchDoc(d), matchedUser: p ? toProfile(p) : null };
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
  return json({ documents: results.map(toMatchDoc) });
}

async function handleCreateLike(env: Env, req: Request, me: string): Promise<Response> {
  const body = await req.json() as any;
  const matchedUserId = String(body.matchedUserId || '');
  if (!matchedUserId || matchedUserId === me) return json({ error: 'Invalid user' }, 400);
  const id = newId();
  const ts = now();
  await env.DB.prepare(
    'INSERT OR IGNORE INTO matches (id, user_id, matched_user_id, matched_at) VALUES (?, ?, ?, ?)'
  ).bind(id, me, matchedUserId, ts).run();
  const doc = toMatchDoc({ id, user_id: me, matched_user_id: matchedUserId, matched_at: ts });
  const mutual = !!(await env.DB.prepare(
    'SELECT 1 FROM matches WHERE user_id = ? AND matched_user_id = ?'
  ).bind(matchedUserId, me).first());
  return json({ ...doc, mutual });
}

async function handleGetMatches(env: Env, req: Request, me: string): Promise<Response> {
  void req;
  const { results } = await env.DB.prepare(
    `SELECT m.* FROM matches m
     WHERE m.user_id = ?
       AND EXISTS (SELECT 1 FROM matches r WHERE r.user_id = m.matched_user_id AND r.matched_user_id = m.user_id)
     ORDER BY m.matched_at DESC`
  ).bind(me).all();
  const docs = await Promise.all(results.map(async (d: any) => {
    const p = await getUserRow(env, d.matched_user_id);
    return { ...toMatchDoc(d), matchedUser: p ? toProfile(p) : null };
  }));
  return json({ documents: docs });
}

async function handleGetMatch(env: Env, req: Request, matchId: string): Promise<Response> {
  void req;
  const doc = await env.DB.prepare('SELECT * FROM matches WHERE id = ?').bind(matchId).first();
  if (!doc) return json({ error: 'Match not found' }, 404);
  return json(toMatchDoc(doc));
}

async function handleCreateMatch(env: Env, req: Request, me: string): Promise<Response> {
  const body = await req.json() as any;
  const userId = String(body.userId || me);
  const matchedUserId = String(body.matchedUserId || '');
  const id = newId();
  const ts = now();
  await env.DB.prepare(
    'INSERT OR IGNORE INTO matches (id, user_id, matched_user_id, matched_at) VALUES (?, ?, ?, ?)'
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

  const id = newId();
  const ts = now();
  await env.DB.prepare(
    `INSERT INTO messages (id, match_id, sender_id, text, type, media_url, reply_to, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id, matchId, senderId,
    String(body.text || ''),
    String(body.type || 'text'),
    String(body.mediaUrl || ''),
    body.replyTo ? JSON.stringify(body.replyTo) : '',
    ts,
  ).run();

  const row = await env.DB.prepare('SELECT * FROM messages WHERE id = ?').bind(id).first() as MessageRow;
  const doc = toMessageDoc(row);
  await relayToRoom(env, matchId, { type: 'message', message: doc });
  return json(doc, 201);
}

async function handleGetMessages(env: Env, req: Request, me: string): Promise<Response> {
  const url = new URL(req.url);
  const matchId = url.searchParams.get('matchId') || '';
  const membership = await requireMatchMembership(env, matchId, me);
  if (!membership) return json({ error: 'Not a match participant' }, 403);
  const { results } = await env.DB.prepare(
    'SELECT * FROM messages WHERE match_id = ? ORDER BY created_at ASC LIMIT 2000'
  ).bind(matchId).all();
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
  void req;
  const { results } = await env.DB.prepare(
    'SELECT * FROM call_logs WHERE from_user = ? OR to_user = ? ORDER BY created_at DESC LIMIT 200'
  ).bind(me, me).all();
  return json({ documents: results.map(toCallLogDoc) });
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
  const room = env.ChatRoom.get(env.ChatRoom.idFromName(matchId));
  return room.fetch('http://chatroom/ws?uid=' + encodeURIComponent(auth.user.id));
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
  return relay.fetch('http://calls/ws?uid=' + encodeURIComponent(auth.user.id));
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
    if (profileMatch && req.method === 'GET') return handleGetProfile(env, req, decodeURIComponent(profileMatch[1]));

    // Discover
    if (path === '/api/discover' && req.method === 'GET') return handleDiscover(env, req, me);

    // Likes
    if (path === '/api/likes' && req.method === 'GET') return handleLikes(env, req, me);
    if (path === '/api/likes' && req.method === 'POST') return handleCreateLike(env, req, me);

    // Matches
    if (path === '/api/matches' && req.method === 'GET') return handleGetMatches(env, req, me);
    if (path === '/api/matches' && req.method === 'POST') return handleCreateMatch(env, req, me);
    const matchMatch = path.match(/^\/api\/matches\/([^/]+)$/);
    if (matchMatch && req.method === 'GET') return handleGetMatch(env, req, decodeURIComponent(matchMatch[1]));

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

    return json({ error: 'Not found' }, 404);
  },
};
