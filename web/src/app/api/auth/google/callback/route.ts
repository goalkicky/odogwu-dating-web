import { NextRequest, NextResponse } from 'next/server';

const origin = (r: NextRequest) => r.nextUrl.origin.replace('://www.', '://');

function makeid() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10) + 'A1!';
}

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

function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms));
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

    const redirectUri = `${origin(request)}/api/auth/google/callback`;

    // Exchange Google code directly
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: clientId, client_secret: clientSecret,
        redirect_uri: redirectUri, grant_type: 'authorization_code',
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
    const pw = makeid();

    // Create user via Users API; 409 means already exists
    let userId = googleUser.id;
    try {
      const created = await retryOnRate(() => fetch(`${endpoint}/users`, {
        method: 'POST', headers: apiHeaders,
        body: JSON.stringify({ userId: googleUser.id, email: googleUser.email, name: googleUser.name, password: pw }),
      }).then(async r => { if (!r.ok) { const t = await r.text(); const e = new Error(t); (e as any).status = r.status; throw e; } return r.json(); }));
      userId = created.$id;
    } catch (e: any) {
      if ((e as any).status !== 409) throw e;
    }

    await delay(500);

    // Create session via Account email-password endpoint (returns short secret token)
    const sessionRes = await retryOnRate(() => fetch(`${endpoint}/account/sessions/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Appwrite-Project': projectId },
      body: JSON.stringify({ email: googleUser.email, password: pw, duration: 31536000 }),
    }));

    if (!sessionRes.ok) {
      const errBody = await sessionRes.text();
      throw new Error('Appwrite session creation failed: ' + errBody);
    }

    const session = await sessionRes.json();
    const oauthUrl = new URL('/oauth', origin(request));
    oauthUrl.searchParams.set('userId', session.userId);
    oauthUrl.searchParams.set('secret', session.secret);
    return NextResponse.redirect(oauthUrl);
  } catch (err: any) {
    const failUrl = new URL('/oauth', origin(request));
    failUrl.searchParams.set('error', err?.message?.substring(0, 500) || 'oauth_failed');
    return NextResponse.redirect(failUrl);
  }
}
