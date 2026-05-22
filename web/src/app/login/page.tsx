'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FlameIcon, SparklesIcon, ShieldIcon, ChatIcon, GoogleIcon } from '@/components/Icons';
import Button from '@/components/Button';
import { useAuth } from '@/store/AuthContext';

export default function LoginPage() {
  const { refreshUser } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setError('');
      const { authService } = await import('@/lib/appwrite/services');
      await authService.loginWithGoogle();
      await refreshUser();
      router.push('/onboarding/name');
    } catch (err) {
      console.error('Login error:', err);
      setError('Google sign-in failed.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0D0D0D, #1A0A0A, #0D0D0D)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 40,
            background: 'linear-gradient(135deg, #FF375F, #6C63FF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            boxShadow: '0 0 20px rgba(255,55,95,0.5)',
          }}
        >
          <FlameIcon size={60} color="white" />
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 800, color: 'white', letterSpacing: 4, textTransform: 'uppercase', margin: 0 }}>
          odogwu
        </h1>
        <p style={{ fontSize: 18, color: '#ABABAB', marginTop: 8 }}>Find your perfect match</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', paddingBottom: 32 }}>
        {[
          { icon: <SparklesIcon size={20} color="#FF375F" />, text: 'Smart Matching Algorithm' },
          { icon: <ShieldIcon size={20} color="#FF375F" />, text: 'Verified Profiles Only' },
          { icon: <ChatIcon size={20} color="#FF375F" />, text: 'Real-time Chat & Calls' },
        ].map((feature, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {feature.icon}
            <span style={{ color: '#ABABAB', fontSize: 15 }}>{feature.text}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 60 }}>
        <Button
          title="Continue with Google"
          onPress={handleGoogleLogin}
          variant="gradient"
          size="lg"
          icon={<GoogleIcon size={20} />}
          style={{ width: '100%', marginBottom: 16 }}
        />
        {error && <p style={{ color: '#FF4444', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</p>}
        <p style={{ color: '#6B6B6B', fontSize: 12, textAlign: 'center', lineHeight: '18px' }}>
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', opacity: 0.08, top: -50, right: -80, backgroundColor: '#FF375F', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', opacity: 0.08, bottom: 100, left: -100, backgroundColor: '#6C63FF', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 150, height: 150, borderRadius: '50%', opacity: 0.08, top: '40%', right: -60, backgroundColor: '#FFD700', pointerEvents: 'none' }} />
    </div>
  );
}
