import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  const userId = url.searchParams.get('userId');
  const secret = url.searchParams.get('secret');

  const redirectUrl = new URL('/oauth', url.origin);

  if (userId && secret) {
    redirectUrl.searchParams.set('userId', userId);
    redirectUrl.searchParams.set('secret', secret);
  } else {
    redirectUrl.searchParams.set('noSession', 'true');
  }

  return NextResponse.redirect(redirectUrl);
}
