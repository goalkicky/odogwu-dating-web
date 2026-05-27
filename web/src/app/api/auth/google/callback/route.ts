import { NextRequest, NextResponse } from 'next/server';

const origin = (r: NextRequest) => r.nextUrl.origin.replace('://www.', '://');

function makeid() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10) + 'A1!';
}

async function retryOnRate<T>(fn: () => Promise<T>, max = 3): Promise<T> {
  for (let i = 0; i < max; i++) {
    try { return await fn(); } catch (e: any) {
      if (e?.message?.includes?.('Rate limit') && i < max - 1) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
        continue;
      }
      throw e;
    }
  }
  return fn();
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');

  if (error || !code) {
    const failUrl = new URL('/oauth', origin(request));
    failUrl.searchParams.set('error', error || 'access_denied');
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

    const apiHeaders = {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': projectId,
      'X-Appwrite-Key': apiKey,
    };

    const api = (path: string, opts?: any) => retryOnRate(() =>
      fetch(`${endpoint}${path}`, opts || { headers: apiHeaders }).then(async r => {
        if (!r.ok) { const t = await r.text(); const e = new Error(t); (e as any).status = r.status; throw e; }
        return r.json();
      })
    );

    // Try to create user. If already exists (409), the Google ID works directly.
    let userId = googleUser.id;
    try {
      const created = await api('/users', {
        method: 'POST', headers: apiHeaders,
        body: JSON.stringify({ userId: googleUser.id, email: googleUser.email, name: googleUser.name, password: makeid() }),
      });
      userId = created.$id;
    } catch (e: any) {
      if ((e as any).status !== 409) throw e;
    }

    // Create session. If the user ID doesn't exist (unlikely with Google ID), try fetching by email.
    let session: any;
    try {
      session = await api(`/users/${userId}/sessions`, {
        method: 'POST', headers: apiHeaders,
        body: JSON.stringify({ duration: 31536000 }),
      });
    } catch (e: any) {
      if (!(e as any).message?.includes?.('user_not_found')) throw e;
      // Fallback: list users by email and find the matching one
      const list = await api(`/users?search=${encodeURIComponent(googleUser.email)}`);
      const found = list.users?.find((u: any) => u.email === googleUser.email);
      if (!found) throw new Error('No Appwrite user found for this Google account');
      session = await api(`/users/${found.$id}/sessions`, {
        method: 'POST', headers: apiHeaders,
        body: JSON.stringify({ duration: 31536000 }),
      });
    }

    const oauthUrl = new URL('/oauth', origin(request));
    oauthUrl.searchParams.set('userId', session.userId || userId);
    oauthUrl.searchParams.set('secret', session.secret);
    return NextResponse.redirect(oauthUrl);
  } catch (err: any) {
    const failUrl = new URL('/oauth', origin(request));
    failUrl.searchParams.set('error', err?.message?.substring(0, 500) || 'oauth_failed');
    return NextResponse.redirect(failUrl);
  }
}
