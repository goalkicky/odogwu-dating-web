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
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    if (!endpoint || !projectId) throw new Error('Missing Appwrite config');

    const redirectUri = `${origin(request)}/api/auth/google/callback`;

    const res = await fetch(`${endpoint}/account/sessions/oauth2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': projectId,
      },
      body: JSON.stringify({
        provider: 'google',
        code,
        redirectUrl: redirectUri,
        duration: 31536000,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(errBody || 'Appwrite OAuth session creation failed');
    }

    const session = await res.json();
    const oauthUrl = new URL('/oauth', origin(request));
    oauthUrl.searchParams.set('userId', session.userId);
    oauthUrl.searchParams.set('secret', session.secret);
    return NextResponse.redirect(oauthUrl);
  } catch (err: any) {
    const failUrl = new URL('/oauth', origin(request));
    failUrl.searchParams.set('error', err?.message?.substring(0, 200) || 'oauth_failed');
    return NextResponse.redirect(failUrl);
  }
}
