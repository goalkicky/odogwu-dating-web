'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronForwardIcon, BellIcon, ShieldIcon, HelpIcon, PencilIcon } from '@/components/Icons';
import GradientBackground from '@/components/GradientBackground';
import TabBar from '@/components/TabBar';

export default function SettingsPage() {
  const router = useRouter();

  const sections = [
    {
      title: 'Account',
      items: [
        { icon: <PencilIcon size={22} color="#ABABAB" />, label: 'Edit Profile', onClick: () => router.push('/edit-profile') },
        { icon: <BellIcon size={22} color="#ABABAB" />, label: 'Notifications', onClick: () => router.push('/notifications') },
        { icon: <ShieldIcon size={22} color="#ABABAB" />, label: 'Privacy', onClick: () => router.push('/privacy') },
        { icon: <HelpIcon size={22} color="#ABABAB" />, label: 'Help & Support', onClick: () => router.push('/faq') },
      ],
    },
  ];

  return (
    <GradientBackground style={{ minHeight: '100vh', paddingBottom: '85px', paddingTop: '24px' }}>
      <div style={{ padding: '60px 24px 24px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#FF375F', fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: '8px 0', marginBottom: 8 }}>
          ← Back
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: '0 0 24px' }}>Settings</h1>
        {sections.map((section, i) => (
          <div key={i} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>{section.title}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 12, overflow: 'hidden' }}>
              {section.items.map((item, j) => (
                <button
                  key={j}
                  onClick={item.onClick}
                  style={{
                    display: 'flex', alignItems: 'center', padding: '14px 16px',
                    backgroundColor: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer',
                    textAlign: 'left', width: '100%', gap: 12,
                  }}
                >
                  {item.icon}
                  <span style={{ flex: 1, fontSize: 15, color: 'white' }}>{item.label}</span>
                  <ChevronForwardIcon size={18} color="#6B6B6B" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <TabBar />
    </GradientBackground>
  );
}
