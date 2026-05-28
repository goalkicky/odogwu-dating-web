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
    const email = googleUser.email;
    const name = googleUser.name || email?.split('@')[0] || 'User';
    const userId = googleUser.id;
    let existingUser = false;

    // Create user via Users API; 409 = already exists
    try {
      await retryOnRate(() => fetch(`${endpoint}/users`, {
        method: 'POST', headers: apiHeaders,
        body: JSON.stringify({ userId, email, name }),
      }).then(async r => { if (!r.ok) { const e: any = new Error(await r.text()); e.status = r.status; throw e; } }));
    } catch (e: any) {
      if (e.status === 409) existingUser = true;
      else throw e;
    }

    // Create session via Users API (works for any user, no password needed)
    const sessionRes = await retryOnRate(() => fetch(`${endpoint}/users/${userId}/sessions`, {
      method: 'POST', headers: apiHeaders,
      body: JSON.stringify({ duration: 31536000 }),
    }));
    if (!sessionRes.ok) throw new Error('Appwrite session failed: ' + await sessionRes.text());

    const xFallback = sessionRes.headers.get('X-Fallback-Cookies') || '{}';

    // Check profile for existing user
    let hasProfile = false;
    if (existingUser) {
      try {
        const q = encodeURIComponent(`equal("userId",["${userId}"])`);
        const pdir = await fetch(
          `${endpoint}/databases/odogwu-dating/collections/profiles/documents?queries=${q}`,
          { headers: { 'X-Appwrite-Project': projectId, 'X-Appwrite-Key': apiKey } },
        );
        if (pdir.ok && (await pdir.json()).total > 0) hasProfile = true;
      } catch {}
    }

    return new NextResponse(
      `<!DOCTYPE html><html><body><script>
try{localStorage.setItem('cookieFallback',${JSON.stringify(xFallback)})}catch(e){}
window.location.href='${existingUser && hasProfile ? '/discover' : '/onboarding/name'}'
</script></body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  } catch (err: any) {
    const failUrl = new URL('/oauth', origin(request));
    failUrl.searchParams.set('error', encodeURIComponent(err?.message?.substring(0, 500) || 'oauth_failed'));
    return NextResponse.redirect(failUrl);
  }
}
