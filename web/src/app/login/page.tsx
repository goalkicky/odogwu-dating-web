'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FlameIcon, SparklesIcon, ShieldIcon, ChatIcon, GoogleIcon } from '@/components/Icons';
import Button from '@/components/Button';
import VideoCarouselBackground from '@/components/VideoCarouselBackground';
import { useAuth } from '@/store/AuthContext';

export default function LoginPage() {
  const { loading, isAuthenticated, isOnboarded, refreshUser } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      router.replace(isOnboarded ? '/discover' : '/onboarding/name');
    }
  }, [loading, isAuthenticated, isOnboarded, router]);

  const handleGoogleLogin = () => {
    router.push('/oauth');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <VideoCarouselBackground />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '80px', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 40,
            background: 'linear-gradient(135deg, #FF3B30, #FF375F)',
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', paddingBottom: 32, position: 'relative', zIndex: 1 }}>
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

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 60, position: 'relative', zIndex: 1 }}>
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

      <div style={{ position: 'absolute', width: 150, height: 150, borderRadius: '50%', opacity: 0.08, top: '40%', right: -60, backgroundColor: '#FFD700', pointerEvents: 'none', zIndex: 1 }} />
    </div>
  );
}
