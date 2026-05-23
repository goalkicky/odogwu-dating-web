'use client';
import React, { useState } from 'react';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';
import { useMobile } from '@/lib/useMediaQuery';
import { CheckmarkCircleIcon, DiamondIcon } from '@/components/Icons';

const ACCENT = '#FF3B30';

const plans = [
  {
    name: 'Free', price: 0, period: 'forever', color: ACCENT,
    features: [
      'Create your profile with 6 photos',
      'Basic matching suggestions',
      'Send up to 10 likes per day',
      'Limited chat with matches',
      'View profiles in your area',
    ],
    highlighted: false,
  },
  {
    name: 'Premium', price: 9.99, period: 'per month', color: '#FF375F',
    features: [
      'Unlimited likes & rewinds',
      'See who liked you',
      'Advanced AI matching',
      'Unlimited messaging & voice notes',
      '5 Super Likes per week',
      'Passport to any location',
      'One profile boost per month',
      'Read receipts',
    ],
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Platinum', price: 19.99, period: 'per month', color: '#FFD700',
    features: [
      'Everything in Premium',
      'Unlimited Super Likes',
      'Priority profile visibility',
      'Weekly profile boosts',
      'Advanced filters & preferences',
      'Incognito mode',
      'See who\'s online now',
      'Message before matching',
      'Premium support 24/7',
    ],
    highlighted: false,
  },
];

export default function PlansPage() {
  const isMobile = useMobile();
  const [annual, setAnnual] = useState(false);

  return (
    <div style={{ background: '#0D0D0D', color: 'white' }}>
      <MarketingNav />

      <section style={{ padding: isMobile ? '100px 16px 60px' : '140px 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 48 }}>
          <div className="badge" style={{ background: 'rgba(255,55,95,0.1)', border: '1px solid rgba(255,55,95,0.2)', color: '#FF375F', marginBottom: 20, display: 'inline-flex' }}>
            <DiamondIcon size={16} color="#FF375F" /> Pricing
          </div>
          <h1 style={{ fontSize: isMobile ? 28 : 'clamp(36px, 5vw, 52px)', fontWeight: 800, margin: '0 0 12px' }}>
            Find Your Perfect <span className="gradient-text">Plan</span>
          </h1>
          <p style={{ color: '#ABABAB', fontSize: isMobile ? 14 : 18, maxWidth: 550, margin: '0 auto', padding: isMobile ? '0 8px' : 0 }}>
            Start for free. Upgrade when you&apos;re ready for more. No hidden fees, cancel anytime.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: isMobile ? 36 : 56 }}>
          <span style={{ fontSize: 14, color: annual ? '#6B6B6B' : 'white', fontWeight: 600 }}>Monthly</span>
          <button onClick={() => setAnnual(!annual)} style={{ width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', background: annual ? '#FF375F' : '#2A2A2A', position: 'relative', transition: 'background 0.3s' }}>
            <div style={{ position: 'absolute', top: 2, left: annual ? 25 : 2, width: 22, height: 22, borderRadius: '50%', background: 'white', transition: 'left 0.3s' }} />
          </button>
          <span style={{ fontSize: 14, color: annual ? 'white' : '#6B6B6B', fontWeight: 600 }}>
            Annual <span style={{ color: '#34C759', fontSize: 11, fontWeight: 700 }}>Save 20%</span>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: isMobile ? 16 : 24, alignItems: 'start' }}>
          {plans.map((plan, i) => {
            const finalPrice = annual ? Math.round(plan.price * 0.8) : plan.price;
            return (
              <div key={i} style={{
                position: 'relative', padding: isMobile ? '28px 24px' : '40px 32px',
                borderRadius: 20,
                background: plan.highlighted
                  ? 'linear-gradient(135deg, rgba(255,55,95,0.08), rgba(255,59,48,0.08))'
                  : 'rgba(255,255,255,0.03)',
                border: plan.highlighted
                  ? '1px solid rgba(255,55,95,0.3)'
                  : '1px solid rgba(255,255,255,0.06)',
                overflow: 'hidden',
              }}>
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: 16, right: -32,
                    background: 'linear-gradient(135deg, #FF375F, #FF3B30)',
                    color: 'white', fontSize: 11, fontWeight: 700, padding: '5px 40px',
                    transform: 'rotate(45deg)',
                  }}>
                    {plan.badge}
                  </div>
                )}

                {plan.highlighted && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #FF375F, #FF3B30)' }} />
                )}

                <div style={{ fontSize: 11, fontWeight: 700, color: plan.color, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>{plan.name}</div>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: isMobile ? 40 : 48, fontWeight: 800 }}>${finalPrice}</span>
                  <span style={{ color: '#6B6B6B', fontSize: 14, marginLeft: 4 }}>{plan.period}</span>
                  {plan.price === 0 && <div style={{ color: '#6B6B6B', fontSize: 12, marginTop: 2 }}>No credit card required</div>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <CheckmarkCircleIcon size={16} color={plan.highlighted ? '#FF375F' : ACCENT} />
                      <span style={{ fontSize: isMobile ? 13 : 14, color: '#D0D0D0', lineHeight: '18px' }}>{f}</span>
                    </div>
                  ))}
                </div>

                <a href="/login" style={{
                  display: 'block', textAlign: 'center', padding: isMobile ? '14px' : '16px', borderRadius: 12,
                  fontSize: isMobile ? 14 : 16, fontWeight: 700, textDecoration: 'none',
                  background: plan.highlighted
                    ? 'linear-gradient(135deg, #FF375F, #FF3B30)'
                    : 'rgba(255,255,255,0.06)',
                  color: 'white',
                  border: plan.highlighted ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: plan.highlighted ? '0 0 30px rgba(255,55,95,0.3)' : 'none',
                }}>
                  {plan.price === 0 ? 'Get Started Free' : `Subscribe ${annual ? 'Yearly' : 'Monthly'}`}
                </a>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ padding: isMobile ? '40px 16px 60px' : '60px 24px 100px', textAlign: 'center' }}>
        <p style={{ color: '#6B6B6B', fontSize: isMobile ? 14 : 15, marginBottom: 12 }}>Have questions about our plans?</p>
        <a href="/faq" style={{ color: '#FF375F', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Visit our FAQ →</a>
      </section>

      <MarketingFooter />
    </div>
  );
}
