'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DiamondIcon, CheckmarkCircleIcon, InfiniteIcon, StarIcon, FlashIcon, GlobeIcon, EyeIcon, ChatIcon } from '@/components/Icons';
import Button from '@/components/Button';
import GradientBackground from '@/components/GradientBackground';
import TabBar from '@/components/TabBar';
import DesktopLayout from '@/components/DesktopLayout';
import { useAuth } from '@/store/AuthContext';
import { authService, userService } from '@/lib/appwrite/services';

const PLANS = [
  { id: 'plus', name: 'Odogwu Plus', price: '$9.99', period: '/month', color: ['#FF375F', '#FF6B8A'], features: ['Unlimited Likes', '5 Super Likes per day', '1 Boost per month', 'Passport (any location)', 'Hide Ads'] },
  { id: 'gold', name: 'Odogwu Gold', price: '$19.99', period: '/month', color: ['#FFD700', '#FFA500'], features: ['All Plus features', '10 Super Likes per day', '3 Boosts per month', 'See who likes you', 'Top Picks daily', 'Message before matching'], popular: true },
  { id: 'platinum', name: 'Odogwu Platinum', price: '$29.99', period: '/month', color: ['#FF375F', '#FF3B30'], features: ['All Gold features', 'Unlimited Super Likes', 'Unlimited Boosts', 'Priority likes', 'Verified badge', 'Read receipts', 'Premium support'] },
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
  const [selectedPlan, setSelectedPlan] = useState('gold');
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
      <GradientBackground style={{ minHeight: '100vh', padding: '24px 16px 85px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '85px', overflowY: 'auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #0D0D0D, #1A0000, #0D0D0D)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 24px 28px' }}>
          <div style={{ width: 72, height: 72, borderRadius: 24, background: 'linear-gradient(135deg, #FFD700, #FF375F)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, boxShadow: '0 0 20px rgba(255,55,95,0.5)' }}>
            <DiamondIcon size={32} color="white" />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: 'white', letterSpacing: 1, margin: 0 }}>Go Premium</h1>
          <p style={{ fontSize: 16, color: '#ABABAB', marginTop: 8 }}>Unlock the full Odogwu experience</p>
        </div>

        <div style={{ padding: '0 0 16px' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ width: 170, padding: 16, borderRadius: 16, border: '1px solid #2A2A2A', background: 'linear-gradient(135deg, #1A1A1A, #242424)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #FF375F, #FF3B30)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {f.icon}
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{f.title}</span>
                <span style={{ fontSize: 12, color: '#6B6B6B', lineHeight: '16px' }}>{f.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '24px 0 0' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 20, textAlign: 'center' }}>Choose your plan</h2>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
          {PLANS.map((plan) => {
            const selected = selectedPlan === plan.id;
            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                style={{
                  flex: '1 1 280px', maxWidth: 340,
                  backgroundColor: '#1A1A1A',
                  borderRadius: 24,
                  border: selected ? '2px solid #FF375F' : '1px solid #2A2A2A',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0,
                }}
              >
                {(plan as any).popular && (
                  <div style={{ padding: '6px 0', background: 'linear-gradient(135deg, #FFD700, #FFA500)', textAlign: 'center' }}>
                    <span style={{ color: 'white', fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>MOST POPULAR</span>
                  </div>
                )}
                <div style={{ padding: 20, background: selected ? 'linear-gradient(135deg, ' + plan.color.join(', ') + ')' : 'none' }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: selected ? 'white' : 'white', margin: 0 }}>{plan.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: selected ? 'white' : 'white' }}>{plan.price}</span>
                    <span style={{ fontSize: 14, color: selected ? 'rgba(255,255,255,0.7)' : '#6B6B6B' }}>{plan.period}</span>
                  </div>
                </div>
                <div style={{ padding: '0 20px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {plan.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CheckmarkCircleIcon size={18} color={selected ? '#FF375F' : '#6B6B6B'} />
                      <span style={{ fontSize: 14, color: selected ? '#ABABAB' : '#ABABAB' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{ margin: 16 }}>
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

      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: '#6B6B6B', fontSize: 12, textAlign: 'center', lineHeight: '18px' }}>
          Subscription automatically renews. Cancel anytime.{'\n'}
          Terms of Service • Privacy Policy
        </p>
      </div>

      <TabBar />
      </div>
    </GradientBackground>
    </DesktopLayout>
  );
}
