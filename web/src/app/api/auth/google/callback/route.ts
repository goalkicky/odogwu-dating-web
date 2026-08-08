import { NextRequest, NextResponse } from 'next/server';

const origin = (r: NextRequest) => r.nextUrl.origin.replace('://www.', '://');

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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!clientId || !clientSecret) throw new Error('Google OAuth not configured');
    if (!apiUrl) throw new Error('NEXT_PUBLIC_API_URL not configured');

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

    // Upsert user + create session on the Cloudflare worker
    const authRes = await fetch(`${apiUrl}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, googleId, accessToken: tokens.access_token }),
    });
    if (!authRes.ok) throw new Error('Session failed: ' + await authRes.text());
    const data = await authRes.json();

    return new NextResponse(
      `<!DOCTYPE html><html><body><script>
try{localStorage.setItem('cf_token',${JSON.stringify(data.token)})}catch(e){}
window.location.href='${data.hasProfile ? '/discover' : '/onboarding/name'}'
</script></body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  } catch (err: any) {
    const failUrl = new URL('/oauth', origin(request));
    failUrl.searchParams.set('error', encodeURIComponent(err?.message?.substring(0, 500) || 'oauth_failed'));
    return NextResponse.redirect(failUrl);
  }
}
