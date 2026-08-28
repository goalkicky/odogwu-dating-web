'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';

export default function NotificationsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    newMatches: true,
    messages: true,
    likes: true,
    superLikes: true,
    profileVisits: false,
    promotional: false,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const rows = [
    { key: 'newMatches' as const, label: 'New Matches', desc: 'When someone matches with you' },
    { key: 'messages' as const, label: 'Messages', desc: 'When you receive a new message' },
    { key: 'likes' as const, label: 'Likes', desc: 'When someone likes your profile' },
    { key: 'superLikes' as const, label: 'Super Likes', desc: 'When someone Super Likes you' },
    { key: 'profileVisits' as const, label: 'Profile Visits', desc: 'When someone views your profile' },
    { key: 'promotional' as const, label: 'Promotional', desc: 'Tips, offers, and updates' },
  ];

  return (
    <AppShell>
      <div style={{ padding: '0 24px 24px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#FF375F', fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: '8px 0', marginBottom: 8 }}>
          ← Back
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#151515', margin: '0 0 24px' }}>Notifications</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 12, overflow: 'hidden' }}>
          {rows.map((row) => (
            <button
              key={row.key}
              onClick={() => toggle(row.key)}
              style={{
                display: 'flex', alignItems: 'center', padding: '14px 16px',
                backgroundColor: '#F6F6F9', border: 'none', cursor: 'pointer',
                textAlign: 'left', width: '100%', gap: 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, color: '#151515' }}>{row.label}</div>
                <div style={{ fontSize: 12, color: '#8A8A8F', marginTop: 2 }}>{row.desc}</div>
              </div>
              <div style={{
                width: 48, height: 28, borderRadius: 14, padding: 2,
                background: settings[row.key] ? 'linear-gradient(135deg, #FF375F, #FF3B30)' : '#D0D0D5',
                transition: 'background 0.2s',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: 12, background: 'white',
                  marginLeft: settings[row.key] ? 22 : 2,
                  transition: 'margin 0.2s',
                }} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
