'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleIcon } from '@/components/Icons';
import Button from '@/components/Button';
import VideoCarouselBackground from '@/components/VideoCarouselBackground';
import { useAuth } from '@/store/AuthContext';
import { authService } from '@/lib/cloudflare/services';

export default function RegisterPage() {
  const { refreshUser } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 14,
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)',
    color: 'white', fontSize: 15, outline: 'none', boxSizing: 'border-box',
  };

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await authService.register(email.trim(), password, fullName.trim());
      await refreshUser();
      router.replace('/onboarding/name');
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px', position: 'relative', overflow: 'hidden' }}>
      <VideoCarouselBackground />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '60px', position: 'relative', zIndex: 1, maxWidth: 420, width: '100%', margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'white', margin: '0 0 6px' }}>Create account</h1>
        <p style={{ fontSize: 14, color: '#ABABAB', margin: '0 0 28px' }}>Join Odogwu Dating and start meeting people</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" style={inputStyle} />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" style={inputStyle} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
            placeholder="Password (min 8 characters)"
            style={inputStyle}
          />
        </div>

        {error && <p style={{ color: '#FF4444', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</p>}

        <Button title={submitting ? 'Creating account...' : 'Create Account'} onPress={handleRegister} variant="gradient" size="lg" disabled={submitting} loading={submitting} style={{ width: '100%', marginBottom: 14 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0 14px' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ color: '#6B6B6B', fontSize: 12 }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        </div>

        <Button title="Continue with Google" onPress={() => router.push('/oauth')} variant="outline" size="lg" icon={<GoogleIcon size={20} />} style={{ width: '100%', marginBottom: 16 }} />

        <p style={{ color: '#6B6B6B', fontSize: 13, textAlign: 'center' }}>
          Already have an account?{' '}
          <button onClick={() => router.push('/login')} style={{ background: 'none', border: 'none', color: '#FF6B8A', fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: 0 }}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
