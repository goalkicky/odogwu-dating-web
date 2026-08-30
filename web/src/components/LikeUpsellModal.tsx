'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { HeartIcon, DiamondIcon, CloseIcon, CheckmarkCircleIcon } from '@/components/Icons';

const PLANS = [
  { name: 'Premium', color: '#FF2E5F' },
  { name: 'Surplus', color: '#FFE600', popular: true },
  { name: 'Platinum', color: '#AF52DE' },
];

export default function LikeUpsellModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="animate-fade-up"
        style={{
          position: 'relative', width: '100%', maxWidth: 420,
          borderRadius: 28, overflow: 'hidden', textAlign: 'center',
          background: 'linear-gradient(165deg, #2B0F17 0%, #14121A 55%, #14121A 100%)',
          border: '1px solid rgba(255,46,95,0.4)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 60px rgba(255,46,95,0.15)',
        }}
      >
        <div style={{ position: 'absolute', top: -70, left: -50, width: 220, height: 220, borderRadius: 9999, background: 'rgba(255,46,95,0.22)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -40, width: 220, height: 220, borderRadius: 9999, background: 'rgba(255,230,0,0.14)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <button
          onClick={onClose}
          aria-label="Close"
          style={{ position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: 9999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
        >
          <CloseIcon size={15} color="white" />
        </button>

        <div style={{ position: 'relative', zIndex: 1, padding: '38px 24px 30px' }}>
          <div style={{ width: 84, height: 84, borderRadius: 26, background: 'linear-gradient(135deg, #FF2E5F, #FF4530)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 12px 40px rgba(255,46,95,0.55)', animation: 'floaty 3.5s ease-in-out infinite' }}>
            <HeartIcon size={42} color="white" />
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 900, color: 'white', margin: 0, letterSpacing: 0.3 }}>You&apos;re out of Likes</h2>
          <p style={{ fontSize: 14.5, color: '#ABABAB', lineHeight: '22px', margin: '10px auto 0', maxWidth: 320 }}>
            You&apos;ve used all 10 of today&apos;s free likes. Premium members get <b style={{ color: 'white' }}>unlimited likes</b> Ã¢â‚¬â€ never miss out on a potential match again. Ã¢ÂÂ¤Ã¯Â¸Â
          </p>

          <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
            {PLANS.map((p) => (
              <div key={p.name} style={{ flex: 1, position: 'relative', borderRadius: 14, padding: '12px 6px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${p.popular ? 'rgba(255,230,0,0.5)' : 'rgba(255,255,255,0.1)'}`, boxShadow: p.popular ? '0 6px 20px rgba(255,230,0,0.15)' : 'none' }}>
                {p.popular && (
                  <span style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #FFE600, #FFB62B)', color: '#1A1A1A', fontSize: 8, fontWeight: 900, letterSpacing: 0.6, padding: '3px 8px', borderRadius: 9999, whiteSpace: 'nowrap' }}>POPULAR</span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <HeartIcon size={12} color={p.color} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{p.name}</span>
                </div>
                <div style={{ fontSize: 11, color: '#FF7BA0', fontWeight: 700, marginTop: 3 }}>Ã¢Ë†Å¾ Likes</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/premium')}
            style={{
              width: '100%', marginTop: 22, padding: '16px 18px', borderRadius: 16, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #FF2E5F, #FF4530)',
              color: 'white', fontSize: 16, fontWeight: 800, letterSpacing: 0.3,
              boxShadow: '0 12px 34px rgba(255,46,95,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            }}
          >
            <DiamondIcon size={19} color="white" />
            Get Unlimited Likes Ã¢â‚¬â€ from N4,900/mo
          </button>

          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <CheckmarkCircleIcon size={13} color="#3DFC77" />
            <span style={{ fontSize: 11.5, color: '#6B6B6B' }}>Includes unlimited likes, boosts &amp; more Ã‚Â· Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
