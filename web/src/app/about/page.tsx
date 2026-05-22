'use client';
import React from 'react';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';
import { FlameIcon, HeartIcon, StarIcon, ShieldIcon, InfiniteIcon } from '@/components/Icons';

const team = [
  { name: 'Emeka Okafor', role: 'CEO & Founder', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', bio: 'Former tech lead with a passion for creating meaningful human connections through technology.' },
  { name: 'Folake Adeyemi', role: 'CTO', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200', bio: 'Full-stack engineer with 10+ years experience building scalable social platforms.' },
  { name: 'Chinedu Obi', role: 'Head of Product', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200', bio: 'Product strategist focused on creating intuitive, delightful user experiences.' },
];

const values = [
  { icon: <ShieldIcon size={24} color="#FF375F" />, title: 'Authenticity', desc: 'We believe in genuine connections. Every profile is verified to ensure you meet real people.' },
  { icon: <HeartIcon size={24} color="#6C63FF" />, title: 'Respect', desc: 'We foster a community built on mutual respect, kindness, and understanding.' },
  { icon: <StarIcon size={24} color="#FFD700" />, title: 'Excellence', desc: 'We continuously innovate to deliver the best dating experience possible.' },
  { icon: <InfiniteIcon size={24} color="#34C759" />, title: 'Inclusivity', desc: 'Everyone deserves love. We celebrate diversity and create a safe space for all.' },
];

const milestones = [
  { year: '2023', event: 'Odogwu was founded with a vision to transform dating in Africa' },
  { year: '2024', event: 'Launched our AI-powered matching algorithm and reached 10,000 users' },
  { year: '2025', event: 'Introduced video calls, voice notes, and expanded to 15 countries' },
  { year: '2026', event: '50,000+ active users and 10,000+ success stories and counting' },
];

export default function AboutPage() {
  return (
    <div style={{ background: '#0D0D0D', color: 'white' }}>
      <MarketingNav />

      {/* Hero */}
      <section style={{ padding: '140px 24px 80px', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 20px', borderRadius: 9999, background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.2)', marginBottom: 24, fontSize: 13, color: '#6C63FF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
          <FlameIcon size={16} color="#6C63FF" /> About Odogwu
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 800, margin: '0 0 20px', lineHeight: 1.15 }}>
          Our Mission: Make <span style={{ background: 'linear-gradient(135deg, #FF375F, #6C63FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Love Accessible</span> to Everyone
        </h1>
        <p style={{ color: '#ABABAB', fontSize: 18, lineHeight: '30px', maxWidth: 650, margin: '0 auto' }}>
          Odogwu was born from a simple belief: everyone deserves to find meaningful love. We&apos;re building a platform where authenticity meets technology to create real, lasting connections across Africa and beyond.
        </p>
      </section>

      {/* Story */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(180deg, rgba(255,55,95,0.03) 0%, transparent 100%)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, margin: '0 0 20px' }}>Our <span style={{ background: 'linear-gradient(135deg, #FF375F, #6C63FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Story</span></h2>
            <p style={{ color: '#ABABAB', fontSize: 15, lineHeight: '26px', margin: '0 0 16px' }}>
              Odogwu started in 2023 when our founder, Emeka Okafor, realized that existing dating platforms weren&apos;t designed with African singles in mind. The algorithms didn&apos;t understand local cultures, the features didn&apos;t match how people actually connect, and safety wasn&apos;t prioritized.
            </p>
            <p style={{ color: '#ABABAB', fontSize: 15, lineHeight: '26px', margin: 0 }}>
              We built Odogwu from the ground up to celebrate African love stories. With AI-powered matching that learns your preferences, verified profiles for authentic connections, and real-time communication tools, we&apos;re helping thousands of singles find their perfect match every day.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <div style={{ aspectRatio: '1', borderRadius: 20, background: 'linear-gradient(135deg, #FF375F, #6C63FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>❤️</div>
            <div style={{ aspectRatio: '1', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <div style={{ fontSize: 32, fontWeight: 800, background: 'linear-gradient(135deg, #FFD700, #FF375F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>10K+</div>
              <div style={{ fontSize: 12, color: '#6B6B6B' }}>Success Stories</div>
            </div>
            <div style={{ aspectRatio: '1', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <div style={{ fontSize: 32, fontWeight: 800, background: 'linear-gradient(135deg, #6C63FF, #FF375F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>15</div>
              <div style={{ fontSize: 12, color: '#6B6B6B' }}>Countries</div>
            </div>
            <div style={{ aspectRatio: '1', borderRadius: 20, background: 'linear-gradient(135deg, #6C63FF, #FF375F)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60 }}>🌍</div>
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section style={{ padding: '80px 24px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, margin: '0 0 12px' }}>Our <span style={{ background: 'linear-gradient(135deg, #FFD700, #FF375F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Journey</span></h2>
          <p style={{ color: '#ABABAB', fontSize: 15 }}>Key milestones in our mission to transform dating.</p>
        </div>
        <div style={{ position: 'relative', paddingLeft: 40 }}>
          <div style={{ position: 'absolute', left: 19, top: 0, bottom: 0, width: 2, background: 'linear-gradient(180deg, #FF375F, #6C63FF)' }} />
          {milestones.map((m, i) => (
            <div key={i} style={{ position: 'relative', paddingBottom: 40, paddingLeft: 32 }}>
              <div style={{ position: 'absolute', left: -32, top: 0, width: 14, height: 14, borderRadius: '50%', background: 'linear-gradient(135deg, #FF375F, #6C63FF)', border: '3px solid #0D0D0D' }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: '#FF375F', marginBottom: 4 }}>{m.year}</div>
              <div style={{ fontSize: 15, color: '#D0D0D0', lineHeight: '24px' }}>{m.event}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(180deg, rgba(108,99,255,0.03) 0%, transparent 100%)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, margin: '0 0 12px' }}>Our <span style={{ background: 'linear-gradient(135deg, #6C63FF, #FF375F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Values</span></h2>
            <p style={{ color: '#ABABAB', fontSize: 15 }}>The principles that guide everything we do.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {values.map((v, i) => (
              <div key={i} style={{ padding: '32px 24px', background: 'rgba(255,255,255,0.03)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,55,95,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>{v.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>{v.title}</h3>
                <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: '22px', margin: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 800, margin: '0 0 12px' }}>Meet the <span style={{ background: 'linear-gradient(135deg, #FF375F, #6C63FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Team</span></h2>
          <p style={{ color: '#ABABAB', fontSize: 15 }}>The people building Odogwu with passion and purpose.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
          {team.map((m, i) => (
            <div key={i} style={{ padding: '32px', background: 'rgba(255,255,255,0.03)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
              <img src={m.photo} alt={m.name} style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>{m.name}</h3>
              <div style={{ fontSize: 13, color: '#FF375F', fontWeight: 600, marginBottom: 12 }}>{m.role}</div>
              <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: '22px', margin: 0 }}>{m.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 12px' }}>Be Part of Our Story</h2>
          <p style={{ color: '#ABABAB', fontSize: 16, marginBottom: 32 }}>Join the thousands who have found love through Odogwu.</p>
          <a href="/login" style={{
            padding: '16px 40px', borderRadius: 9999, fontSize: 16, fontWeight: 700,
            background: 'linear-gradient(135deg, #FF375F, #6C63FF)',
            color: 'white', textDecoration: 'none', display: 'inline-block',
            transition: 'transform 0.3s, box-shadow 0.3s',
            boxShadow: '0 0 40px rgba(255,55,95,0.3)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(255,55,95,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(255,55,95,0.3)'; }}
          >Create Free Account</a>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
