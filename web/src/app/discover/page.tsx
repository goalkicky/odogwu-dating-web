'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FilterIcon } from '@/components/Icons';
import AnimatedCard from '@/components/AnimatedCard';
import AppShell from '@/components/AppShell';
import SuperlikeUpsellModal from '@/components/SuperlikeUpsellModal';
import LikeUpsellModal from '@/components/LikeUpsellModal';
import MessageUpsellModal from '@/components/MessageUpsellModal';
import { useMobile, useMediaQuery } from '@/lib/useMediaQuery';
import { useAuth } from '@/store/AuthContext';
import { userService, storageService, superlikeService, likeService, matchService } from '@/lib/cloudflare/services';
import { account } from '@/lib/cloudflare/config';
import { DISCOVER_FILTER_TEMPLATE_CSS } from '@/lib/discoverFilterTemplateStyles';

export default function DiscoverPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const isMobile = useMobile();
  const isTiny = useMediaQuery('(max-width: 390px)');
  const [users, setUsers] = useState<any[]>([]);

  const [lastAction, setLastAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [superlikes, setSuperlikes] = useState<any>({ remaining: 0, dailyLimit: 0, refillsAt: '', isPremium: false });
  const [showSuperlikeUpsell, setShowSuperlikeUpsell] = useState(false);
  const [likes, setLikes] = useState<any>({ remaining: 0, used: 0, dailyLimit: 0, refillsAt: '', isPremium: false });
  const [showLikeUpsell, setShowLikeUpsell] = useState(false);
  const [showMessageUpsell, setShowMessageUpsell] = useState(false);

  const baseGender = (profile?.interestedIn as string) || 'both';
  const defaultPrefs = { gender: baseGender, minAge: 18, maxAge: 60, maxDistance: 0, minHeight: 0, maxHeight: 0, minWeight: 0, maxWeight: 0, city: '', relationshipGoals: '' };
  const [prefs, setPrefs] = useState(defaultPrefs);

  const loadUsers = useCallback(async () => {
    if (!profile || !account) return;
    setLoading(true);
    try {
      const [docs, likedIds] = await Promise.all([
        userService.getDiscoverUsers((profile as any).$id, prefs),
        userService.getLikedUserIds((profile as any).$id).catch(() => [] as string[]),
      ]);
      const likedSet = new Set(likedIds);
      const filtered = docs.filter((d: any) => !likedSet.has(d.$id));
      const mapped = filtered.map((d: any) => ({
        id: d.$id,
        photos: (d.photos || []).map((fid: string) => storageService.getFilePreview(fid)),
        fullName: d.fullName || '',
        age: d.age || 0,
        bio: d.bio || '',
        city: d.city || '',
        distanceKm: d.distanceKm,
        gender: d.gender || '',
        interests: d.interests || [],
        verified: !!d.verified,
      })).filter((u: any) => u.photos.length > 0);
      setUsers(mapped);
    } catch {}
    setLoading(false);
  }, [profile, prefs]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  useEffect(() => {
    superlikeService.getStatus().then(setSuperlikes).catch(() => {});
    likeService.getStatus().then(setLikes).catch(() => {});
  }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('locpicked') !== '1') return;
    try {
      const raw = localStorage.getItem('dogwu_location');
      if (raw) {
        const loc = JSON.parse(raw);
        if (loc && loc.city) setPrefs(p => ({ ...p, city: loc.city }));
      }
    } catch {}
    setShowFilters(true);
  }, []);

  const nextUser = useCallback(() => {
    setUsers(prev => {
      const next = prev.slice(1);
      if (next.length === 0) loadUsers();
      return next;
    });
  }, [loadUsers]);

  const handleSwipeLeft = useCallback(async () => {
    setLastAction('dislike');
    const rejected = users[0];
    if (rejected && account) {
      try { await userService.likeExists((profile as any).$id, rejected.id); } catch {}
    }
    setTimeout(() => { setLastAction(null); nextUser(); }, 300);
  }, [users, profile, nextUser]);

  const handleSwipeRight = useCallback(async () => {
    const liked = users[0];
    setLastAction('like');
    if (!likes.isPremium && (likes.remaining ?? 0) <= 0) {
      setShowLikeUpsell(true);
      setTimeout(() => { setLastAction(null); nextUser(); }, 300);
      return;
    }
    if (liked && account) {
      try {
        const res = await userService.likeUser((profile as any).$id, liked.id);
        if (res && typeof res.remaining === 'number') setLikes(res);
        if (res?.mutual) {
          setLastAction(null);
          if (res.match?.$id) router.push(`/match/${res.match.$id}`);
          return;
        }
      } catch (e: any) {
        if (e?.status === 402 || e?.code === 'NO_LIKES' || String(e?.message || '').includes('like')) {
          setShowLikeUpsell(true);
        }
      }
    }
    setTimeout(() => { setLastAction(null); nextUser(); }, 300);
  }, [users, profile, likes, nextUser, router]);

  const handleSuperLike = useCallback(async () => {
    const liked = users[0];
    if (!superlikes || superlikes.remaining <= 0) {
      setShowSuperlikeUpsell(true);
      return;
    }
    setLastAction('superlike');
    if (liked) {
      try {
        const res = await superlikeService.send(liked.id);
        setSuperlikes(res);
        if (res.mutual) {
          setLastAction(null);
          if (res.match?.$id) router.push(`/match/${res.match.$id}`);
          return;
        }
      } catch (e: any) {
        if (e?.status === 402 || e?.code === 'NO_SUPERLIKES' || String(e?.message || '').includes('super like')) {
          setShowSuperlikeUpsell(true);
        }
      }
    }
    setTimeout(() => { setLastAction(null); nextUser(); }, 300);
  }, [users, superlikes, nextUser, router]);

  const handleMessage = useCallback(async () => {
    const target = users[0];
    if (!target || !account) return;
    if (!profile?.isPremium) {
      setShowMessageUpsell(true);
      return;
    }
    setLastAction('message');
    try {
      const match = await matchService.createMatch((profile as any).$id, target.id);
      if (match?.id) {
        router.push(`/chat/${match.id}`);
      } else {
        setShowMessageUpsell(true);
      }
    } catch (e: any) {
      if (e?.status === 402 || e?.code === 'PREMIUM_REQUIRED' || String(e?.message || '').includes('premium')) {
        setShowMessageUpsell(true);
      }
      setLastAction(null);
    }
  }, [users, profile, router]);

  if (loading) {
    return (
      <AppShell>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', gap: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 18, border: '3px solid rgba(255,46,95,0.2)', borderTopColor: '#FF2E5F', animation: 'spin 0.8s linear infinite' }} />
          <span className="neon-text" style={{ fontSize: 16, fontWeight: 700 }}>Loading profiles...</span>
        </div>
      </AppShell>
    );
  }

  if (users.length === 0) {
    return (
      <AppShell>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', gap: 16 }}>
          <div style={{ width: 96, height: 96, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid #EDEDF1', boxShadow: '0 1px 4px rgba(20,20,25,0.03)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#FF7BA0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"/>
            </svg>
          </div>
          <span className="animate-pop" style={{ fontSize: 22, fontWeight: 800, color: '#111111' }}>No more profiles</span>
          <span style={{ fontSize: 14, color: '#5D616A', textAlign: 'center', maxWidth: 260 }}>
            You&apos;ve seen everyone nearby. Check back later for fresh faces.
          </span>
          <button onClick={loadUsers} style={{ padding: '12px 28px', borderRadius: 9999, border: 'none', background: '#E50046', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 24px rgba(229,0,70,0.4)' }}>Refresh</button>
        </div>
      </AppShell>
    );
  }

  const current = users[0];

  const actionSize = isTiny ? 58 : isMobile ? 64 : 110;
  const actionGap = isTiny ? 14 : isMobile ? 20 : 74;
  const actionFont = isTiny ? 36 : isMobile ? 40 : 57;
  const likeFont = isTiny ? 28 : isMobile ? 34 : 47;
  const actionSmall = isTiny ? 11 : isMobile ? 12 : 18;

  const discoverHeader = (
    <header className="uv-topbar" style={{ padding: '0 0 8px' }}>
      <img className="uv-brand-logo" src="/o-logo.png" alt="Odogwu" style={{ justifySelf: 'start', height: 44, filter: 'brightness(0.9)' }} width={44} height={44} decoding="async" />
      <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111111', margin: 0, letterSpacing: -0.3, textAlign: 'center', lineHeight: 24 }}>Discover</h1>
      <button
        onClick={() => setShowFilters(true)}
        aria-label="Filter preferences"
        style={{
          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', border: 0, cursor: 'pointer', color: '#5D616A', justifySelf: 'end',
        }}
      >
        <FilterIcon size={20} color="#5D616A" />
      </button>
    </header>
  );

  return (
    <AppShell header={discoverHeader}>
      <div className="animate-fade-up" style={isMobile ? { paddingTop: 2, height: 'calc(100dvh - 108px)', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' } : { paddingTop: 22 }}>
        <div style={{ maxWidth: 760, margin: '0 auto', width: '100%', flex: '1 1 0%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: '1 1 0%', minHeight: 0, display: 'flex' }}>
            <AnimatedCard
              key={current.id}
              user={current}
              isFirst
              width="100%"
              height={isMobile ? '100%' : 'auto'}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onSuperLike={handleSuperLike}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: actionGap, padding: isMobile ? '10px 0 4px' : '38px 0 25px' }}>
            <button onClick={handleSwipeLeft} className="lift" aria-label="Pass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 0, cursor: 'pointer', color: '#5D616A' }}>
              <span style={{ width: actionSize, height: actionSize, border: '1px solid #EBEBEE', borderRadius: '50%', display: 'grid', placeItems: 'center', boxShadow: '0 3px 10px rgba(0,0,0,0.04)', background: '#fff', fontSize: actionFont, fontWeight: 300, color: '#111111' }}>×</span>
              <small style={{ fontSize: actionSmall, color: '#5D616A', fontWeight: 600 }}>Pass</small>
            </button>

            <button onClick={handleSwipeRight} className="lift" aria-label="Like" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 0, cursor: 'pointer', color: '#5D616A' }}>
              <span style={{ width: actionSize, height: actionSize, borderRadius: '50%', display: 'grid', placeItems: 'center', boxShadow: '0 6px 18px rgba(229,0,70,0.32)', background: '#E50046', color: '#fff', fontSize: likeFont, fontWeight: 300, paddingBottom: isMobile ? 4 : 6 }}>♥</span>
              <small style={{ fontSize: actionSmall, color: '#5D616A', fontWeight: 600 }}>Like</small>
            </button>

            <button onClick={handleSuperLike} className="lift" aria-label="Super Like" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 0, cursor: 'pointer', color: '#5D616A' }}>
              <span style={{ width: actionSize, height: actionSize, borderRadius: '50%', display: 'grid', placeItems: 'center', boxShadow: '0 6px 18px rgba(63,161,255,0.35)', background: '#3fa1ff', color: '#fff' }}>
                <svg viewBox="0 0 24 24" style={{ width: Math.round(actionSize * 0.44), height: Math.round(actionSize * 0.44), fill: '#fff' }}>
                  <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8-6.1-3.4-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
                </svg>
              </span>
              <small style={{ fontSize: actionSmall, color: '#5D616A', fontWeight: 600 }}>Super Like</small>
            </button>

            <button onClick={handleMessage} className="lift" aria-label="Message" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 0, cursor: 'pointer', color: '#5D616A' }}>
              <span style={{ width: actionSize, height: actionSize, border: '1px solid #EBEBEE', borderRadius: '50%', display: 'grid', placeItems: 'center', boxShadow: '0 3px 10px rgba(0,0,0,0.04)', background: '#fff', color: '#111111' }}>
                <svg viewBox="0 0 48 48" style={{ width: Math.round(actionSize * 0.64), height: Math.round(actionSize * 0.64), fill: '#111111', stroke: '#fff', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                  <path d="M6 21a14 14 0 1 1 6 11.6L4 36l2.2-8.2A13.9 13.9 0 0 1 6 21Z" />
                </svg>
              </span>
              <small style={{ fontSize: actionSmall, color: '#5D616A', fontWeight: 600 }}>Message</small>
            </button>
          </div>

          {lastAction && lastAction !== 'match' && (
            <div className="animate-pop" style={{ display: 'flex', justifyContent: 'center', paddingBottom: 14, animation: 'fadeUp 0.3s ease' }}>
              <div style={{ padding: '8px 20px', borderRadius: 9999, whiteSpace: 'nowrap', background: '#fff', border: '1px solid #EDEDF1', boxShadow: '0 1px 4px rgba(20,20,25,0.03)' }}>
                <span style={{ color: '#151515', fontWeight: 700, fontSize: 14 }}>
                  {lastAction === 'like' ? 'Liked!' : lastAction === 'dislike' ? 'Nope' : `Super Liked ${current.fullName.split(' ')[0] || 'them'}! 💙`}
                </span>
              </div>
            </div>
          )}
        </div>

        {showFilters && (
          <FilterPanel
            prefs={prefs}
            defaults={defaultPrefs}
            onChange={setPrefs}
            onApply={() => setShowFilters(false)}
            onClose={() => setShowFilters(false)}
          />
        )}

        {showSuperlikeUpsell && (
          <SuperlikeUpsellModal onClose={() => setShowSuperlikeUpsell(false)} />
        )}

        {showLikeUpsell && (
          <LikeUpsellModal onClose={() => setShowLikeUpsell(false)} />
        )}

        {showMessageUpsell && (
          <MessageUpsellModal onClose={() => setShowMessageUpsell(false)} />
        )}
      </div>
    </AppShell>
  );
}

const GENDER_OPTIONS = [
  { label: 'Men', value: 'male' },
  { label: 'Women', value: 'female' },
  { label: 'Everyone', value: 'both' },
];
const AGE_MIN = 18;
const AGE_MAX = 99;
const DISTANCE_STEPS = [10, 25, 50, 100] as const;

const GOAL_OPTIONS = [
  { label: 'Serious Relationship', value: 'Long-term relationship' },
  { label: 'Flirting', value: 'Short-term relationship' },
  { label: 'Dating', value: 'Still figuring it out' },
  { label: 'Friendship', value: 'Friendship' },
];

const SWITCH_ITEMS = [
  { key: 'verified' as const, icon: '✣', cls: 'blue', label: 'Verified profiles only' },
  { key: 'photos' as const, icon: '▣', cls: 'red', label: 'Profiles with photos' },
  { key: 'active' as const, icon: 'ϟ', cls: 'green', label: 'Recently active' },
];

function storedGoal(v: string): string {
  if (v && GOAL_OPTIONS.some(o => o.value === v)) return v;
  return 'Long-term relationship';
}

function FilterPanel({ prefs, defaults, onChange, onApply, onClose }: {
  prefs: { gender: string; minAge: number; maxAge: number; maxDistance: number; minHeight: number; maxHeight: number; minWeight: number; maxWeight: number; city: string; relationshipGoals: string };
  defaults: { gender: string; minAge: number; maxAge: number; maxDistance: number; minHeight: number; maxHeight: number; minWeight: number; maxWeight: number; city: string; relationshipGoals: string };
  onChange: (p: typeof prefs) => void;
  onApply: () => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(prefs);
  const [switches, setSwitches] = useState({ verified: true, photos: true, active: true });
  const [saved, setSaved] = useState(false);
  const ageRef = useRef<HTMLDivElement>(null);
  const distRef = useRef<HTMLDivElement>(null);
  const set = (patch: Partial<typeof draft>) => setDraft(d => ({ ...d, ...patch }));

  const goalVal = storedGoal(draft.relationshipGoals);
  const minPct = ((draft.minAge - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100;
  const maxPct = ((draft.maxAge - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100;
  const distIdx = (() => {
    if (draft.maxDistance <= 0) return 0;
    let best = 0, bd = Infinity;
    DISTANCE_STEPS.forEach((s, i) => {
      const d = Math.abs(s - draft.maxDistance);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  })();
  const distPct = (distIdx / (DISTANCE_STEPS.length - 1)) * 100;

  let savedCity = '';
  try {
    const loc = JSON.parse(localStorage.getItem('dogwu_location') || 'null');
    if (loc && loc.city) savedCity = loc.city;
  } catch {}
  const locValue = draft.city || savedCity || 'Select a location';

  const setAgeFromX = (which: 'min' | 'max', clientX: number) => {
    const rect = ageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const val = Math.round(AGE_MIN + pct * (AGE_MAX - AGE_MIN));
    setDraft(d => {
      let min = which === 'min' ? Math.min(val, d.maxAge - 1) : d.minAge;
      let max = which === 'max' ? Math.max(val, d.minAge + 1) : d.maxAge;
      min = Math.max(AGE_MIN, min);
      max = Math.min(AGE_MAX, max);
      return { ...d, minAge: min, maxAge: max };
    });
  };

  const startAgeDrag = (which: 'min' | 'max', e: React.PointerEvent) => {
    e.preventDefault();
    const move = (ev: PointerEvent) => setAgeFromX(which, ev.clientX);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const startDist = (e: React.PointerEvent) => {
    e.preventDefault();
    const move = (ev: PointerEvent) => {
      const rect = distRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
      const idx = Math.round(pct * (DISTANCE_STEPS.length - 1));
      set({ maxDistance: DISTANCE_STEPS[idx] });
    };
    move(e.nativeEvent);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const handleReset = () => {
    setDraft(defaults);
    setSwitches({ verified: true, photos: true, active: true });
  };

  const handleApply = () => {
    if (saved) return;
    setSaved(true);
    setTimeout(() => {
      onChange(draft);
      onApply();
    }, 650);
  };

  return (
    <>
      <style jsx global>{DISCOVER_FILTER_TEMPLATE_CSS}</style>
      <div className="dpr" style={{ position: 'fixed', inset: 0, zIndex: 100, overflowY: 'auto' }}>
        <div className="app">
          <main className="sheet">
            <div className="sheet-head">
              <button className="close" aria-label="Close" onClick={onClose}>×</button>
              <h2>Discover Preferences</h2>
            </div>

            <section className="section first">
              <h3><span className="pink person">●</span> Who are you looking for?</h3>

              <div className="preference-card">
                <div className="row gender-row">
                  <label>Gender</label>
                  <div className="segmented gender">
                    {GENDER_OPTIONS.map(opt => (
                      <button key={opt.value} className={draft.gender === opt.value ? 'selected' : ''} onClick={() => set({ gender: opt.value })}>
                        {opt.label}{draft.gender === opt.value && <span className="check">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="range-block">
                  <div className="range-title">
                    <span>Age Range</span><span>{draft.minAge} – {draft.maxAge}</span>
                  </div>
                  <div className="dual-range" ref={ageRef}>
                    <div className="track"></div>
                    <div className="active-track" style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}></div>
                    <span className="knob left" onPointerDown={e => startAgeDrag('min', e)} style={{ left: `calc(${minPct}% - 11px)` }}></span>
                    <span className="knob right" onPointerDown={e => startAgeDrag('max', e)} style={{ left: `calc(${maxPct}% - 11px)` }}></span>
                  </div>
                  <div className="range-labels"><span>{AGE_MIN}</span><span>{AGE_MAX}</span></div>
                </div>

                <div className="range-block distance">
                  <div className="range-title">
                    <span>Distance</span><span>{draft.maxDistance === 0 ? 'Anywhere' : `Up to ${draft.maxDistance} km`}</span>
                  </div>
                  <div className="single-range" ref={distRef} onPointerDown={startDist}>
                    <div className="track"></div>
                    <div className="active-track" style={{ right: `${100 - distPct}%` }}></div>
                    <span className="knob" style={{ left: `calc(${distPct}% - 11px)` }}></span>
                  </div>
                  <div className="distance-labels">
                    <span>10 km</span><span>25 km</span><span>50 km</span><span>100 km</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="premium">
              <div className="crown">♛</div>
              <div className="premium-copy">
                <div><strong>Advanced filters</strong> <em>Premium</em></div>
                <p>Go Premium to unlock more powerful filters<br className="desktop-break" /> and find your perfect match.</p>
              </div>
              <button className="upgrade" onClick={() => alert('Premium filters are ready for your upgrade flow.')}>Upgrade</button>
            </section>

            <section className="simple-row" onClick={() => { window.location.href = '/location.html?return=/discover'; }}>
              <div className="left-content"><span className="outline-icon pin">⌾</span><strong>Location</strong></div>
              <div className="value">{locValue} <span className="chevron">›</span></div>
            </section>

            <section className="section relationship">
              <h3><span className="pink heart">♥</span> Relationship</h3>
              <div className="choice-card">
                {GOAL_OPTIONS.map(o => (
                  <button key={o.value} className={goalVal === o.value ? 'selected' : ''} onClick={() => set({ relationshipGoals: o.value })}>
                    {o.label}{goalVal === o.value && <span className="check">✓</span>}
                  </button>
                ))}
              </div>
            </section>

            <section className="section profile">
              <h3><span className="pink shield">◈</span> Profile Preferences</h3>
              <div className="switch-card">
                {SWITCH_ITEMS.map(s => (
                  <div className="switch-row" key={s.key}>
                    <div className="switch-label"><span className={`${s.cls} icon`}>{s.icon}</span> {s.label}</div>
                    <button className={`switch ${switches[s.key] ? 'on' : ''}`} aria-label={s.label} onClick={() => setSwitches(prev => ({ ...prev, [s.key]: !prev[s.key] }))}><span></span></button>
                  </div>
                ))}
              </div>
            </section>

            <div className="bottom-actions">
              <button className="reset" onClick={handleReset}><span>↶</span> Reset Filters</button>
              <button className="apply" onClick={handleApply}><span>✓</span>{saved ? 'Filters Applied' : 'Apply Filters'}</button>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
