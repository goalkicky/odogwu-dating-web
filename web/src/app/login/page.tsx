'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SparklesIcon, ShieldIcon, ChatIcon, GoogleIcon } from '@/components/Icons';
import Button from '@/components/Button';
import VideoCarouselBackground from '@/components/VideoCarouselBackground';
import { useAuth } from '@/store/AuthContext';
import { authService } from '@/lib/cloudflare/services';

export default function LoginPage() {
  const { loading, isAuthenticated, isOnboarded, refreshUser } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'google' | 'email'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      router.replace(isOnboarded ? '/discover' : '/onboarding/name');
    }
  }, [loading, isAuthenticated, isOnboarded, router]);

  const routeAfterAuth = () => {
    router.replace(isOnboarded ? '/discover' : '/onboarding/name');
  };

  const handleGoogleLogin = () => {
    router.push('/oauth');
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await authService.login(email.trim(), password);
      const onboarded = await refreshUser();
      setError('');
      router.replace(onboarded ? '/discover' : '/onboarding/name');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 14,
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)',
    color: 'white', fontSize: 15, outline: 'none', boxSizing: 'border-box',
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
          <img src="https://kamsirmdlabs.com/img/logo.png" alt="Odogwu Dating" style={{ width: 60, height: 60, objectFit: 'cover' }} />
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'white', letterSpacing: 4, textTransform: 'uppercase', margin: 0 }}>
          odogwu dating
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
        {mode === 'google' ? (
          <>
            <Button
              title="Continue with Google"
              onPress={handleGoogleLogin}
              variant="gradient"
              size="lg"
              icon={<GoogleIcon size={20} />}
              style={{ width: '100%', marginBottom: 16 }}
            />
            <button
              onClick={() => setMode('email')}
              style={{ background: 'none', border: 'none', color: '#FF6B8A', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 16, padding: '4px 8px' }}
            >
              Sign in with email instead
            </button>
          </>
        ) : (
          <>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                style={inputStyle}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailLogin()}
                placeholder="Password"
                style={inputStyle}
              />
            </div>
            <Button
              title={submitting ? 'Signing in...' : 'Sign In'}
              onPress={handleEmailLogin}
              variant="gradient"
              size="lg"
              disabled={submitting}
              loading={submitting}
              style={{ width: '100%', marginBottom: 12 }}
            />
            <button
              onClick={() => router.push('/register')}
              style={{ background: 'none', border: 'none', color: '#FF6B8A', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginBottom: 16, padding: '4px 8px' }}
            >
              Create an account
            </button>
          </>
        )}
        {error && <p style={{ color: '#FF4444', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</p>}
        <p style={{ color: '#6B6B6B', fontSize: 12, textAlign: 'center', lineHeight: '18px' }}>
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      <div style={{ position: 'absolute', width: 150, height: 150, borderRadius: '50%', opacity: 0.08, top: '40%', right: -60, backgroundColor: '#FFD700', pointerEvents: 'none', zIndex: 1 }} />
    </div>
  );
}
