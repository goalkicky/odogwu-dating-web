'use client';
import React, { useState } from 'react';
import MarketingNav from '@/components/MarketingNav';
import MarketingFooter from '@/components/MarketingFooter';
import { CheckmarkCircleIcon, DiamondIcon } from '@/components/Icons';

const plans = [
  {
    name: 'Free', price: 0, period: 'forever', color: '#6C63FF',
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
  const [annual, setAnnual] = useState(false);

  return (
    <div style={{ background: '#0D0D0D', color: 'white' }}>
      <MarketingNav />

      <section style={{ padding: '140px 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 20px', borderRadius: 9999, background: 'rgba(255,55,95,0.1)', border: '1px solid rgba(255,55,95,0.2)', marginBottom: 24, fontSize: 13, color: '#FF375F', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            <DiamondIcon size={16} color="#FF375F" /> Pricing
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 800, margin: '0 0 16px' }}>
            Find Your Perfect <span style={{ background: 'linear-gradient(135deg, #FF375F, #6C63FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Plan</span>
          </h1>
          <p style={{ color: '#ABABAB', fontSize: 18, maxWidth: 550, margin: '0 auto' }}>
            Start for free. Upgrade when you&apos;re ready for more. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginBottom: 56 }}>
          <span style={{ fontSize: 15, color: annual ? '#6B6B6B' : 'white', fontWeight: 600 }}>Monthly</span>
          <button onClick={() => setAnnual(!annual)} style={{
            width: 52, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
            background: annual ? '#FF375F' : '#2A2A2A', position: 'relative', transition: 'background 0.3s',
          }}>
            <div style={{
              position: 'absolute', top: 3, left: annual ? 27 : 3,
              width: 22, height: 22, borderRadius: '50%', background: 'white',
              transition: 'left 0.3s',
            }} />
          </button>
          <span style={{ fontSize: 15, color: annual ? 'white' : '#6B6B6B', fontWeight: 600 }}>
            Annual <span style={{ color: '#34C759', fontSize: 12, fontWeight: 700 }}>Save 20%</span>
          </span>
        </div>

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'start' }}>
          {plans.map((plan, i) => {
            const finalPrice = annual ? Math.round(plan.price * 0.8) : plan.price;
            return (
              <div key={i} style={{
                position: 'relative', padding: '40px 32px',
                borderRadius: 24,
                background: plan.highlighted
                  ? 'linear-gradient(135deg, rgba(255,55,95,0.08), rgba(108,99,255,0.08))'
                  : 'rgba(255,255,255,0.03)',
                border: plan.highlighted
                  ? '1px solid rgba(255,55,95,0.3)'
                  : '1px solid rgba(255,255,255,0.06)',
                overflow: 'hidden',
              }}>
                {plan.badge && (
                  <div style={{
                    position: 'absolute', top: 16, right: -32,
                    background: 'linear-gradient(135deg, #FF375F, #6C63FF)',
                    color: 'white', fontSize: 12, fontWeight: 700, padding: '6px 40px',
                    transform: 'rotate(45deg)',
                  }}>
                    {plan.badge}
                  </div>
                )}

                {plan.highlighted && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #FF375F, #6C63FF)' }} />
                )}

                <div style={{ fontSize: 12, fontWeight: 700, color: plan.color, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>{plan.name}</div>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 48, fontWeight: 800 }}>${finalPrice}</span>
                  <span style={{ color: '#6B6B6B', fontSize: 15, marginLeft: 4 }}>{plan.period}</span>
                  {plan.price === 0 && <div style={{ color: '#6B6B6B', fontSize: 13, marginTop: 4 }}>No credit card required</div>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32, minHeight: plan.highlighted ? 380 : 260 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <CheckmarkCircleIcon size={18} color={plan.highlighted ? '#FF375F' : '#6C63FF'} />
                      <span style={{ fontSize: 14, color: '#D0D0D0', lineHeight: '20px' }}>{f}</span>
                    </div>
                  ))}
                </div>

                <a href="/login" style={{
                  display: 'block', textAlign: 'center', padding: '16px', borderRadius: 12,
                  fontSize: 16, fontWeight: 700, textDecoration: 'none',
                  background: plan.highlighted
                    ? 'linear-gradient(135deg, #FF375F, #6C63FF)'
                    : 'rgba(255,255,255,0.06)',
                  color: 'white',
                  border: plan.highlighted ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  boxShadow: plan.highlighted ? '0 0 30px rgba(255,55,95,0.3)' : 'none',
                }}
                  onMouseEnter={e => { if (plan.highlighted) { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 0 50px rgba(255,55,95,0.5)'; } }}
                  onMouseLeave={e => { if (plan.highlighted) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(255,55,95,0.3)'; } }}
                >
                  {plan.price === 0 ? 'Get Started Free' : `Subscribe ${annual ? 'Yearly' : 'Monthly'}`}
                </a>
              </div>
            );
          })}
        </div>

        {/* Feature comparison */}
        <div style={{ marginTop: 80, textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32 }}>Compare All <span style={{ background: 'linear-gradient(135deg, #FFD700, #FF375F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Features</span></h2>
        </div>
      </section>

      {/* FAQ teaser */}
      <section style={{ padding: '60px 24px 100px', textAlign: 'center' }}>
        <p style={{ color: '#6B6B6B', fontSize: 15, marginBottom: 16 }}>Have questions about our plans?</p>
        <a href="/faq" style={{ color: '#FF375F', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>Visit our FAQ →</a>
      </section>

      <MarketingFooter />
    </div>
  );
}
