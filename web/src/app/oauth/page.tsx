'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/cloudflare/services';
import { useAuth } from '@/store/AuthContext';

export default function OAuthCallback() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    async function run() {
      const qParams = new URLSearchParams(window.location.search);
      const hParams = new URLSearchParams(window.location.hash.replace('#', '?'));
      const errorParam = qParams.get('error') || hParams.get('error');
      if (errorParam) {
        setError(errorParam === 'access_denied' ? 'Sign-in cancelled. Please try again.' : errorParam);
        return;
      }

      try {
        const user = await authService.getCurrentUser();
        if (user) {
          const onboarded = await refreshUser();
          router.replace(onboarded ? '/discover' : '/onboarding/name');
          return;
        }
      } catch {}

      await authService.loginWithGoogle();
    }
    run();
  }, [router, refreshUser]);

  if (error) {
    return (
      <div style={{ minHeight: '100svh', background: '#0D0D0D', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <p style={{ color: '#FF4444', fontSize: 15, textAlign: 'center' }}>{error}</p>
        <button onClick={() => router.push('/login')} style={{ padding: '12px 32px', borderRadius: 9999, background: 'linear-gradient(135deg, #FF2E5F, #FF4530)', color: 'white', border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100svh', background: '#0D0D0D', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      <p style={{ color: '#ABABAB', fontSize: 15 }}>Signing you in...</p>
    </div>
  );
}
