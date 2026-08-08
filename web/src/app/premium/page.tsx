'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DiamondIcon, CheckmarkCircleIcon, InfiniteIcon, StarIcon, FlashIcon, GlobeIcon, EyeIcon, ChatIcon } from '@/components/Icons';
import Button from '@/components/Button';
import GradientBackground from '@/components/GradientBackground';
import TabBar from '@/components/TabBar';
import DesktopLayout from '@/components/DesktopLayout';
import { useAuth } from '@/store/AuthContext';
import { authService, userService } from '@/lib/cloudflare/services';

const PLANS = [
  { id: 'premium', name: 'Odogwu Premium', price: 'N4,900', period: '/month', color: ['#FF375F', '#FF6B8A'], features: ['Send unlimited likes', 'Complete ad-free swiping experience', 'Filter your preferences', 'Unlimited rewinds to reconsider profiles', 'Voice and video calling', '2x Super Likes daily'] },
  { id: 'surplus', name: 'Odogwu Surplus', price: 'N7,900', period: '/month', color: ['#FFD700', '#FFA500'], features: ['Send unlimited likes', 'See who likes you', 'Change to any preferred location (Passport mode)', 'Complete ad-free swiping experience', 'Filter your preferences', 'Profile boosts for 10x visibility', 'Unlimited rewinds to reconsider profiles', 'Voice and video calling', '5x Super Likes daily'], popular: true },
  { id: 'platinum', name: 'Odogwu Platinum', price: 'N10,900', period: '/month', color: ['#AF52DE', '#6C63FF'], features: ['Send unlimited likes', 'See who likes you', 'Change to any preferred location (Passport mode)', 'Send unlimited messages without waiting for a mutual match', 'Complete ad-free swiping experience', 'Filter your preferences', 'Unlimited rewinds to reconsider profiles', 'Voice and video calling', '7 Super Likes daily'] },
];

const FEATURES = [
  { icon: <InfiniteIcon size={22} color="white" />, title: 'Unlimited Likes', desc: 'Like as many profiles as you want' },
  { icon: <StarIcon size={22} color="white" />, title: 'Super Likes', desc: 'Stand out with Super Likes' },
  { icon: <FlashIcon size={22} color="white" />, title: 'Boosts', desc: 'Get 10x more profile views' },
  { icon: <GlobeIcon size={22} color="white" />, title: 'Passport', desc: 'Match with people anywhere' },
  { icon: <EyeIcon size={22} color="white" />, title: 'See Likes', desc: 'See who liked you first' },
  { icon: <ChatIcon size={22} color="white" />, title: 'Priority Chat', desc: 'Message before matching' },
];

