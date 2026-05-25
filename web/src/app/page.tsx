'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';
import { useMobile } from '@/lib/useMediaQuery';
import { ChatIcon, StarIcon, ShieldIcon, SparklesIcon, GlobeIcon, EyeIcon } from '@/components/Icons';

const ACCENT = '#FF3B30';

function AnimatedCounter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !counted.current) {
        counted.current = true;
        let start = 0;
        const duration = 2000;
        const step = Math.ceil(to / (duration / 16));
        const timer = setInterval(() => {
          start += step;
          if (start >= to) { setCount(to); clearInterval(timer); }
          else setCount(start);
        }, 16);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [to]);

  return <div ref={ref}>{count.toLocaleString()}{suffix}</div>;
}

const features = [
  { icon: <SparklesIcon size={28} color="#FF375F" />, title: 'Smart Matching', desc: 'Our AI-powered algorithm learns your preferences and suggests the most compatible profiles.' },
  { icon: <ShieldIcon size={28} color={ACCENT} />, title: 'Verified Profiles', desc: 'Every profile is verified to ensure authentic connections. No catfish, no bots.' },
  { icon: <ChatIcon size={28} color="#34C759" />, title: 'Real-time Chat', desc: 'Break the ice with instant messaging, voice notes, and video calls.' },
  { icon: <StarIcon size={28} color="#FFD700" />, title: 'Super Likes & Boosts', desc: 'Stand out with Super Likes and get 10x more visibility with Boosts.' },
  { icon: <GlobeIcon size={28} color="#FF3B30" />, title: 'Global Passport', desc: 'Match with people anywhere in the world. Love knows no borders.' },
  { icon: <EyeIcon size={28} color="#FF375F" />, title: 'See Who Likes You', desc: 'Know exactly who\'s interested before you swipe. No more guessing.' },
];

const steps = [
  { num: '01', title: 'Create Your Profile', desc: 'Add your photos, interests, and tell your story. Our smart prompts help you shine.' },
  { num: '02', title: 'Discover Matches', desc: 'Swipe through curated profiles matched to your preferences and personality.' },
  { num: '03', title: 'Connect & Chat', desc: 'Matched? Start a conversation with text, voice, or video calls in real-time.' },
  { num: '04', title: 'Find Your Person', desc: 'Build meaningful relationships that go beyond the swipe.' },
];

