'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DiamondIcon, InfiniteIcon, StarIcon, FlashIcon, GlobeIcon, EyeIcon, ChatIcon, CloseIcon } from '@/components/Icons';
import Button from '@/components/Button';
import { useAuth } from '@/store/AuthContext';

const FEATURES = [
  { icon: InfiniteIcon, title: 'Unlimited Likes', desc: 'Like every profile that catches your eye — no limits, no pause.' },
  { icon: StarIcon, title: 'Super Likes', desc: 'Stand out instantly and boost your chances of a match.' },
  { icon: FlashIcon, title: 'Profile Boosts', desc: 'Put your profile in front of 10x more people.' },
  { icon: GlobeIcon, title: 'Passport Mode', desc: 'Change your location and match anywhere in the world.' },
  { icon: EyeIcon, title: 'See Who Likes You', desc: 'Never wonder again — see who already liked you.' },
  { icon: ChatIcon, title: 'Priority Chat', desc: 'Message before you match and skip the wait.' },
];

export default function PremiumPopup() {
  const router = useRouter();
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [feature, setFeature] = useState(FEATURES[0]);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    if (!profile?.id) return;
    if (profile.isPremium) return;
    const key = `premium_popup_shown_${profile.id}`;
    try {
      if (sessionStorage.getItem(key) === '1') return;
    } catch {}
    try { sessionStorage.setItem(key, '1'); } catch {}
    setFeature(FEATURES[Math.floor(Math.random() * FEATURES.length)]);
    const t = setTimeout(() => setOpen(true), 900);
    return () => clearTimeout(t);
  }, [profile?.id, profile?.isPremium]);

  if (!open) return null;

  const FeatureIcon = feature.icon;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', padding: 24 }}
      onClick={() => setOpen(false)}
    >
      <div
        className="animate-pop"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative', width: '100%', maxWidth: 360, padding: 28, borderRadius: 26, textAlign: 'center',
          background: 'linear-gradient(165deg, #1A1A22, #0D0D0D)',
          border: '1px solid rgba(255,215,0,0.25)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.65), 0 0 60px rgba(255,55,95,0.22)',
        }}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: 9999, border: 'none', background: 'rgba(255,255,255,0.07)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <CloseIcon size={14} color="white" />
        </button>

        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #FFD700, #FF375F)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 0 34px rgba(255,55,95,0.5)' }}>
          <DiamondIcon size={30} color="white" />
        </div>

        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#FFD700', textTransform: 'uppercase' }}>
          Premium Perk
        </span>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: '10px 0 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <FeatureIcon size={20} color="#FF6B8A" />
          {feature.title}
        </h2>
        <p style={{ fontSize: 14, color: '#ABABAB', lineHeight: '20px', margin: '0 0 22px' }}>{feature.desc}</p>

        <Button title="Go Premium" variant="gradient" size="md" style={{ width: '100%' }} onPress={() => router.push('/premium')} />
        <button
          onClick={() => setOpen(false)}
          style={{ marginTop: 14, background: 'none', border: 'none', color: '#6B6B6B', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