export default function PremiumPage() {
  const router = useRouter();
  const { profile, refreshUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('surplus');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async () => {
    if (!profile) return;
    setSubscribing(true);
    try {
      const user = await authService.getCurrentUser();
      await userService.updateProfile(user.$id, {
        isPremium: true,
        premiumPlan: selectedPlan,
      } as any);
      await refreshUser();
      alert('Welcome to Odogwu Premium!');
      router.push('/discover');
    } catch (err: any) {
      alert(err?.message || 'Subscription failed. Please try again.');
    }
    setSubscribing(false);
  };

  return (
    <DesktopLayout>
      <GradientBackground style={{ minHeight: '100vh', padding: '24px 16px 110px' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="animate-fade-up">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 24px 26px' }}>
          <div style={{ width: 74, height: 74, borderRadius: 22, background: 'linear-gradient(135deg, #FFD700, #FF375F)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 0 44px rgba(255,55,95,0.5)', animation: 'floaty 4s ease-in-out infinite' }}>
            <DiamondIcon size={34} color="white" />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: 'white', letterSpacing: 1, margin: 0 }}>
            Go <span className="neon-text">Premium</span>
          </h1>
          <p style={{ fontSize: 15, color: '#ABABAB', marginTop: 8 }}>Unlock the full Odogwu experience</p>
        </div>

        <div style={{ padding: '0 0 20px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="glass lift" style={{ width: 168, padding: 16, borderRadius: 18, display: 'flex', flexDirection: 'column', gap: 10, animation: `fadeUp 0.5s ease both`, animationDelay: `${i * 0.05}s` }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: 'linear-gradient(135deg, #FF375F, #FF3B30)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(255,55,95,0.35)' }}>
                  {f.icon}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{f.title}</span>
                <span style={{ fontSize: 12, color: '#6B6B6B', lineHeight: '16px' }}>{f.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="animate-fade-up" style={{ padding: '10px 0 0' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 20, textAlign: 'center' }}>
          Choose your plan
        </h2>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'stretch' }}>
          {PLANS.map((plan, idx) => {
            const selected = selectedPlan === plan.id;
            const popular = (plan as any).popular;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className="lift"
                style={{
                  flex: '1 1 280px', maxWidth: 340,
                  borderRadius: 26,
                  border: popular
                    ? '2px solid transparent'
                    : selected ? `2px solid ${plan.color[0]}` : '1px solid rgba(255,255,255,0.1)',
                  background: selected
                    ? `linear-gradient(135deg, ${plan.color[0]}22, ${plan.color[1]}11), rgba(20,20,26,0.9)`
                    : 'rgba(20,20,26,0.7)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0,
                  position: 'relative',
                  boxShadow: selected
                    ? `0 16px 48px rgba(0,0,0,0.5), 0 0 36px ${plan.color[0]}33`
                    : '0 12px 36px rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(16px)',
                  animation: `fadeUp 0.5s ease both`,
                  animationDelay: `${0.1 + idx * 0.08}s`,
                }}
              >
                {popular && (
                  <div style={{ position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
                    <div style={{ position: 'absolute', top: 16, right: -34, background: 'linear-gradient(135deg, #FFD700, #FF9500)', color: '#1A1A1A', fontSize: 11, fontWeight: 800, letterSpacing: 1, padding: '6px 42px', transform: 'rotate(45deg)', boxShadow: '0 4px 14px rgba(255,215,0,0.4)' }}>
                      MOST POPULAR
                    </div>
                  </div>
                )}
                {popular && (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #FF375F, #FFD700, #7C4DFF)', zIndex: 2 }} />
                )}
                <div style={{ padding: '26px 24px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: plan.color[0], textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
                    {plan.name.replace('Odogwu ', '')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 32, fontWeight: 800, color: 'white', letterSpacing: 0.5 }}>{plan.price}</span>
                    <span style={{ fontSize: 14, color: '#6B6B6B' }}>{plan.period}</span>
                  </div>
                </div>
                <div style={{ padding: '18px 24px 8px', display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <CheckmarkCircleIcon size={17} color={plan.color[0]} />
                      <span style={{ fontSize: 13.5, color: selected ? '#E0E0E0' : '#ABABAB', lineHeight: '18px' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{ margin: 18 }}>
                  <Button
                    title={subscribing ? 'Processing...' : selected ? 'Subscribe Now' : `Get ${plan.name.split(' ')[1]}`}
                    onPress={selected ? handleSubscribe : () => setSelectedPlan(plan.id)}
                    variant={selected ? 'gradient' : 'outline'}
                    size="md"
                    style={{ width: '100%' }}
                    loading={subscribing && selected}
                    disabled={subscribing}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="animate-fade-up" style={{ padding: 36, textAlign: 'center' }}>
        <div className="glass" style={{ display: 'inline-block', padding: '14px 28px', borderRadius: 9999 }}>
          <p style={{ color: '#6B6B6B', fontSize: 12, lineHeight: '18px', margin: 0 }}>
            Subscription automatically renews. Cancel anytime.{'\n'}
            <span style={{ color: '#ABABAB' }}>Terms of Service • Privacy Policy</span>
          </p>
        </div>
      </div>

      <TabBar />
      </div>
    </GradientBackground>
    </DesktopLayout>
  );
}
