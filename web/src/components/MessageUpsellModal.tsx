'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ChatIcon, DiamondIcon, CloseIcon, CheckmarkCircleIcon } from '@/components/Icons';

const PLANS = [
  { name: 'Premium', color: '#FF375F' },
  { name: 'Surplus', color: '#FFD700', popular: true },
  { name: 'Platinum', color: '#AF52DE' },
];

export default function MessageUpsellModal({ onClose }: { onClose: () => void }) {
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
          background: 'linear-gradient(165deg, #1A2B1F 0%, #14121A 55%, #14121A 100%)',
          border: '1px solid rgba(52,199,89,0.35)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 60px rgba(52,199,89,0.12)',
        }}
      >
        <div style={{ position: 'absolute', top: -70, left: -50, width: 220, height: 220, borderRadius: 9999, background: 'rgba(52,199,89,0.18)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -40, width: 220, height: 220, borderRadius: 9999, background: 'rgba(255,215,0,0.14)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <button
          onClick={onClose}
          aria-label="Close"
          style={{ position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: 9999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
        >
          <CloseIcon size={15} color="white" />
        </button>

        <div style={{ position: 'relative', zIndex: 1, padding: '38px 24px 30px' }}>
          <div style={{ width: 84, height: 84, borderRadius: 26, background: 'linear-gradient(135deg, #34C759, #00A6FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 12px 40px rgba(52,199,89,0.5)', animation: 'floaty 3.5s ease-in-out infinite' }}>
            <ChatIcon size={42} color="white" />
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 900, color: 'white', margin: 0, letterSpacing: 0.3 }}>Say Hi Before the Match</h2>
          <p style={{ fontSize: 14.5, color: '#ABABAB', lineHeight: '22px', margin: '10px auto 0', maxWidth: 320 }}>
            Don&apos;t wait for a match to break the ice. Premium members can <b style={{ color: 'white' }}>message anyone first</b> — make the first move and stand out instantly. 💬
          </p>

          <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
            {PLANS.map((p) => (
              <div key={p.name} style={{ flex: 1, position: 'relative', borderRadius: 14, padding: '12px 6px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${p.popular ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.1)'}`, boxShadow: p.popular ? '0 6px 20px rgba(255,215,0,0.15)' : 'none' }}>
                {p.popular && (
                  <span style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #FFD700, #FF9500)', color: '#1A1A1A', fontSize: 8, fontWeight: 900, letterSpacing: 0.6, padding: '3px 8px', borderRadius: 9999, whiteSpace: 'nowrap' }}>POPULAR</span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                  <ChatIcon size={12} color={p.color} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{p.name}</span>
                </div>
                <div style={{ fontSize: 11, color: '#FF6B8A', fontWeight: 700, marginTop: 3 }}>Message First</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/premium')}
            style={{
              width: '100%', marginTop: 22, padding: '16px 18px', borderRadius: 16, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #34C759, #00A6FF)',
              color: 'white', fontSize: 16, fontWeight: 800, letterSpacing: 0.3,
              boxShadow: '0 12px 34px rgba(52,199,89,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
            }}
          >
            <DiamondIcon size={19} color="white" />
            Get Premium — from N4,900/mo
          </button>

          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <CheckmarkCircleIcon size={13} color="#34C759" />
            <span style={{ fontSize: 11.5, color: '#6B6B6B' }}>Includes unlimited likes, boosts &amp; more · Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
