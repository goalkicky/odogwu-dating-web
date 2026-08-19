'use client';
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/Button';
import VideoCarouselBackground from '@/components/VideoCarouselBackground';
import { authService } from '@/lib/cloudflare/services';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticket = searchParams.get('ticket') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 14,
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)',
    color: 'white', fontSize: 15, outline: 'none', boxSizing: 'border-box',
  };

  const handleReset = async () => {
    if (!password || !confirm || submitting) return;
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await authService.resetPassword(ticket, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password. Please try again.');
    }
    setSubmitting(false);
  };

  if (!ticket) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px', position: 'relative', overflow: 'hidden' }}>
        <VideoCarouselBackground />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <p style={{ color: '#ABABAB', fontSize: 15, textAlign: 'center' }}>Invalid reset link. Please request a new code.</p>
          <button
            onClick={() => router.push('/forgot-password')}
            style={{ background: 'none', border: 'none', color: '#FF6B8A', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 12 }}
          >
            Go to Forgot Password
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px', position: 'relative', overflow: 'hidden' }}>
        <VideoCarouselBackground />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ width: 64, height: 64, borderRadius: 9999, background: 'linear-gradient(135deg, #34C759, #30B350)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 28, color: 'white' }}>&#10003;</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'white', margin: '0 0 8px' }}>Password Updated</h1>
          <p style={{ fontSize: 14, color: '#ABABAB', margin: '0 0 24px', textAlign: 'center' }}>Your password has been changed successfully.</p>
          <Button
            title="Sign In"
            onPress={() => router.replace('/login')}
            variant="gradient"
            size="lg"
            style={{ width: '100%', maxWidth: 300 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px', position: 'relative', overflow: 'hidden' }}>
      <VideoCarouselBackground />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '60px', position: 'relative', zIndex: 1, maxWidth: 420, width: '100%', margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: '0 0 6px' }}>New Password</h1>
        <p style={{ fontSize: 14, color: '#ABABAB', margin: '0 0 28px' }}>Enter your new password below</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (min 8 characters)"
            style={inputStyle}
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleReset()}
            placeholder="Confirm new password"
            style={inputStyle}
          />
        </div>

        {error && <p style={{ color: '#FF4444', fontSize: 13, textAlign: 'center', marginTop: 12 }}>{error}</p>}

        <Button
          title={submitting ? 'Updating...' : 'Update Password'}
          onPress={handleReset}
          variant="gradient"
          size="lg"
          disabled={submitting}
          loading={submitting}
          style={{ width: '100%', marginTop: 16, marginBottom: 14 }}
        />

        <button
          onClick={() => router.push('/login')}
          style={{ background: 'none', border: 'none', color: '#FF6B8A', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '4px 8px', alignSelf: 'center' }}
        >
          Back to sign in
        </button>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0D0D0D' }} />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
