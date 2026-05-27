'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite/config';
import { authService, userService } from '@/lib/appwrite/services';
import { useAuth } from '@/store/AuthContext';

export default function OAuthCallback() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [error, setError] = useState('');
  const retries = useRef(0);

  useEffect(() => {
    async function routeAfterAuth() {
      const user = await authService.getCurrentUser();
      await refreshUser();
      let hasProfile = false;
      try {
        await userService.getProfile(user.$id);
        hasProfile = true;
      } catch {}
      router.replace(hasProfile ? '/discover' : '/onboarding/name');
    }

    async function handleCallback() {
      const qParams = new URLSearchParams(window.location.search);
      const hParams = new URLSearchParams(window.location.hash.replace('#', '?'));
      const errorParam = qParams.get('error') || hParams.get('error');
      if (errorParam) { setError(errorParam === 'access_denied' ? 'Sign-in cancelled. Please try again.' : errorParam); return; }

      const userId = qParams.get('userId') || hParams.get('userId');
      const secret = qParams.get('secret') || hParams.get('secret');
      const jwt = qParams.get('jwt');

      // No session params — initiate Google OAuth
      if (!userId && !secret && !jwt) {
        const { authService } = await import('@/lib/appwrite/services');
        await authService.loginWithGoogle();
        return;
      }

      try {
        if (jwt && account?.client) {
          account.client.setJWT(jwt);
          await routeAfterAuth();
          return;
        }

        if (userId && secret) {
          await authService.createSession(userId, secret);
          await routeAfterAuth();
          return;
        }

        const user = await authService.getCurrentUser();
        if (user) {
          await routeAfterAuth();
          return;
        }

        setError('No user session found.');
      } catch (err: any) {
        setError(`Authentication failed. ${err?.message || 'Please try again.'}`);
      }
    }
    handleCallback();
  }, [router, refreshUser]);

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0D0D', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <p style={{ color: '#FF4444', fontSize: 15, textAlign: 'center' }}>{error}</p>
        <button onClick={() => router.push('/login')} style={{ padding: '12px 32px', borderRadius: 9999, background: 'linear-gradient(135deg, #FF375F, #FF3B30)', color: 'white', border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      <p style={{ color: '#ABABAB', fontSize: 15 }}>Signing you in...</p>
    </div>
  );
}
