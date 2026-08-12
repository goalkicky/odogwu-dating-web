'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DiamondIcon, CheckmarkCircleIcon, InfiniteIcon, StarIcon, FlashIcon, GlobeIcon, EyeIcon, ChatIcon, CoinsIcon } from '@/components/Icons';
import Button from '@/components/Button';
import GradientBackground from '@/components/GradientBackground';
import TabBar from '@/components/TabBar';
import DesktopLayout from '@/components/DesktopLayout';
import { useAuth } from '@/store/AuthContext';
import { authService, userService, walletService } from '@/lib/cloudflare/services';

const PLANS = [
  { id: 'premium', name: 'Odogwu Premium', price: 'N4,900', period: '/month', coins: 49, color: ['#FF375F', '#FF6B8A'], features: ['Send unlimited likes', 'Complete ad-free swiping experience', 'Filter your preferences', 'Unlimited rewinds to reconsider profiles', 'Voice and video calling', '2x Super Likes daily'] },
  { id: 'surplus', name: 'Odogwu Surplus', price: 'N7,900', period: '/month', coins: 79, color: ['#FFD700', '#FFA500'], features: ['Send unlimited likes', 'See who likes you', 'Change to any preferred location (Passport mode)', 'Complete ad-free swiping experience', 'Filter your preferences', 'Profile boosts for 10x visibility', 'Unlimited rewinds to reconsider profiles', 'Voice and video calling', '5x Super Likes daily'], popular: true },
  { id: 'platinum', name: 'Odogwu Platinum', price: 'N10,900', period: '/month', coins: 109, color: ['#AF52DE', '#6C63FF'], features: ['Send unlimited likes', 'See who likes you', 'Change to any preferred location (Passport mode)', 'Send unlimited messages without waiting for a mutual match', 'Complete ad-free swiping experience', 'Filter your preferences', 'Unlimited rewinds to reconsider profiles', 'Voice and video calling', '7 Super Likes daily'] },
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
  const [payMethod, setPayMethod] = useState<'card' | 'coins'>('card');
  const [subscribing, setSubscribing] = useState(false);
  const [myCoins, setMyCoins] = useState(0);

  const handleSubscribe = async () => {
    if (!profile) return;
    setSubscribing(true);
    try {
      if (payMethod === 'coins') {
        await walletService.payPremium(selectedPlan);
        await refreshUser();
        alert('Welcome to Odogwu Premium!');
        router.push('/discover');
        setSubscribing(false);
        return;
      }
      const user = await authService.getCurrentUser();
      await userService.updateProfile(user.$id, {
        isPremium: true,
        premiumPlan: selectedPlan,
      } as any);
      await refreshUser();
      alert('Welcome to Odogwu Premium!');
      router.push('/discover');
    } catch (err: any) {
      if (err?.status === 402 || String(err?.message || '').toLowerCase().includes('coin')) {
        router.push('/wallet');
      }
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
          <p style={{ fontSize: 15, color: '#ABABAB', marginTop: 8 }}>Unlock the full Odogwu Dating experience</p>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                    <CoinsIcon size={13} color="#FFD700" />
                    <span style={{ fontSize: 12.5, color: '#FFD700', fontWeight: 700 }}>{plan.coins} coins</span>
                    <span style={{ fontSize: 12, color: '#6B6B6B' }}>or pay with coins</span>
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
                  {selected && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                      <button
                        onClick={() => setPayMethod('card')}
                        style={{ flex: 1, padding: '8px 0', borderRadius: 9999, cursor: 'pointer', fontSize: 13, fontWeight: 700, background: payMethod === 'card' ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', border: payMethod === 'card' ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.08)', color: 'white' }}
                      >
                        Card
                      </button>
                      <button
                        onClick={() => { setPayMethod('coins'); walletService.getWallet().then(w => setMyCoins(w?.coins ?? 0)).catch(() => {}); }}
                        style={{ flex: 1, padding: '8px 0', borderRadius: 9999, cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: payMethod === 'coins' ? 'rgba(255,215,0,0.14)' : 'rgba(255,255,255,0.04)', border: payMethod === 'coins' ? '1px solid rgba(255,215,0,0.45)' : '1px solid rgba(255,255,255,0.08)', color: payMethod === 'coins' ? '#FFD700' : '#ABABAB' }}
                      >
                        <CoinsIcon size={14} color="#FFD700" /> Coins
                      </button>
                    </div>
                  )}
                  {selected && payMethod === 'coins' && (
                    <div style={{ marginBottom: 10, textAlign: 'center' }}>
                      <span style={{ fontSize: 12, color: myCoins >= (plan?.coins ?? 0) ? '#7CFFA0' : '#FF6B6B', fontWeight: 700 }}>
                        {myCoins >= (plan?.coins ?? 0) ? `You have ${myCoins.toLocaleString()} coins` : `You have ${myCoins.toLocaleString()} coins — need ${(plan?.coins ?? 0) - myCoins} more`}
                      </span>
                    </div>
                  )}
                  <Button
                    title={subscribing ? 'Processing...' : selected ? (payMethod === 'coins' ? 'Subscribe with Coins' : 'Subscribe Now') : `Get ${plan.name.split(' ')[1]}`}
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
