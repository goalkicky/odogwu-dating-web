import { NextRequest, NextResponse } from 'next/server';

const origin = (r: NextRequest) => r.nextUrl.origin.replace('://www.', '://');

async function retryOnRate<T>(fn: () => Promise<T>, max = 5): Promise<T> {
  for (let i = 0; i < max; i++) {
    try { return await fn(); } catch (e: any) {
      const msg = typeof e?.message === 'string' ? e.message : '';
      if (msg.includes('Rate limit') && i < max - 1) {
        await new Promise(r => setTimeout(r, 1500 * Math.pow(2, i)));
        continue;
      }
      throw e;
    }
  }
  return fn();
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
    if (!tokenRes.ok) throw new Error('Google token exchange failed: ' + await tokenRes.text());
    const tokens = await tokenRes.json();

    // Get Google profile
    const infoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!infoRes.ok) throw new Error('Failed to get Google profile');
    const googleUser = await infoRes.json();

    const apiHeaders = { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey };
    const dbId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
    if (!dbId) throw new Error('NEXT_PUBLIC_APPWRITE_DATABASE_ID not set');
    const usersCol = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || 'users';

    const email = googleUser.email;
    const name = googleUser.name || email?.split('@')[0] || 'User';
    const googleId = googleUser.id;
    let userId = googleId;
    let existingUser = false;

    // Try to create user with Google ID; 409 = already exists
    try {
      await retryOnRate(() => fetch(`${endpoint}/users`, {
        method: 'POST', headers: apiHeaders,
        body: JSON.stringify({ userId: googleId, email, name }),
      }).then(async r => { if (!r.ok) { const e: any = new Error(await r.text()); e.status = r.status; throw e; } }));
    } catch (e: any) {
      if (e.status !== 409) throw e;
      existingUser = true;
      const searchRes = await retryOnRate(() => fetch(`${endpoint}/users?search=${encodeURIComponent(email)}`, {
        headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
      }).then(r => { if (!r.ok) throw new Error('Failed to search users: ' + r.status); return r.json(); }));
      const found = searchRes.users?.find((u: any) => u.email === email);
      if (!found) throw new Error('Existing user not found by email');
      userId = found.$id;
    }

    // Create profile doc in users collection if it doesn't exist
    try {
      await fetch(`${endpoint}/databases/${dbId}/collections/${usersCol}/documents/${userId}`, {
        headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
      }).then(async r => {
        if (r.status === 404) {
          // Create bare profile so getDocument('users', userId) doesn't 404
          await fetch(`${endpoint}/databases/${dbId}/collections/${usersCol}/documents`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey },
            body: JSON.stringify({
              documentId: userId,
              data: { userId, fullName: name, email, onboardingComplete: false },
              permissions: ['read("any")', `write("user:${userId}")`],
            }),
          }).catch(() => {});
        }
      });
    } catch {}

    // Create session via Users API
    const sessionRes = await retryOnRate(() => fetch(`${endpoint}/users/${userId}/sessions`, {
      method: 'POST', headers: apiHeaders,
      body: JSON.stringify({ duration: 31536000 }),
    }));
    if (!sessionRes.ok) throw new Error('Appwrite session failed: ' + await sessionRes.text());

    const xFallback = sessionRes.headers.get('X-Fallback-Cookies') || '{}';

    return new NextResponse(
      `<!DOCTYPE html><html><body><script>
try{localStorage.setItem('cookieFallback',${JSON.stringify(xFallback)})}catch(e){}
window.location.href='${existingUser ? '/discover' : '/onboarding/name'}'
</script></body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  } catch (err: any) {
    const failUrl = new URL('/oauth', origin(request));
    failUrl.searchParams.set('error', encodeURIComponent(err?.message?.substring(0, 500) || 'oauth_failed'));
    return NextResponse.redirect(failUrl);
  }
}
