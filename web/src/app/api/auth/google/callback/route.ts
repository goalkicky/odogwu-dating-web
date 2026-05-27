import { NextRequest, NextResponse } from 'next/server';

const origin = (r: NextRequest) => r.nextUrl.origin.replace('://www.', '://');

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
    if (!endpoint || !projectId) throw new Error('Missing Appwrite config');

    const redirectUri = `${origin(request)}/api/auth/google/callback`;

    // Exchange the code with Google directly (server-to-server)
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new Error(`Google token exchange failed: ${errText}`);
    }

    const tokens = await tokenRes.json();

    // Create Appwrite session using the Google access token
    const sessionRes = await fetch(`${endpoint}/account/sessions/oauth2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': projectId,
      },
      body: JSON.stringify({
        provider: 'google',
        accessToken: tokens.access_token,
        duration: 31536000,
      }),
    });

    if (!sessionRes.ok) {
      const errBody = await sessionRes.text();
      throw new Error(errBody || 'Appwrite OAuth session creation failed');
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
