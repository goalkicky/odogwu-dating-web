import { NextRequest, NextResponse } from 'next/server';

const origin = (r: NextRequest) => r.nextUrl.origin.replace('://www.', '://');

function makeid() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10) + 'A1!';
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

    // Look up existing user by email
    const listRes = await fetch(`${endpoint}/users?search=${encodeURIComponent(googleUser.email)}`, {
      headers: apiHeaders,
    });
    let userId: string | null = null;
    if (listRes.ok) {
      const listData = await listRes.json();
      const found = listData.users?.find((u: any) => u.email === googleUser.email);
      if (found) userId = found.$id;
    }

    // If not found, create the user
    if (!userId) {
      const createRes = await fetch(`${endpoint}/users`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({
          userId: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          password: makeid(),
        }),
      });
      if (!createRes.ok && createRes.status !== 409) {
        throw new Error('Appwrite user creation failed: ' + await createRes.text());
      }
      if (createRes.ok) {
        const created = await createRes.json();
        userId = created.$id;
      } else {
        // 409 — user with googleUser.id already exists but we didn't find by email
        userId = googleUser.id;
      }
    }

    if (!userId) throw new Error('Could not resolve Appwrite user');

    // Create a session for the user
    const sessionRes = await fetch(`${endpoint}/users/${userId}/sessions`, {
      method: 'POST',
      headers: apiHeaders,
      body: JSON.stringify({ duration: 31536000 }),
    });
    if (!sessionRes.ok) throw new Error('Appwrite session creation failed: ' + await sessionRes.text());

    const session = await sessionRes.json();
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
