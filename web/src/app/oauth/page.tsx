'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite/config';
import { FlameIcon } from '@/components/Icons';

export default function OAuthCallback() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    async function handleCallback() {
      try {
        await new Promise(r => setTimeout(r, 1500));
        if (!account) throw new Error('Appwrite not configured');
        const user = await account.get();
        if (user) {
          router.replace('/onboarding/name');
        } else {
          setError('No user session found.');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Authentication failed. Please try again.');
      }
    }
    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0D0D', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <p style={{ color: '#FF4444', fontSize: 15 }}>{error}</p>
        <button onClick={() => router.push('/login')} style={{ padding: '12px 32px', borderRadius: 9999, background: 'linear-gradient(135deg, #FF375F, #FF3B30)', color: 'white', border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #FF375F, #FF3B30)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FlameIcon size={32} color="white" />
      </div>
      <p style={{ color: '#ABABAB', fontSize: 15 }}>Signing you in...</p>
    </div>
  );
}
