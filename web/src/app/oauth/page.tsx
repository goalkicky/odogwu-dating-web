'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite/config';
import { FlameIcon } from '@/components/Icons';

export default function OAuthCallback() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [debug, setDebug] = useState('');
  const retries = useRef(0);

  useEffect(() => {
    async function handleCallback() {
      try {
        if (!account) throw new Error('Appwrite not configured');

        setDebug(`URL: ${window.location.href.substring(0, 200)}`);

        const params = new URLSearchParams(window.location.hash.replace('#', '?'));
        const userId = params.get('userId');
        const secret = params.get('secret');
        const sessionId = params.get('sessionId');

        if (userId && secret) {
          await account.createSession(userId, secret);
          const user = await account.get();
          if (user) {
            router.replace('/onboarding/name');
            return;
          }
        }

        const user = await account.get();
        if (user) {
          router.replace('/onboarding/name');
          return;
        }

        if (retries.current < 10) {
          retries.current++;
          setTimeout(handleCallback, 500);
          return;
        }
        setError('No user session found.');
      } catch (err: any) {
        setDebug(prev => prev + ` | Error: ${err?.message || err}`);
        if (retries.current < 10) {
          retries.current++;
          setTimeout(handleCallback, 500);
          return;
        }
        setError(`Authentication failed. ${err?.message || 'Please try again.'}`);
      }
    }
    handleCallback();
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
      {error ? (
        <>
          <p style={{ color: '#FF4444', fontSize: 15, textAlign: 'center' }}>{error}</p>
          {debug && <pre style={{ color: '#6B6B6B', fontSize: 11, maxWidth: 400, textAlign: 'center', whiteSpace: 'pre-wrap' }}>{debug}</pre>}
          <button onClick={() => router.push('/login')} style={{ padding: '12px 32px', borderRadius: 9999, background: 'linear-gradient(135deg, #FF375F, #FF3B30)', color: 'white', border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
            Back to Login
          </button>
        </>
      ) : (
        <>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #FF375F, #FF3B30)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FlameIcon size={32} color="white" />
          </div>
          <p style={{ color: '#ABABAB', fontSize: 15 }}>Signing you in...</p>
        </>
      )}
    </div>
  );
}
