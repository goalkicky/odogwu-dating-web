'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import GradientBackground from '@/components/GradientBackground';
import TabBar from '@/components/TabBar';

const sections = [
  {
    title: 'What we collect',
    body: 'We collect the information you give us when you create a profile: your name, date of birth, gender, photos, bio, interests and location. We also store the content of your chats and matches so the app can work.',
  },
  {
    title: 'How we use your data',
    body: 'Your data is used to show you profiles you might like, connect you with matches, send messages and calls, and process coin payments. If you disable Data & Analytics, we stop using your usage data to improve the product.',
  },
  {
    title: 'Online status',
    body: 'When Online Status is on, other people can see when you were last active. Turning it off hides your activity while keeping all chat features available.',
  },
  {
    title: 'Profile visibility',
    body: 'With "Everyone", any Odogwu Dating member can find your profile on Discover. With "Only Matches", only people you have already matched with can see your profile.',
  },
  {
    title: 'Blocking',
    body: 'Blocking someone stops them from seeing your profile, liking or messaging you. Your matches and chats with them are hidden while the block is active. You can review and undo blocks at any time in Privacy → Blocked Users.',
  },
  {
    title: 'Your rights',
    body: 'You can update or delete your information at any time. Contact support if you need a copy of your data or want your account removed.',
  },
];

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <GradientBackground style={{ minHeight: '100svh', padding: '24px 16px 85px' }}>
      <div style={{ padding: '60px 24px 24px', maxWidth: 720, margin: '0 auto' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#FF375F', fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: '8px 0', marginBottom: 8 }}>
          ← Back
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: '0 0 8px' }}>Privacy Policy</h1>
        <p style={{ fontSize: 13, color: '#6B6B6B', margin: '0 0 24px' }}>Last updated: August 2026</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sections.map((s, i) => (
            <div key={i} style={{ padding: 18, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: '0 0 6px' }}>{s.title}</h2>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: '#ABABAB', margin: 0 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
      <TabBar />
    </GradientBackground>
  );
}
