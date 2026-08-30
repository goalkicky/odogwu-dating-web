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

const MAX_SHOWS = 5;
const INTERVAL_MS = 30_000;
const VISIBLE_MS = 60_000;
const countKey = (userId: string) => `premium_popup_v2_count_${userId}`;

export default function PremiumPopup() {
  const router = useRouter();
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [feature, setFeature] = useState(FEATURES[0]);
  const lastIndexRef = useRef(-1);

  useEffect(() => {
    if (!profile?.id) return;
    if (profile.isPremium) return;
    if (open) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let removeListeners: (() => void) | null = null;

    const showPopup = () => {
      const key = countKey(profile.id);
      let shown = 0;
      try { shown = Number(sessionStorage.getItem(key)) || 0; } catch {}
      if (shown >= MAX_SHOWS) return;
      try { sessionStorage.setItem(key, String(shown + 1)); } catch {}
      let i;
      do { i = Math.floor(Math.random() * FEATURES.length); } while (i === lastIndexRef.current && FEATURES.length > 1);
      lastIndexRef.current = i;
      setFeature(FEATURES[i]);
      setOpen(true);
    };

    const teardown = () => {
      if (timer) clearTimeout(timer);
      timer = undefined;
      removeListeners?.();
      removeListeners = null;
    };

    const armTimer = () => {
      if (document.hasFocus() && !document.hidden) {
        timer = setTimeout(showPopup, INTERVAL_MS);
      } else {
        const onActive = () => { teardown(); armTimer(); };
        window.addEventListener('focus', onActive);
        document.addEventListener('visibilitychange', onActive);
        removeListeners = () => {
          window.removeEventListener('focus', onActive);
          document.removeEventListener('visibilitychange', onActive);
        };
      }
    };

    armTimer();
    return teardown;
  }, [profile?.id, profile?.isPremium, open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setOpen(false), VISIBLE_MS);
    return () => clearTimeout(t);
  }, [open]);

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
          border: '1px solid rgba(255,230,0,0.25)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.65), 0 0 60px rgba(255,46,95,0.22)',
        }}
      >
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: 9999, border: 'none', background: 'rgba(255,255,255,0.07)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <CloseIcon size={14} color="white" />
        </button>

        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #FFE600, #FF2E5F)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 0 34px rgba(255,46,95,0.5)' }}>
          <DiamondIcon size={30} color="white" />
        </div>

        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#FFE600', textTransform: 'uppercase' }}>
          Premium Perk
        </span>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: '10px 0 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <FeatureIcon size={20} color="#FF7BA0" />
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