const testimonials = [
  { name: 'Amara O.', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', text: 'I found the love of my life on Odogwu. The verified profiles gave me confidence to connect.', location: 'Lagos, Nigeria' },
  { name: 'Chidi E.', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', text: 'The smart matching is incredible. I matched with someone who shares all my interests!', location: 'Abuja, Nigeria' },
  { name: 'Zainab K.', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', text: 'From the first chat to our first date, everything felt natural. Thank you Odogwu!', location: 'Port Harcourt, Nigeria' },
];

export default function LandingPage() {
  const isMobile = useMobile();
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIdx(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ background: '#0D0D0D', color: 'white', overflow: 'hidden' }}>
      <MarketingNav />

      {/* ===== HERO ===== */}
      <section style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '100px 16px 60px' : '120px 24px 80px',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: isMobile ? 250 : 400, height: isMobile ? 250 : 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,55,95,0.15), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: isMobile ? 300 : 500, height: isMobile ? 300 : 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,59,48,0.12), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: isMobile ? '100%' : 900, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 9999,
            background: 'rgba(255,55,95,0.1)', border: '1px solid rgba(255,55,95,0.2)',
            marginBottom: isMobile ? 24 : 32, fontSize: isMobile ? 12 : 14, color: '#FF6B8A',
          }}>
            <SparklesIcon size={12} color="#FF6B8A" />
            <span>Trusted by 50,000+ singles across Africa</span>
          </div>

          <h1 style={{
            fontSize: isMobile ? '32px' : 'clamp(40px, 8vw, 80px)',
            fontWeight: 800, lineHeight: 1.1, margin: '0 0 16px',
            letterSpacing: isMobile ? '-1px' : '-2px',
          }}>
            Find Your{' '}
            <span className="gradient-text">Perfect Match</span>
            {' '}With Odogwu
          </h1>

          <p style={{
            fontSize: isMobile ? 15 : 'clamp(16px, 2vw, 20px)',
            color: '#ABABAB', maxWidth: 650,
            margin: '0 auto 32px', lineHeight: 1.6,
            padding: isMobile ? '0 8px' : 0,
          }}>
            Smart matching powered by AI. Verified profiles for authentic connections.
            Real-time chat, voice, and video calls. Your journey to meaningful relationships starts here.
          </p>

          <div style={{ display: 'flex', gap: isMobile ? 12 : 16, justifyContent: 'center', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center' }}>
            <Link href="/login" style={{
              padding: isMobile ? '14px 32px' : '18px 40px',
              borderRadius: 9999, fontSize: isMobile ? 15 : 17, fontWeight: 700,
              background: 'linear-gradient(135deg, #FF375F, #FF3B30)',
              color: 'white', textDecoration: 'none', display: 'inline-block',
              width: isMobile ? '100%' : 'auto', textAlign: 'center',
              boxShadow: '0 0 40px rgba(255,55,95,0.3)',
            }}>
              Join Free Today
            </Link>
            <Link href="/features" style={{
              padding: isMobile ? '14px 32px' : '18px 40px',
              borderRadius: 9999, fontSize: isMobile ? 15 : 17, fontWeight: 600,
              border: '2px solid rgba(255,255,255,0.15)', color: 'white', textDecoration: 'none',
              background: 'rgba(255,255,255,0.05)',
              width: isMobile ? '100%' : 'auto', textAlign: 'center',
            }}>
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section style={{ padding: isMobile ? '40px 16px' : '60px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: isMobile ? 12 : 32,
        }}>
          {[
            { value: 50000, suffix: '+', label: 'Active Users' },
            { value: 10000, suffix: '+', label: 'Success Stories' },
            { value: 2, suffix: 'M+', label: 'Matches Made' },
            { value: 98, suffix: '%', label: 'Safety Rating' },
          ].map(s => (
            <div key={s.label} style={{
              padding: isMobile ? '20px 12px' : '32px 16px',
              background: 'rgba(255,255,255,0.03)', borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div style={{
                fontSize: isMobile ? 28 : 40, fontWeight: 800,
                background: 'linear-gradient(135deg, #FF375F, #FF3B30)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginBottom: 4,
              }}>
                <AnimatedCounter to={s.value} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: isMobile ? 12 : 14, color: '#6B6B6B', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section style={{ padding: isMobile ? '60px 16px' : '100px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 64 }}>
          <span style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: 9999,
            background: `rgba(255,59,48,0.1)`, border: `1px solid rgba(255,59,48,0.2)`,
            fontSize: 12, fontWeight: 600, color: ACCENT, marginBottom: 12,
            textTransform: 'uppercase', letterSpacing: 1,
          }}>How It Works</span>
          <h2 style={{ fontSize: isMobile ? 24 : 'clamp(28px, 4vw, 44px)', fontWeight: 800, margin: '0 0 12px' }}>
            Find Love in <span className="gradient-text">4 Simple Steps</span>
          </h2>
          <p style={{ color: '#ABABAB', fontSize: isMobile ? 14 : 16, maxWidth: 600, margin: '0 auto', padding: isMobile ? '0 8px' : 0 }}>
            Getting started is easy. Create your profile, discover matches, and start connecting.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: isMobile ? 12 : 24,
        }}>
          {steps.map(s => (
            <div key={s.num} className="card" style={{ padding: isMobile ? '24px 20px' : '32px 24px', position: 'relative' }}>
              <div style={{
                fontSize: isMobile ? 36 : 48, fontWeight: 900,
                background: 'linear-gradient(135deg, #FF375F, #FF3B30)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                opacity: 0.3, position: 'absolute', top: 12, right: 20,
              }}>{s.num}</div>
              <div style={{
                width: isMobile ? 40 : 48, height: isMobile ? 40 : 48,
                borderRadius: 12, background: 'linear-gradient(135deg, #FF375F, #FF3B30)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16, fontSize: isMobile ? 16 : 20, fontWeight: 800, color: 'white',
              }}>{s.num}</div>
              <h3 style={{ fontSize: isMobile ? 17 : 20, fontWeight: 700, margin: '0 0 6px' }}>{s.title}</h3>
              <p style={{ fontSize: isMobile ? 13 : 14, color: '#6B6B6B', lineHeight: '20px', margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section style={{
        padding: isMobile ? '60px 16px' : '100px 24px',
        background: 'linear-gradient(180deg, rgba(255,59,48,0.03) 0%, transparent 100%)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 64 }}>
            <span style={{
              display: 'inline-block', padding: '6px 16px', borderRadius: 9999,
              background: 'rgba(255,55,95,0.1)', border: '1px solid rgba(255,55,95,0.2)',
              fontSize: 12, fontWeight: 600, color: '#FF375F', marginBottom: 12,
              textTransform: 'uppercase', letterSpacing: 1,
            }}>Features</span>
            <h2 style={{ fontSize: isMobile ? 24 : 'clamp(28px, 4vw, 44px)', fontWeight: 800, margin: '0 0 12px' }}>
              Everything You Need to <span className="gradient-text">Find Love</span>
            </h2>
            <p style={{ color: '#ABABAB', fontSize: isMobile ? 14 : 16, maxWidth: 600, margin: '0 auto' }}>
              Powerful features designed to help you make genuine connections.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: isMobile ? 12 : 24,
          }}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{ padding: isMobile ? '24px 20px' : '32px' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: 'rgba(255,55,95,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                }}>{f.icon}</div>
                <h3 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, margin: '0 0 6px' }}>{f.title}</h3>
                <p style={{ fontSize: isMobile ? 13 : 14, color: '#6B6B6B', lineHeight: '20px', margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section style={{ padding: isMobile ? '60px 16px' : '100px 24px', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <span style={{
          display: 'inline-block', padding: '6px 16px', borderRadius: 9999,
          background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)',
          fontSize: 12, fontWeight: 600, color: '#FFD700', marginBottom: 12,
          textTransform: 'uppercase', letterSpacing: 1,
        }}>Testimonials</span>
        <h2 style={{ fontSize: isMobile ? 24 : 'clamp(28px, 4vw, 40px)', fontWeight: 800, marginBottom: isMobile ? 32 : 48 }}>
          Real Stories from <span className="gradient-text">Real People</span>
        </h2>

        <div style={{ position: 'relative', minHeight: isMobile ? 320 : 280 }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              opacity: i === testimonialIdx ? 1 : 0,
              transform: `translateY(${i === testimonialIdx ? 0 : 20}px)`,
              transition: 'opacity 0.5s ease, transform 0.5s ease',
              pointerEvents: i === testimonialIdx ? 'auto' : 'none',
            }}>
              <div className="card" style={{ padding: isMobile ? '32px 20px' : '48px 32px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#FF375F" opacity="0.3"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2-2-2H4c-1.25 0-2 .75-2 2v7c0 1.25.75 2 2 2c0 1.5 0 4-1 6m12 0c3 0 7-1 7-8V5c0-1.25-.756-2-2-2h-4c-1.25 0-2 .75-2 2v7c0 1.25.75 2 2 2c0 1.5 0 4-1 6z"/></svg>
                <p style={{ fontSize: isMobile ? 15 : 18, color: '#D0D0D0', lineHeight: isMobile ? '24px' : '28px', fontStyle: 'italic', maxWidth: 600, margin: '16px auto 24px' }}>
                  {'\u201C'}{t.text}{'\u201D'}
                </p>
                <img src={t.photo} alt={t.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 700, fontSize: isMobile ? 14 : 16 }}>{t.name}</div>
                <div style={{ color: '#6B6B6B', fontSize: 13 }}>{t.location}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => setTestimonialIdx(i)} style={{
              width: i === testimonialIdx ? 24 : 8, height: 8, borderRadius: 4,
              background: i === testimonialIdx ? '#FF375F' : '#2A2A2A',
              border: 'none', cursor: 'pointer', transition: 'all 0.3s',
            }} />
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section style={{ padding: isMobile ? '60px 16px' : '100px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: isMobile ? 350 : 600, height: isMobile ? 350 : 600,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,55,95,0.08), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative' }}>
          <h2 style={{ fontSize: isMobile ? 24 : 'clamp(28px, 4vw, 44px)', fontWeight: 800, margin: '0 0 12px' }}>
            Ready to Find Your Match?
          </h2>
          <p style={{ color: '#ABABAB', fontSize: isMobile ? 14 : 18, maxWidth: 500, margin: '0 auto 32px', lineHeight: '26px', padding: isMobile ? '0 8px' : 0 }}>
            Join thousands of singles who have found meaningful connections through Odogwu. Your story starts here.
          </p>
          <Link href="/login" style={{
            padding: isMobile ? '14px 36px' : '18px 48px',
            borderRadius: 9999, fontSize: isMobile ? 15 : 18, fontWeight: 700,
            background: 'linear-gradient(135deg, #FF375F, #FF3B30)',
            color: 'white', textDecoration: 'none', display: 'inline-block',
            width: isMobile ? '100%' : 'auto',
            boxShadow: '0 0 50px rgba(255,55,95,0.3)',
          }}>
            Create Free Account
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
