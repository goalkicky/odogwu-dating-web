'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronForwardIcon } from '@/components/Icons';
import GradientBackground from '@/components/GradientBackground';
import TabBar from '@/components/TabBar';

export default function PrivacyPage() {
  const router = useRouter();

  const items = [
    { label: 'Blocked Users', desc: 'Manage users you have blocked', onClick: () => {} },
    { label: 'Profile Visibility', desc: 'Control who can see your profile', onClick: () => {} },
    { label: 'Online Status', desc: 'Show when you are active', onClick: () => {} },
    { label: 'Data & Analytics', desc: 'How we use your data', onClick: () => {} },
    { label: 'Privacy Policy', desc: 'Read our privacy policy', onClick: () => {} },
  ];

  return (
    <GradientBackground style={{ minHeight: '100vh', paddingBottom: '85px' }}>
      <div style={{ padding: '60px 24px 24px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#FF375F', fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: '8px 0', marginBottom: 8 }}>
          ← Back
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: '0 0 24px' }}>Privacy</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 12, overflow: 'hidden' }}>
          {items.map((item, i) => (
            <button
              key={i}
              onClick={item.onClick}
              style={{
                display: 'flex', alignItems: 'center', padding: '14px 16px',
                backgroundColor: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer',
                textAlign: 'left', width: '100%', gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, color: 'white' }}>{item.label}</div>
                <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>{item.desc}</div>
              </div>
              <ChevronForwardIcon size={18} color="#6B6B6B" />
            </button>
          ))}
        </div>
      </div>
      <TabBar />
    </GradientBackground>
  );
}
