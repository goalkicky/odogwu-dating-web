'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import VideoCarouselBackground from '@/components/VideoCarouselBackground';
import { authService } from '@/lib/cloudflare/services';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '14px 16px', borderRadius: 14,
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)',
    color: 'white', fontSize: 15, outline: 'none', boxSizing: 'border-box',
  };

  const handleRequest = async () => {
    if (!email.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const data = await authService.forgotPassword(email.trim());
      setTicket(data.ticket);
      setShortCode(data.shortCode);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate reset code. Please try again.');
    }
    setSubmitting(false);
  };

  if (ticket) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px', position: 'relative', overflow: 'hidden' }}>
        <VideoCarouselBackground />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '60px', position: 'relative', zIndex: 1, maxWidth: 420, width: '100%', margin: '0 auto' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: '0 0 6px' }}>Reset Code</h1>
          <p style={{ fontSize: 14, color: '#ABABAB', margin: '0 0 24px' }}>Copy this code and enter it along with your new password.</p>

          <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: '#6B6B6B', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 700 }}>Your reset code</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#FF6B8A', margin: 0, fontFamily: 'monospace', letterSpacing: 4 }}>{shortCode}</p>
          </div>

          <p style={{ fontSize: 12, color: '#6B6B6B', margin: '0 0 20px', lineHeight: '18px' }}>
            This code expires in 30 minutes. If you don&apos;t reset your password, you can still sign in with your current password.
          </p>

          <Button
            title="Reset Password"
            onPress={() => router.push(`/reset-password?ticket=${encodeURIComponent(ticket)}`)}
            variant="gradient"
            size="lg"
            style={{ width: '100%', marginBottom: 14 }}
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '0 24px', position: 'relative', overflow: 'hidden' }}>
      <VideoCarouselBackground />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '60px', position: 'relative', zIndex: 1, maxWidth: 420, width: '100%', margin: '0 auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: '0 0 6px' }}>Forgot Password</h1>
        <p style={{ fontSize: 14, color: '#ABABAB', margin: '0 0 28px' }}>Enter your email to receive a reset code</p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRequest()}
          placeholder="Email address"
          style={inputStyle}
        />

        {error && <p style={{ color: '#FF4444', fontSize: 13, textAlign: 'center', marginTop: 12 }}>{error}</p>}

        <Button
          title={submitting ? 'Sending...' : 'Send Reset Code'}
          onPress={handleRequest}
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
