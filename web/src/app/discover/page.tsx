'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FilterIcon, CloseIcon } from '@/components/Icons';
import AnimatedCard from '@/components/AnimatedCard';
import AppShell from '@/components/AppShell';
import SuperlikeUpsellModal from '@/components/SuperlikeUpsellModal';
import LikeUpsellModal from '@/components/LikeUpsellModal';
import MessageUpsellModal from '@/components/MessageUpsellModal';
import MatchPopup from '@/components/MatchPopup';
import { useMobile, useMediaQuery } from '@/lib/useMediaQuery';
import { useAuth } from '@/store/AuthContext';
import { userService, storageService, superlikeService, likeService, matchService } from '@/lib/cloudflare/services';
import { account } from '@/lib/cloudflare/config';

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
  const [matchPopupUser, setMatchPopupUser] = useState<any>(null);
  const [matchPopupId, setMatchPopupId] = useState<string | undefined>(undefined);

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
          setMatchPopupUser(liked);
          setMatchPopupId(res.match?.$id);
          return;
        }
      } catch (e: any) {
        if (e?.status === 402 || e?.code === 'NO_LIKES' || String(e?.message || '').includes('like')) {
          setShowLikeUpsell(true);
        }
      }
    }
    setTimeout(() => { setLastAction(null); nextUser(); }, 300);
  }, [users, profile, likes, nextUser]);

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
          setMatchPopupUser(liked);
          setMatchPopupId(res.match?.$id);
          return;
        }
      } catch (e: any) {
        if (e?.status === 402 || e?.code === 'NO_SUPERLIKES' || String(e?.message || '').includes('super like')) {
          setShowSuperlikeUpsell(true);
        }
      }
    }
    setTimeout(() => { setLastAction(null); nextUser(); }, 300);
  }, [users, superlikes, nextUser]);

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
          <span className="animate-pop" style={{ fontSize: 22, fontWeight: 800, color: '#151515' }}>No more profiles</span>
          <span style={{ fontSize: 14, color: '#8A8A8F', textAlign: 'center', maxWidth: 260 }}>
            You&apos;ve seen everyone nearby. Check back later for fresh faces.
          </span>
          <button onClick={loadUsers} style={{ padding: '12px 28px', borderRadius: 9999, border: 'none', background: 'linear-gradient(135deg, #FF2E5F, #FF4530)', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 24px rgba(255,46,95,0.4)' }}>Refresh</button>
        </div>
      </AppShell>
    );
  }

  const current = users[0];

  const actionSize = isTiny ? 78 : isMobile ? 88 : 110;
  const actionGap = isTiny ? 18 : isMobile ? 28 : 74;
  const actionFont = isTiny ? 44 : isMobile ? 47 : 57;
  const likeFont = isTiny ? 34 : isMobile ? 40 : 47;
  const msgFont = isTiny ? 24 : isMobile ? 29 : 35;
  const actionSmall = isMobile ? 15 : 18;

  const discoverHeader = (
    <header className="uv-topbar">
      <img className="uv-brand-logo" src="/o-logo.png" alt="Odogwu" style={{ justifySelf: 'start', height: 34 }} />
      <h1 style={{ fontSize: 20, fontWeight: 800, color: '#000', margin: 0, letterSpacing: -0.5, textAlign: 'center' }}>Discover</h1>
      <button
        onClick={() => setShowFilters(true)}
        aria-label="Filter preferences"
        style={{
          width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', border: 0, cursor: 'pointer', color: '#17191d', justifySelf: 'end',
        }}
      >
        <FilterIcon size={22} color="#17191d" />
      </button>
    </header>
  );

  return (
    <AppShell header={discoverHeader}>
      <div className="animate-fade-up" style={{ paddingTop: isMobile ? 6 : 22 }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <AnimatedCard
            key={current.id}
            user={current}
            isFirst
            width="100%"
            height="auto"
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onSuperLike={handleSuperLike}
          />

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: actionGap, padding: isMobile ? '32px 0 22px' : '38px 0 25px' }}>
            <button onClick={handleSwipeLeft} className="lift" aria-label="Pass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, background: 'none', border: 0, cursor: 'pointer', color: '#101217' }}>
              <span style={{ width: actionSize, height: actionSize, border: '1px solid #ececef', borderRadius: '50%', display: 'grid', placeItems: 'center', boxShadow: '0 3px 10px rgba(0,0,0,0.04)', background: '#fff', fontSize: actionFont, fontWeight: 300, color: '#101217' }}>×</span>
              <small style={{ fontSize: actionSmall, color: '#101217' }}>Pass</small>
            </button>

            <button onClick={handleSwipeRight} className="lift" aria-label="Like" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, background: 'none', border: 0, cursor: 'pointer', color: '#101217' }}>
              <span style={{ width: actionSize, height: actionSize, borderRadius: '50%', display: 'grid', placeItems: 'center', boxShadow: '0 6px 18px rgba(255,45,104,0.35)', background: '#ff2d68', color: '#fff', fontSize: likeFont, fontWeight: 300, paddingBottom: isMobile ? 4 : 6 }}>♥</span>
              <small style={{ fontSize: actionSmall, color: '#101217' }}>Like</small>
            </button>

            <button onClick={handleMessage} className="lift" aria-label="Message" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, background: 'none', border: 0, cursor: 'pointer', color: '#101217' }}>
              <span style={{ width: actionSize, height: actionSize, border: '1px solid #ececef', borderRadius: '50%', display: 'grid', placeItems: 'center', boxShadow: '0 3px 10px rgba(0,0,0,0.04)', background: '#fff', fontSize: msgFont, color: '#171a1e' }}>●</span>
              <small style={{ fontSize: actionSmall, color: '#101217' }}>Message</small>
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

        {matchPopupUser && (
          <MatchPopup
            matchedUser={matchPopupUser}
            matchId={matchPopupId}
            myPhotoUrl={(profile as any)?._photoUrl || ((profile as any)?.photos?.[0] ? storageService.getFilePreview((profile as any).photos[0]) : '')}
            onClose={() => { setMatchPopupUser(null); setMatchPopupId(undefined); nextUser(); }}
          />
        )}
      </div>
    </AppShell>
  );
}

