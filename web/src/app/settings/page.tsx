'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronForwardIcon, BellIcon, ShieldIcon, HelpIcon } from '@/components/Icons';
import AppShell from '@/components/AppShell';

export default function SettingsPage() {
  const router = useRouter();

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: <BellIcon size={22} color="#8A8A8F" />, label: 'Notifications', onClick: () => router.push('/notifications') },
        { icon: <ShieldIcon size={22} color="#8A8A8F" />, label: 'Privacy', onClick: () => router.push('/privacy') },
        { icon: <HelpIcon size={22} color="#8A8A8F" />, label: 'Help & Support', onClick: () => router.push('/faq') },
      ],
    },
  ];

  return (
    <AppShell>
      <div style={{ padding: '0 24px 24px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#FF2E5F', fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: '8px 0', marginBottom: 8 }}>
          â† Back
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#151515', margin: '0 0 24px' }}>Settings</h1>
        {sections.map((section, i) => (
          <div key={i} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#8A8A8F', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>{section.title}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 12, overflow: 'hidden' }}>
              {section.items.map((item, j) => (
                <button
                  key={j}
                  onClick={item.onClick}
                  style={{
                    display: 'flex', alignItems: 'center', padding: '14px 16px',
                    backgroundColor: '#F6F6F9', border: 'none', cursor: 'pointer',
                    textAlign: 'left', width: '100%', gap: 12,
                  }}
                >
                  {item.icon}
                  <span style={{ flex: 1, fontSize: 15, color: '#151515' }}>{item.label}</span>
                  <ChevronForwardIcon size={18} color="#8A8A8F" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
