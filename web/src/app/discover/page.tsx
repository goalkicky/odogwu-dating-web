'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { HeartIcon, CloseIcon, StarIcon, RefreshIcon, FilterIcon, ChatIcon } from '@/components/Icons';
import AnimatedCard from '@/components/AnimatedCard';
import ActionButton from '@/components/ActionButton';
import GradientBackground from '@/components/GradientBackground';
import TabBar from '@/components/TabBar';
import DesktopLayout from '@/components/DesktopLayout';
import ProfileModal from '@/components/ProfileModal';
import SuperlikeUpsellModal from '@/components/SuperlikeUpsellModal';
import LikeUpsellModal from '@/components/LikeUpsellModal';
import MessageUpsellModal from '@/components/MessageUpsellModal';
import { useMobile } from '@/lib/useMediaQuery';
import { useAuth } from '@/store/AuthContext';
import { userService, storageService, superlikeService, likeService, matchService } from '@/lib/cloudflare/services';
import { account } from '@/lib/cloudflare/config';

export default function DiscoverPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const isMobile = useMobile();
  const [users, setUsers] = useState<any[]>([]);

  const [lastAction, setLastAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showProfileUser, setShowProfileUser] = useState<any>(null);
  const [superlikes, setSuperlikes] = useState<any>({ remaining: 0, dailyLimit: 0, refillsAt: '', isPremium: false });
  const [showSuperlikeUpsell, setShowSuperlikeUpsell] = useState(false);
  const [likes, setLikes] = useState<any>({ remaining: 0, used: 0, dailyLimit: 0, refillsAt: '', isPremium: false });
  const [showLikeUpsell, setShowLikeUpsell] = useState(false);
  const [showMessageUpsell, setShowMessageUpsell] = useState(false);

  const baseGender = (profile?.interestedIn as string) || 'both';
  const defaultPrefs = { gender: baseGender, minAge: 18, maxAge: 60, maxDistance: 0 };
  const [prefs, setPrefs] = useState(defaultPrefs);

  const activeFilterCount =
    (prefs.gender !== baseGender ? 1 : 0) +
    (prefs.minAge !== 18 ? 1 : 0) +
    (prefs.maxAge !== 60 ? 1 : 0) +
    (prefs.maxDistance > 0 ? 1 : 0);

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
        const mutual = await userService.isMutualMatch((profile as any).$id, liked.id);
        if (mutual) setLastAction('match');
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
        if (res.mutual) setLastAction('match');
      } catch (e: any) {
        if (e?.status === 402 || e?.code === 'NO_SUPERLIKES' || String(e?.message || '').includes('super like')) {
          setShowSuperlikeUpsell(true);
        }
      }
    }
    setTimeout(() => { setLastAction(null); nextUser(); }, 300);
  }, [users, superlikes, nextUser]);

  const handleReload = useCallback(() => {
    loadUsers();
  }, [loadUsers]);

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
      <DesktopLayout>
        <GradientBackground style={{ minHeight: '100vh' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', gap: 18 }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, border: '3px solid rgba(255,55,95,0.2)', borderTopColor: '#FF375F', animation: 'spin 0.8s linear infinite' }} />
            <span className="neon-text" style={{ fontSize: 16, fontWeight: 700 }}>Loading profiles...</span>
          </div>
          {isMobile && <TabBar />}
        </GradientBackground>
      </DesktopLayout>
    );
  }

  if (users.length === 0) {
    return (
      <DesktopLayout>
        <GradientBackground style={{ minHeight: '100vh' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', gap: 16 }}>
            <div className="glass" style={{ width: 96, height: 96, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(255,55,95,0.15)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#FF6B8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"/>
              </svg>
            </div>
            <span className="animate-pop" style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>No more profiles</span>
            <span style={{ fontSize: 14, color: '#6B6B6B', textAlign: 'center', maxWidth: 260 }}>
              You&apos;ve seen everyone nearby. Check back later for fresh faces.
            </span>
            <button onClick={loadUsers} style={{ padding: '12px 28px', borderRadius: 9999, border: 'none', background: 'linear-gradient(135deg, #FF375F, #FF3B30)', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 24px rgba(255,55,95,0.4)' }}>Refresh</button>
          </div>
          {isMobile && <TabBar />}
        </GradientBackground>
      </DesktopLayout>
    );
  }

  const current = users[0];

  return (
    <DesktopLayout>
      <GradientBackground
        style={{
          height: isMobile ? '100dvh' : 'auto',
          minHeight: '100dvh',
          overflow: 'hidden',
          padding: isMobile ? '12px 14px 108px' : '24px 16px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>
          <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? 12 : 20 }}>
            <div>
              <h1 style={{ fontSize: isMobile ? 26 : 30, fontWeight: 800, color: 'white', margin: 0, letterSpacing: 0.5 }}>
                Discover<span style={{ color: '#FF375F' }}>.</span>
              </h1>
              <p style={{ fontSize: 13, color: '#6B6B6B', margin: '2px 0 0' }}>
                {users.length > 0 ? `${users.length} profiles ready for you` : ''}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="glass" style={{ padding: '6px 12px', borderRadius: 9999, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 9999, background: '#34C759', boxShadow: '0 0 10px #34C759' }} />
                <span style={{ color: '#ABABAB', fontSize: 13, fontWeight: 600 }}>Live</span>
              </div>
              <button
                onClick={() => setShowFilters(true)}
                className="glass lift"
                aria-label="Filter preferences"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px', borderRadius: 9999, position: 'relative',
                  color: '#D0D0D0', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <FilterIcon size={16} color="#FF6B8A" />
                Filters
                {activeFilterCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -6, right: -6, minWidth: 20, height: 20, padding: '0 5px', boxSizing: 'border-box',
                    borderRadius: 9999, background: 'linear-gradient(135deg, #FF375F, #FF3B30)', color: 'white',
                    fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 10px rgba(255,55,95,0.6)', border: '2px solid #0D0D0D',
                  }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {!isMobile && (
              <div style={{
                position: 'absolute', inset: -20, borderRadius: 40,
                background: 'radial-gradient(circle, rgba(255,55,95,0.14) 0%, rgba(124,77,255,0.1) 45%, transparent 70%)',
                filter: 'blur(10px)',
              }} />
            )}

            <div style={{ position: 'relative', width: isMobile ? '100%' : 420, height: isMobile ? '100%' : 600, maxWidth: '100%' }}>
              <AnimatedCard
                key={current.id}
                user={current}
                isFirst
                width="100%"
                height="100%"
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onSuperLike={handleSuperLike}
                onOpenProfile={() => setShowProfileUser(current)}
              />
            </div>

            {lastAction && (
              <div className="animate-pop" style={{ position: 'absolute', bottom: 92, left: 0, right: 0, display: 'flex', justifyContent: 'center', animation: lastAction === 'match' ? 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' : 'fadeUp 0.3s ease' }}>
                {lastAction === 'match' ? (
                  <div style={{ background: 'linear-gradient(135deg, #FF375F, #7C4DFF)', padding: '10px 24px', borderRadius: 9999, boxShadow: '0 8px 30px rgba(255,55,95,0.5), 0 0 40px rgba(124,77,255,0.35)', whiteSpace: 'nowrap' }}>
                    <span style={{ color: 'white', fontWeight: 800, fontSize: 15, letterSpacing: 0.5 }}>✨ It&apos;s a Match!</span>
                  </div>
                ) : (
                  <div className="glass-strong" style={{ padding: '8px 20px', borderRadius: 9999, whiteSpace: 'nowrap' }}>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>
                      {lastAction === 'like' ? 'Liked!' : lastAction === 'dislike' ? 'Nope' : `Super Liked ${current.fullName.split(' ')[0] || 'them'}! 💙`}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="animate-fade-up" style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <ActionButton variant="boost" size={40} onPress={handleMessage}>
                <ChatIcon size={18} color="white" />
              </ActionButton>
              <ActionButton variant="secondary" size={46} onPress={handleReload}>
                <RefreshIcon size={20} color="#FFD700" />
              </ActionButton>
              <ActionButton variant="danger" size={62} onPress={handleSwipeLeft}>
                <CloseIcon size={30} color="white" />
              </ActionButton>
              <div style={{ position: 'relative' }}>
                <ActionButton variant="superlike" size={46} onPress={handleSuperLike}>
                  <StarIcon size={20} color="white" />
                </ActionButton>
                <span style={{
                  position: 'absolute', top: -4, right: -6, minWidth: 20, height: 20, padding: '0 5px', boxSizing: 'border-box',
                  borderRadius: 9999, background: superlikes.remaining > 0 ? 'linear-gradient(135deg, #4FC3F7, #0288D1)' : '#FF3B30',
                  color: 'white', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: superlikes.remaining > 0 ? '0 2px 10px rgba(79,195,247,0.6)' : '0 2px 10px rgba(255,59,48,0.6)',
                  border: '2px solid #0D0D0D',
                }}>
                  {superlikes.remaining}
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <ActionButton variant="primary" size={62} onPress={handleSwipeRight}>
                  <HeartIcon size={30} color="white" />
                </ActionButton>
                {!likes.isPremium && likes.dailyLimit > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -6, minWidth: 20, height: 20, padding: '0 5px', boxSizing: 'border-box',
                    borderRadius: 9999, background: (likes.remaining ?? 0) > 0 ? 'linear-gradient(135deg, #FF375F, #FF6B81)' : '#FF3B30',
                    color: 'white', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: (likes.remaining ?? 0) > 0 ? '0 2px 10px rgba(255,55,95,0.6)' : '0 2px 10px rgba(255,59,48,0.6)',
                    border: '2px solid #0D0D0D',
                  }}>
                    {Math.max(0, likes.remaining ?? 0)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        {isMobile && <TabBar />}

        {showFilters && (
          <FilterPanel
            prefs={prefs}
            defaults={defaultPrefs}
            onChange={setPrefs}
            onApply={() => setShowFilters(false)}
            onClose={() => setShowFilters(false)}
          />
        )}

        {showProfileUser && (
          <ProfileModal user={showProfileUser} onClose={() => setShowProfileUser(null)} />
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
      </GradientBackground>
    </DesktopLayout>
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

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#8A8A8A', margin: '0 0 12px' }}>
      {children}
    </p>
  );
}

function Stepper({ label, value, onDec, onInc }: { label: string; value: number; onDec: () => void; onInc: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: '#6B6B6B', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '5px' }}>
        <button onClick={onDec} aria-label={`Decrease ${label}`} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', fontSize: 20, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          −
        </button>
        <span style={{ color: 'white', fontSize: 22, fontWeight: 800, minWidth: 32, textAlign: 'center' }}>{value}</span>
        <button onClick={onInc} aria-label={`Increase ${label}`} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', fontSize: 20, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          +
        </button>
      </div>
    </div>
  );
}

function FilterPanel({ prefs, defaults, onChange, onApply, onClose }: {
  prefs: { gender: string; minAge: number; maxAge: number; maxDistance: number };
  defaults: { gender: string; minAge: number; maxAge: number; maxDistance: number };
  onChange: (p: typeof prefs) => void;
  onApply: () => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(prefs);
  const set = (patch: Partial<typeof draft>) => setDraft(d => ({ ...d, ...patch }));

  const clampAge = (min: number, max: number) => ({
    minAge: Math.min(AGE_MAX, Math.max(AGE_MIN, Math.min(min, max))),
    maxAge: Math.min(AGE_MAX, Math.max(AGE_MIN, Math.max(min, max))),
  });

  const distFill = (draft.maxDistance / DIST_MAX) * 100;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.6)', paddingTop: 40 }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="animate-fade-up"
        style={{
          width: '100%', maxWidth: 520, margin: '0 auto',
          background: '#16161C', borderRadius: '24px 24px 0 0',
          padding: '24px 24px 40px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 -12px 60px rgba(0,0,0,0.6)',
          maxHeight: '100%', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0 }}>Discovery Preferences</h3>
          <button onClick={onClose} aria-label="Close" style={{ width: 36, height: 36, borderRadius: 9999, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CloseIcon size={16} color="white" />
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
                  color: draft.gender === opt.value ? 'white' : '#ABABAB',
                  background: draft.gender === opt.value ? 'linear-gradient(135deg, #FF375F, #FF6B8A)' : 'rgba(255,255,255,0.06)',
                  border: draft.gender === opt.value ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: draft.gender === opt.value ? '0 4px 18px rgba(255,55,95,0.35)' : 'none',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 30 }}>
          <FilterLabel>Age Range</FilterLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'center' }}>
            <Stepper label="Min" value={draft.minAge} onDec={() => set(clampAge(draft.minAge - 1, draft.maxAge))} onInc={() => set(clampAge(draft.minAge + 1, draft.maxAge))} />
            <span style={{ color: '#4A4A4A', fontSize: 22, fontWeight: 800 }}>—</span>
            <Stepper label="Max" value={draft.maxAge} onDec={() => set(clampAge(draft.minAge, draft.maxAge - 1))} onInc={() => set(clampAge(draft.minAge, draft.maxAge + 1))} />
          </div>
        </div>

        <div style={{ marginBottom: 30 }}>
          <FilterLabel>Distance</FilterLabel>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ color: 'white', fontSize: 22, fontWeight: 800 }}>
              {draft.maxDistance === 0 ? 'Anywhere' : `${draft.maxDistance} km`}
            </span>
            {draft.maxDistance > 0 && (
              <button onClick={() => set({ maxDistance: 0 })} style={{ background: 'none', border: 'none', color: '#FF6B8A', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
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
            <span style={{ fontSize: 11, color: '#6B6B6B' }}>Anywhere</span>
            <span style={{ fontSize: 11, color: '#6B6B6B' }}>100 km</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setDraft(defaults)}
            style={{ padding: '14px 22px', borderRadius: 9999, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#D0D0D0', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
          >
            Reset
          </button>
          <button
            onClick={() => { onChange(draft); onApply(); }}
            style={{ flex: 1, padding: '14px 22px', borderRadius: 9999, border: 'none', background: 'linear-gradient(135deg, #FF375F, #FF3B30)', color: 'white', fontSize: 15, fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 24px rgba(255,55,95,0.4)' }}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}