const GENDER_OPTIONS = [
  { value: 'both', label: 'Everyone' },
  { value: 'female', label: 'Women' },
  { value: 'male', label: 'Men' },
];
const AGE_MIN = 18;
const AGE_MAX = 80;
const DIST_MAX = 100;
const HEIGHT_MIN = 48;
const HEIGHT_MAX = 84;
const WEIGHT_MIN = 30;
const WEIGHT_MAX = 200;
const RELATIONSHIP_GOALS = ['Flirting', 'Chatting', 'Serious Dating', 'Marriage'];

function inchesToFtIn(inches: number): string {
  const ft = Math.floor(inches / 12);
  const inch = inches % 12;
  return `${ft}'${inch}"`;
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#8A8A8F', margin: '0 0 12px' }}>
      {children}
    </p>
  );
}

function FilterPanel({ prefs, defaults, onChange, onApply, onClose }: {
  prefs: { gender: string; minAge: number; maxAge: number; maxDistance: number; minHeight: number; maxHeight: number; minWeight: number; maxWeight: number; city: string; relationshipGoals: string };
  defaults: { gender: string; minAge: number; maxAge: number; maxDistance: number; minHeight: number; maxHeight: number; minWeight: number; maxWeight: number; city: string; relationshipGoals: string };
  onChange: (p: typeof prefs) => void;
  onApply: () => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(prefs);
  const set = (patch: Partial<typeof draft>) => setDraft(d => ({ ...d, ...patch }));

  const distFill = (draft.maxDistance / DIST_MAX) * 100;
  const heightFillMin = ((draft.minHeight || HEIGHT_MIN) - HEIGHT_MIN) / (HEIGHT_MAX - HEIGHT_MIN) * 100;
  const heightFillMax = 1 - ((draft.maxHeight || HEIGHT_MAX) - HEIGHT_MIN) / (HEIGHT_MAX - HEIGHT_MIN);
  const weightFillMin = ((draft.minWeight || WEIGHT_MIN) - WEIGHT_MIN) / (WEIGHT_MAX - WEIGHT_MIN) * 100;
  const weightFillMax = 1 - ((draft.maxWeight || WEIGHT_MAX) - WEIGHT_MIN) / (WEIGHT_MAX - WEIGHT_MIN);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'stretch', background: '#F7F7FA' }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 520, margin: '0 auto',
          background: '#fff',
          padding: '24px 24px 40px',
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, position: 'sticky', top: 0, background: '#fff', paddingTop: 8, paddingBottom: 8, zIndex: 1 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#151515', margin: 0 }}>Discovery Preferences</h3>
          <button onClick={onClose} aria-label="Close" style={{ width: 36, height: 36, borderRadius: 9999, background: '#F3F3F6', border: '1px solid #EDEDF1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CloseIcon size={16} color="#151515" />
          </button>
        </div>

        <div style={{ marginBottom: 30 }}>
          <FilterLabel>Gender</FilterLabel>
          <div style={{ display: 'flex', gap: 8 }}>
            {GENDER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => set({ gender: opt.value })}
                style={{
                  flex: 1, padding: '13px 0', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  color: draft.gender === opt.value ? 'white' : '#8A8A8F',
                  background: draft.gender === opt.value ? 'linear-gradient(135deg, #FF2E5F, #FF7BA0)' : '#F3F3F6',
                  border: draft.gender === opt.value ? 'none' : '1px solid #EDEDF1',
                  boxShadow: draft.gender === opt.value ? '0 4px 18px rgba(255,46,95,0.35)' : 'none',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 30 }}>
          <FilterLabel>Age Range</FilterLabel>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ color: '#151515', fontSize: 22, fontWeight: 800 }}>
              {draft.minAge} – {draft.maxAge}
            </span>
          </div>
          <div className="dual-slider-wrap">
            <div className="dual-slider-track" />
            <div
              className="dual-slider-fill"
              style={{
                left: `${((draft.minAge - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100}%`,
                right: `${(1 - (draft.maxAge - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100}%`,
              }}
            />
            <input
              type="range"
              className="dual-slider"
              min={AGE_MIN}
              max={AGE_MAX}
              value={draft.minAge}
              onChange={e => {
                const v = Math.min(Number(e.target.value), draft.maxAge - 1);
                set({ minAge: Math.max(AGE_MIN, v) });
              }}
              style={{ zIndex: draft.minAge >= draft.maxAge - 1 ? 3 : 2 }}
            />
            <input
              type="range"
              className="dual-slider"
              min={AGE_MIN}
              max={AGE_MAX}
              value={draft.maxAge}
              onChange={e => {
                const v = Math.max(Number(e.target.value), draft.minAge + 1);
                set({ maxAge: Math.min(AGE_MAX, v) });
              }}
              style={{ zIndex: draft.minAge >= draft.maxAge - 1 ? 2 : 3 }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: '#8A8A8F' }}>{AGE_MIN}</span>
            <span style={{ fontSize: 11, color: '#8A8A8F' }}>{AGE_MAX}</span>
          </div>
        </div>

        <div style={{ marginBottom: 30 }}>
          <FilterLabel>Distance</FilterLabel>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ color: '#151515', fontSize: 22, fontWeight: 800 }}>
              {draft.maxDistance === 0 ? 'Anywhere' : `${draft.maxDistance} km`}
            </span>
            {draft.maxDistance > 0 && (
              <button onClick={() => set({ maxDistance: 0 })} style={{ background: 'none', border: 'none', color: '#FF7BA0', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Anywhere
              </button>
            )}
          </div>
          <input
            type="range"
            className="slider"
            min={0}
            max={DIST_MAX}
            step={5}
            value={draft.maxDistance}
            onChange={e => set({ maxDistance: Number(e.target.value) })}
            style={{ ['--fill' as any]: `${distFill}%` }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: '#8A8A8F' }}>Anywhere</span>
            <span style={{ fontSize: 11, color: '#8A8A8F' }}>100 km</span>
          </div>
        </div>

        <div style={{ marginBottom: 30 }}>
          <FilterLabel>Height Range</FilterLabel>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ color: '#151515', fontSize: 22, fontWeight: 800 }}>
              {inchesToFtIn(draft.minHeight || HEIGHT_MIN)} – {inchesToFtIn(draft.maxHeight || HEIGHT_MAX)}
            </span>
            {((draft.minHeight > 0) || (draft.maxHeight > 0)) && (
              <button onClick={() => set({ minHeight: 0, maxHeight: 0 })} style={{ background: 'none', border: 'none', color: '#FF7BA0', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Any
              </button>
            )}
          </div>
          <div className="dual-slider-wrap">
            <div className="dual-slider-track" />
            <div
              className="dual-slider-fill"
              style={{
                left: `${heightFillMin}%`,
                right: `${heightFillMax * 100}%`,
              }}
            />
            <input
              type="range"
              className="dual-slider"
              min={HEIGHT_MIN}
              max={HEIGHT_MAX}
              value={draft.minHeight || HEIGHT_MIN}
              onChange={e => {
                const v = Math.min(Number(e.target.value), (draft.maxHeight || HEIGHT_MAX) - 1);
                set({ minHeight: Math.max(HEIGHT_MIN, v) });
              }}
              style={{ zIndex: (draft.minHeight || HEIGHT_MIN) >= (draft.maxHeight || HEIGHT_MAX) - 1 ? 3 : 2 }}
            />
            <input
              type="range"
              className="dual-slider"
              min={HEIGHT_MIN}
              max={HEIGHT_MAX}
              value={draft.maxHeight || HEIGHT_MAX}
              onChange={e => {
                const v = Math.max(Number(e.target.value), (draft.minHeight || HEIGHT_MIN) + 1);
                set({ maxHeight: Math.min(HEIGHT_MAX, v) });
              }}
              style={{ zIndex: (draft.minHeight || HEIGHT_MIN) >= (draft.maxHeight || HEIGHT_MAX) - 1 ? 2 : 3 }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: '#8A8A8F' }}>{inchesToFtIn(HEIGHT_MIN)}</span>
            <span style={{ fontSize: 11, color: '#8A8A8F' }}>{inchesToFtIn(HEIGHT_MAX)}</span>
          </div>
        </div>

        <div style={{ marginBottom: 30 }}>
          <FilterLabel>Weight Range (kg)</FilterLabel>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ color: '#151515', fontSize: 22, fontWeight: 800 }}>
              {draft.minWeight || WEIGHT_MIN} – {draft.maxWeight || WEIGHT_MAX} kg
            </span>
            {((draft.minWeight > 0) || (draft.maxWeight > 0)) && (
              <button onClick={() => set({ minWeight: 0, maxWeight: 0 })} style={{ background: 'none', border: 'none', color: '#FF7BA0', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Any
              </button>
            )}
          </div>
          <div className="dual-slider-wrap">
            <div className="dual-slider-track" />
            <div
              className="dual-slider-fill"
              style={{
                left: `${weightFillMin}%`,
                right: `${weightFillMax * 100}%`,
              }}
            />
            <input
              type="range"
              className="dual-slider"
              min={WEIGHT_MIN}
              max={WEIGHT_MAX}
              value={draft.minWeight || WEIGHT_MIN}
              onChange={e => {
                const v = Math.min(Number(e.target.value), (draft.maxWeight || WEIGHT_MAX) - 1);
                set({ minWeight: Math.max(WEIGHT_MIN, v) });
              }}
              style={{ zIndex: (draft.minWeight || WEIGHT_MIN) >= (draft.maxWeight || WEIGHT_MAX) - 1 ? 3 : 2 }}
            />
            <input
              type="range"
              className="dual-slider"
              min={WEIGHT_MIN}
              max={WEIGHT_MAX}
              value={draft.maxWeight || WEIGHT_MAX}
              onChange={e => {
                const v = Math.max(Number(e.target.value), (draft.minWeight || WEIGHT_MIN) + 1);
                set({ maxWeight: Math.min(WEIGHT_MAX, v) });
              }}
              style={{ zIndex: (draft.minWeight || WEIGHT_MIN) >= (draft.maxWeight || WEIGHT_MAX) - 1 ? 2 : 3 }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: '#8A8A8F' }}>{WEIGHT_MIN} kg</span>
            <span style={{ fontSize: 11, color: '#8A8A8F' }}>{WEIGHT_MAX} kg</span>
          </div>
        </div>

        <div style={{ marginBottom: 30 }}>
          <FilterLabel>Location</FilterLabel>
          <input
            type="text"
            value={draft.city}
            onChange={e => set({ city: e.target.value })}
            placeholder="Search by city"
            style={{
              width: '100%', padding: '13px 16px', borderRadius: 12, border: '1px solid #EDEDF1',
              background: '#F3F3F6', color: '#151515', fontSize: 15, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: 30 }}>
          <FilterLabel>Relationship Goals</FilterLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {RELATIONSHIP_GOALS.map(opt => {
              const selected = draft.relationshipGoals === opt;
              return (
                <button
                  key={opt}
                  onClick={() => set({ relationshipGoals: selected ? '' : opt })}
                  style={{
                    padding: '10px 18px', borderRadius: 9999, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                    color: selected ? 'white' : '#8A8A8F',
                    background: selected ? 'linear-gradient(135deg, #FF2E5F, #FF7BA0)' : '#F3F3F6',
                    border: selected ? 'none' : '1px solid #EDEDF1',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ position: 'sticky', bottom: 0, background: '#fff', paddingTop: 16, paddingBottom: 24, marginTop: 12 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setDraft(defaults)}
              style={{ padding: '16px 24px', borderRadius: 14, background: '#F3F3F6', border: '1px solid #EDEDF1', color: '#65656A', fontSize: 15, fontWeight: 700, cursor: 'pointer', minWidth: 90 }}
            >
              Reset
            </button>
            <button
              onClick={() => { onChange(draft); onApply(); }}
              style={{ flex: 1, padding: '16px 24px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #FF2E5F, #FF4530)', color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 24px rgba(255,46,95,0.4)' }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
