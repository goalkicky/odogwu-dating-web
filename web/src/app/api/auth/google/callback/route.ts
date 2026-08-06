import { NextRequest, NextResponse } from 'next/server';

const origin = (r: NextRequest) => r.nextUrl.origin.replace('://www.', '://');

function makeid() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10) + 'A1!';
}

async function retryOnRate<T>(fn: () => Promise<T>, max = 5): Promise<T> {
  for (let i = 0; i < max; i++) {
    try { return await fn(); } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : '';
      if ((msg.includes('Rate limit') || msg.includes('408')) && i < max - 1) {
        await new Promise(r => setTimeout(r, 1500 * Math.pow(2, i)));
        continue;
      }
      throw e;
    }
  }
  return fn();
}

const projectHeaders = (projectId: string, apiKey: string) => ({
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
});

const jsonHeaders = (projectId: string, apiKey: string) => ({
  'Content-Type': 'application/json',
  'X-Appwrite-Project': projectId,
  'X-Appwrite-Key': apiKey,
});

async function setPassword(endpoint: string, projectId: string, apiKey: string, userId: string, password: string) {
  await retryOnRate(() => fetch(`${endpoint}/users/${userId}/password`, {
    method: 'PATCH',
    headers: jsonHeaders(projectId, apiKey),
    body: JSON.stringify({ password }),
  }).catch(() => {}));
}

async function profileExists(endpoint: string, projectId: string, apiKey: string, databaseId: string, usersCollectionId: string, userId: string) {
  const res = await retryOnRate(() => fetch(
    `${endpoint}/databases/${databaseId}/collections/${usersCollectionId}/documents/${userId}`,
    { headers: projectHeaders(projectId, apiKey) },
  ));
  return res.ok;
}

async function findUserByEmail(endpoint: string, projectId: string, apiKey: string, databaseId: string, usersCollectionId: string, email: string) {
  const headers = projectHeaders(projectId, apiKey);
  const needle = email.toLowerCase();

  // 1. App database profile lookup (fast when the email attribute is indexed)
  const query = `equal("email", "${email.replace(/"/g, '\\"')}")`;
  let dbStatus = 0;
  const dbRes = await retryOnRate(() => fetch(
    `${endpoint}/databases/${databaseId}/collections/${usersCollectionId}/documents?queries[0]=${encodeURIComponent(query)}&queries[1]=${encodeURIComponent('limit(1)')}`,
    { headers },
  ));
  dbStatus = dbRes.status;
  if (dbRes.ok) {
    const data = await dbRes.json();
    const doc = data.documents?.find((d: any) => d.email?.toLowerCase() === needle);
    if (doc) return { userId: doc.$id, hasProfile: true };
  }

  // 2. Paginated scan of auth users (plain list is indexed; avoids slow filtered queries)
  let usersStatus = 0;
  for (let offset = 0; offset < 5000; ) {
    const res = await retryOnRate(() => fetch(`${endpoint}/users?limit=100&offset=${offset}`, { headers }));
    usersStatus = res.status;
    if (!res.ok) break;
    const data = await res.json();
    const found = data.users?.find((u: any) => u.email?.toLowerCase() === needle);
    if (found) {
      const hasProfile = await profileExists(endpoint, projectId, apiKey, databaseId, usersCollectionId, found.$id);
      return { userId: found.$id, hasProfile };
    }
    if (!data.users?.length) break;
    offset += data.users.length;
  }

  throw new Error(`Failed to find user by email (db:${dbStatus || '-'}, users:${usersStatus || '-'})`);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const errorParam = request.nextUrl.searchParams.get('error');

  if (errorParam || !code) {
    const failUrl = new URL('/oauth', origin(request));
    failUrl.searchParams.set('error', errorParam || 'access_denied');
    return NextResponse.redirect(failUrl);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new Error('Google OAuth not configured');

    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const apiKey = process.env.APPWRITE_API_KEY;
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '69feb7fb0037747f6dac';
    const usersCollectionId = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || 'users';
    if (!endpoint || !projectId) throw new Error('Missing Appwrite config');
    if (!apiKey) throw new Error('APPWRITE_API_KEY not set');

    // Exchange Google code
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: clientId, client_secret: clientSecret,
        redirect_uri: `${origin(request)}/api/auth/google/callback`, grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) throw new Error('Google token failed: ' + await tokenRes.text());
    const tokens = await tokenRes.json();

    const infoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!infoRes.ok) throw new Error('Failed to get Google profile');
    const googleUser = await infoRes.json();

    const email = googleUser.email;
    const name = googleUser.name || email?.split('@')[0] || 'User';
    const googleId = googleUser.id;
    const pw = makeid();
    let userId = googleId;
    let hasProfile = false;

    // Try to create user with Google ID; 409 = already exists
    try {
      await retryOnRate(() => fetch(`${endpoint}/users`, {
        method: 'POST', headers: jsonHeaders(projectId, apiKey),
        body: JSON.stringify({ userId: googleId, email, name, password: pw }),
      }).then(async r => { if (!r.ok) { const e: any = new Error(await r.text()); e.status = r.status; throw e; } }));
    } catch (e: any) {
      if (e.status !== 409) throw e;
      // Try direct ID lookup first
      const idRes = await retryOnRate(() => fetch(`${endpoint}/users/${googleId}`, {
        headers: projectHeaders(projectId, apiKey),
      }));
      if (idRes.ok) {
        userId = (await idRes.json()).$id;
        hasProfile = await profileExists(endpoint, projectId, apiKey, databaseId, usersCollectionId, userId);
      } else {
        const found = await findUserByEmail(endpoint, projectId, apiKey, databaseId, usersCollectionId, email);
        userId = found.userId;
        hasProfile = found.hasProfile;
      }
      // Set password so we can create email-password session
      await setPassword(endpoint, projectId, apiKey, userId, pw);
    }

    // Create email-password session via Account API — returns X-Fallback-Cookies!
    const sessionRes = await retryOnRate(() => fetch(`${endpoint}/account/sessions/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId },
      body: JSON.stringify({ email, password: pw, duration: 31536000 }),
    }));
    if (!sessionRes.ok) throw new Error('Session failed: ' + await sessionRes.text());

    const xFallback = sessionRes.headers.get('X-Fallback-Cookies');
    if (!xFallback || xFallback === '{}') throw new Error('No session cookies returned from Appwrite');

    return new NextResponse(
      `<!DOCTYPE html><html><body><script>
try{localStorage.setItem('cookieFallback',${JSON.stringify(xFallback)})}catch(e){}
window.location.href='${hasProfile ? '/discover' : '/onboarding/name'}'
</script></body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  } catch (err: any) {
    const failUrl = new URL('/oauth', origin(request));
    failUrl.searchParams.set('error', encodeURIComponent(err?.message?.substring(0, 500) || 'oauth_failed'));
    return NextResponse.redirect(failUrl);
  }
}
