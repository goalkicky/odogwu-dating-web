import { NextRequest, NextResponse } from 'next/server';
import { Client, Account } from 'appwrite';

export async function GET(request: NextRequest) {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

  const url = request.nextUrl.clone();
  const searchParams = Object.fromEntries(url.searchParams.entries());

  const log: Record<string, any> = {
    fullUrl: request.url,
    searchParams,
  };

  try {
    const userId = url.searchParams.get('userId');
    const secret = url.searchParams.get('secret');

    if (userId && secret && endpoint && projectId) {
      const appwriteClient = new Client().setEndpoint(endpoint).setProject(projectId);
      const appwriteAccount = new Account(appwriteClient);

      await appwriteAccount.createSession(userId, secret);
      log.sessionCreated = true;

      const jwtResult = await appwriteAccount.createJWT();
      log.jwtCreated = true;

      const redirectUrl = new URL('/oauth', url.origin);
      redirectUrl.searchParams.set('jwt', jwtResult.jwt);
      return NextResponse.redirect(redirectUrl);
    }

    log.reason = 'missing userId/secret';
  } catch (err: any) {
    log.error = err?.message || String(err);
  }

  const redirectUrl = new URL('/oauth', url.origin);
  redirectUrl.searchParams.set('debug', JSON.stringify(log));
  return NextResponse.redirect(redirectUrl);
}
