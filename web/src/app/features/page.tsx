'use client';
import React from 'react';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';
import { SparklesIcon, ShieldIcon, ChatIcon, StarIcon, GlobeIcon, EyeIcon, FlashIcon, CheckmarkCircleIcon } from '@/components/Icons';

const featureGroups = [
  {
    title: 'Smart Matching', color: '#FF375F',
    desc: 'Our AI learns your preferences from every interaction. The more you use Odogwu, the better your matches become.',
    icon: <SparklesIcon size={32} color="#FF375F" />,
    items: [
      'AI-powered compatibility scoring based on interests, values, and lifestyle',
      'Behavioral learning that improves match quality over time',
      'Daily curated matches delivered to your inbox',
      'Advanced filtering by age, location, interests, and more',
      'Mutual interest detection for smarter suggestions',
    ],
  },
  {
    title: 'Verified Profiles', color: '#6C63FF',
    desc: 'Say goodbye to catfish. Every profile on Odogwu goes through a rigorous verification process to ensure authenticity.',
    icon: <ShieldIcon size={32} color="#6C63FF" />,
    items: [
      'Photo verification with AI-powered liveness detection',
      'Phone number and email verification required',
      'Social media cross-referencing for extra authenticity',
      'Blue verification badges for trusted profiles',
      'Manual review for suspicious accounts',
    ],
  },
  {
    title: 'Real-time Communication', color: '#34C759',
    desc: 'Connect naturally with instant messaging, crystal-clear voice notes, and HD video calls — all in-app.',
    icon: <ChatIcon size={32} color="#34C759" />,
    items: [
      'Instant messaging with typing indicators and read receipts',
      'Voice notes for a more personal touch',
      'HD video calls with virtual background support',
      'Group voice rooms for icebreaker conversations',
      'Smart reply suggestions to keep conversations flowing',
    ],
  },
  {
    title: 'Premium Features', color: '#FFD700',
    desc: 'Stand out and get more matches with our premium suite of features designed to give you an edge.',
    icon: <StarIcon size={32} color="#FFD700" />,
    items: [
      'Super Likes to show you\'re genuinely interested',
      'Profile Boosts for 10x more visibility',
      'See who liked you before you swipe',
      'Unlimited rewinds to reconsider profiles',
      'Incognito mode for private browsing',
    ],
  },
  {
    title: 'Global Passport', color: '#007AFF',
    desc: 'Love knows no borders. Use Passport to match with people anywhere in the world before you travel.',
    icon: <GlobeIcon size={32} color="#007AFF" />,
    items: [
      'Match in any city or country worldwide',
      'See where your matches are located on a map',
      'Travel mode that updates your location automatically',
      'Discover events and meetups in your destination',
      'Translate messages in real-time',
    ],
  },
  {
    title: 'Safety First', color: '#AF52DE',
    desc: 'Your safety is our top priority. We use cutting-edge technology and human moderators to keep you safe.',
    icon: <EyeIcon size={32} color="#AF52DE" />,
    items: [
      'AI-powered content moderation and spam detection',
      '24/7 human moderation team for reported accounts',
      'Block and report with one tap',
      'Photo privacy controls — blur or hide your photos',
      'Location sharing only when you choose',
      'Emergency contact and safety check-in features',
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div style={{ background: '#0D0D0D', color: 'white' }}>
      <MarketingNav />

      <section style={{ padding: '140px 24px 80px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 20px', borderRadius: 9999, background: 'rgba(255,55,95,0.1)', border: '1px solid rgba(255,55,95,0.2)', marginBottom: 24, fontSize: 13, color: '#FF375F', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
          <FlashIcon size={16} color="#FF375F" /> Features
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 800, margin: '0 0 16px' }}>
          Powerful Features for <span style={{ background: 'linear-gradient(135deg, #FF375F, #6C63FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Meaningful Connections</span>
        </h1>
        <p style={{ color: '#ABABAB', fontSize: 18, maxWidth: 600, margin: '0 auto', lineHeight: '28px' }}>
          Every feature in Odogwu is designed with one goal: helping you find authentic, lasting relationships. From AI matching to safety tools, we&apos;ve got you covered.
        </p>
      </section>

      {/* Feature sections */}
      {featureGroups.map((fg, i) => (
        <section key={i} style={{
          padding: '80px 24px',
          background: i % 2 === 0 ? 'linear-gradient(180deg, rgba(108,99,255,0.03) 0%, transparent 100%)' : 'transparent',
        }}>
          <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 48, alignItems: 'center' }}>
            <div style={{ order: i % 2 === 0 ? 1 : 2 }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: `rgba(${fg.color === '#FF375F' ? '255,55,95' : fg.color === '#6C63FF' ? '108,99,255' : fg.color === '#34C759' ? '52,199,89' : fg.color === '#FFD700' ? '255,215,0' : fg.color === '#007AFF' ? '0,122,255' : '175,82,222'},0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>{fg.icon}</div>
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 800, margin: '0 0 12px' }}>{fg.title}</h2>
              <p style={{ color: '#ABABAB', fontSize: 15, lineHeight: '26px', marginBottom: 24 }}>{fg.desc}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {fg.items.map((item, j) => (
                  <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <CheckmarkCircleIcon size={18} color={fg.color} />
                    <span style={{ fontSize: 14, color: '#D0D0D0', lineHeight: '20px' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{
              order: i % 2 === 0 ? 2 : 1, aspectRatio: '1', borderRadius: 24,
              background: `linear-gradient(135deg, ${fg.color}22, ${fg.color}11)`,
              border: `1px solid ${fg.color}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 80,
            }}>
              {i === 0 && '🧠'}
              {i === 1 && '✅'}
              {i === 2 && '💬'}
              {i === 3 && '⭐'}
              {i === 4 && '🌍'}
              {i === 5 && '🛡️'}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section style={{ padding: '100px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 12px' }}>Ready to Experience All Features?</h2>
          <p style={{ color: '#ABABAB', fontSize: 16, marginBottom: 32 }}>Start for free and unlock premium features when you&apos;re ready.</p>
          <a href="/login" style={{
            padding: '16px 40px', borderRadius: 9999, fontSize: 16, fontWeight: 700,
            background: 'linear-gradient(135deg, #FF375F, #6C63FF)',
            color: 'white', textDecoration: 'none', display: 'inline-block',
            transition: 'transform 0.3s, box-shadow 0.3s',
            boxShadow: '0 0 40px rgba(255,55,95,0.3)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(255,55,95,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(255,55,95,0.3)'; }}
          >Get Started Free</a>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
