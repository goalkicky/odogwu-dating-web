'use client';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ChevronBackIcon, RefreshIcon, HeartIcon, CloseIcon, StarIcon, SearchIcon } from '@/components/Icons';
import AnimatedCard from '@/components/AnimatedCard';
import ActionButton from '@/components/ActionButton';
import GradientBackground from '@/components/GradientBackground';
import TabBar from '@/components/TabBar';
import DesktopLayout from '@/components/DesktopLayout';
import { useMobile } from '@/lib/useMediaQuery';
import { useAuth } from '@/store/AuthContext';
import { userService, storageService } from '@/lib/cloudflare/services';
import { account } from '@/lib/cloudflare/config';

const INTEREST_OPTIONS = [
  'Travel', 'Food', 'Music', 'Movies', 'Fitness', 'Hiking', 'Dancing', 'Cooking',
  'Art', 'Photography', 'Gaming', 'Reading', 'Sports', 'Fashion', 'Pets', 'Coffee',
  'Nature', 'Yoga', 'Shopping', 'Tech', 'Beach', 'Wine',
];

const INTEREST_STYLE: Record<string, { emoji: string; c1: string; c2: string }> = {
  Travel: { emoji: '✈️', c1: '#1E88E5', c2: '#4FC3F7' },
  Food: { emoji: '🍜', c1: '#FF7043', c2: '#FFB74D' },
  Music: { emoji: '🎵', c1: '#7C4DFF', c2: '#B388FF' },
  Movies: { emoji: '🎬', c1: '#5C6BC0', c2: '#9FA8DA' },
  Fitness: { emoji: '💪', c1: '#FF5252', c2: '#FF8A80' },
  Hiking: { emoji: '🥾', c1: '#43A047', c2: '#81C784' },
  Dancing: { emoji: '💃', c1: '#EC407A', c2: '#F48FB1' },
  Cooking: { emoji: '🍳', c1: '#FB8C00', c2: '#FFCA28' },
  Art: { emoji: '🎨', c1: '#AB47BC', c2: '#CE93D8' },
  Photography: { emoji: '📷', c1: '#37474F', c2: '#78909C' },
  Gaming: { emoji: '🎮', c1: '#3949AB', c2: '#7986CB' },
  Reading: { emoji: '📚', c1: '#6D4C41', c2: '#A1887F' },
  Sports: { emoji: '⚽', c1: '#2E7D32', c2: '#66BB6A' },
  Fashion: { emoji: '👗', c1: '#D81B60', c2: '#F06292' },
  Pets: { emoji: '🐾', c1: '#8D6E63', c2: '#BCAAA4' },
  Coffee: { emoji: '☕', c1: '#4E342E', c2: '#8D6E63' },
  Nature: { emoji: '🌿', c1: '#00897B', c2: '#4DB6AC' },
  Yoga: { emoji: '🧘', c1: '#7E57C2', c2: '#B39DDB' },
  Shopping: { emoji: '🛍️', c1: '#C2185B', c2: '#F06292' },
  Tech: { emoji: '💻', c1: '#1565C0', c2: '#64B5F6' },
  Beach: { emoji: '🏖️', c1: '#0277BD', c2: '#4DD0E1' },
  Wine: { emoji: '🍷', c1: '#6A1B9A', c2: '#CE93D8' },
};

function interestStyle(interest: string) {
  return INTEREST_STYLE[interest] || { emoji: '🌟', c1: '#7C4DFF', c2: '#FF375F' };
}

interface ExploreUser {
  id: string;
  photos: string[];
  fullName: string;
  age: number;
  bio: string;
  city: string;
  distanceKm?: number;
  interests: string[];
}

function toCard(u: ExploreUser) {
  return {
    id: u.id,
    photos: u.photos,
    fullName: u.fullName,
    age: u.age,
    bio: u.bio,
    city: u.city,
    distanceKm: u.distanceKm,
  };
}

export default function ExplorePage() {
  const { profile } = useAuth();
  const isMobile = useMobile();

  const [users, setUsers] = useState<ExploreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeInterest, setActiveInterest] = useState<string | null>(null);
  const [deck, setDeck] = useState<ExploreUser[]>([]);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!profile || !account) return;
    setLoading(true);
    try {
      const prefs = { gender: (profile.interestedIn as string) || 'both', minAge: 18, maxAge: 60, maxDistance: 0 };
      const docs = await userService.getDiscoverUsers((profile as any).$id, prefs);
      const mapped = (docs as any[])
        .map((d) => ({
          id: d.$id,
          photos: (d.photos || []).map((fid: string) => storageService.getFilePreview(fid)),
          fullName: d.fullName || '',
          age: d.age || 0,
          bio: d.bio || '',
          city: d.city || '',
          distanceKm: d.distanceKm,
          interests: d.interests || [],
        }))
        .filter((u) => u.photos.length > 0);
      setUsers(mapped);
    } catch {}
    setLoading(false);
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  const groups = useMemo(() => {
    const map: Record<string, ExploreUser[]> = {};
    for (const u of users) {
      for (const it of u.interests) {
        if (!map[it]) map[it] = [];
        map[it].push(u);
      }
    }
    return map;
  }, [users]);

  const openInterest = useCallback((interest: string) => {
    setDeck([...(groups[interest] || [])]);
    setActiveInterest(interest);
    setLastAction(null);
  }, [groups]);

  const backToGrid = useCallback(() => {
    setActiveInterest(null);
    setDeck([]);
    setLastAction(null);
  }, []);

  const removeSwiped = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  const advance = useCallback(() => {
    setDeck(prev => prev.slice(1));
  }, []);

  const current = deck[0];

  const handleSwipeLeft = useCallback(async () => {
    setLastAction('dislike');
    const rejected = current;
    if (rejected) {
      try { await userService.likeExists((profile as any).$id, rejected.id); } catch {}
      removeSwiped(rejected.id);
    }
    setTimeout(() => { setLastAction(null); advance(); }, 300);
  }, [current, profile, removeSwiped, advance]);

  const handleSwipeRight = useCallback(async () => {
    setLastAction('like');
    const liked = current;
    if (liked) {
      try {
        await userService.likeUser((profile as any).$id, liked.id);
        const mutual = await userService.isMutualMatch((profile as any).$id, liked.id);
        if (mutual) setLastAction('match');
      } catch {}
      removeSwiped(liked.id);
    }
    setTimeout(() => { setLastAction(null); advance(); }, 300);
  }, [current, profile, removeSwiped, advance]);

  const handleSuperLike = useCallback(async () => {
    setLastAction('superlike');
    const liked = current;
    if (liked) {
      try { await userService.likeUser((profile as any).$id, liked.id); } catch {}
      removeSwiped(liked.id);
    }
    setTimeout(() => { setLastAction(null); advance(); }, 300);
  }, [current, profile, removeSwiped, advance]);

  const totalPeople = users.length;
  const activeStyle = activeInterest ? interestStyle(activeInterest) : null;

  return (
    <DesktopLayout>
      <GradientBackground
        style={{
          minHeight: '100vh',
          padding: isMobile ? '18px 16px 110px' : '24px 16px 60px',
        }}
      >
        {activeInterest && activeStyle ? (
          /* ===== Swipe deck for a selected interest ===== */
          <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
            <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <button
                onClick={backToGrid}
                aria-label="Back to explore"
                className="glass lift"
                style={{ width: 42, height: 42, borderRadius: 9999, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <ChevronBackIcon size={20} color="white" />
              </button>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{activeStyle.emoji}</span>
                  <h1 style={{ fontSize: isMobile ? 24 : 26, fontWeight: 800, color: 'white', margin: 0, letterSpacing: 0.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activeInterest}
                  </h1>
                </div>
                <p style={{ fontSize: 13, color: '#6B6B6B', margin: '2px 0 0' }}>
                  {current ? `${deck.length} matching ${deck.length === 1 ? 'profile' : 'profiles'}` : `No one left in ${activeInterest}`}
                </p>
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '55vh', gap: 18 }}>
                <div style={{ width: 56, height: 56, borderRadius: 18, border: '3px solid rgba(255,55,95,0.2)', borderTopColor: '#FF375F', animation: 'spin 0.8s linear infinite' }} />
                <span className="neon-text" style={{ fontSize: 16, fontWeight: 700 }}>Loading profiles...</span>
              </div>
            ) : current ? (
              <div style={{ position: 'relative', height: isMobile ? '62vh' : 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {!isMobile && (
                  <div style={{ position: 'absolute', inset: -20, borderRadius: 40, background: `radial-gradient(circle, ${activeStyle.c1}33 0%, rgba(124,77,255,0.12) 45%, transparent 70%)`, filter: 'blur(10px)' }} />
                )}
                <div style={{ position: 'relative', width: isMobile ? '100%' : 420, height: isMobile ? '100%' : 600, maxWidth: '100%' }}>
                  <AnimatedCard
                    key={current.id}
                    user={toCard(current)}
                    isFirst
                    width="100%"
                    height="100%"
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    onSuperLike={handleSuperLike}
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
                          {lastAction === 'like' ? 'Liked!' : lastAction === 'dislike' ? 'Nope' : 'Super Like! 💙'}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="animate-fade-up" style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                  <ActionButton variant="secondary" size={46} onPress={load}>
                    <RefreshIcon size={20} color="#FFD700" />
                  </ActionButton>
                  <ActionButton variant="danger" size={62} onPress={handleSwipeLeft}>
                    <CloseIcon size={30} color="white" />
                  </ActionButton>
                  <ActionButton variant="superlike" size={46} onPress={handleSuperLike}>
                    <StarIcon size={20} color="white" />
                  </ActionButton>
                  <ActionButton variant="primary" size={62} onPress={handleSwipeRight}>
                    <HeartIcon size={30} color="white" />
                  </ActionButton>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16, textAlign: 'center' }}>
                <div style={{ width: 96, height: 96, borderRadius: 28, background: `linear-gradient(135deg, ${activeStyle.c1}, ${activeStyle.c2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 40px ${activeStyle.c1}55` }}>
                  <span style={{ fontSize: 44 }}>{activeStyle.emoji}</span>
                </div>
                <span className="animate-pop" style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>No more profiles</span>
                <span style={{ fontSize: 14, color: '#6B6B6B', maxWidth: 280 }}>
                  You&apos;ve seen everyone into {activeInterest}. Try another interest or refresh.
                </span>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={backToGrid} className="glass" style={{ padding: '12px 24px', borderRadius: 9999, border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                    Back to Explore
                  </button>
                  <button onClick={load} style={{ padding: '12px 24px', borderRadius: 9999, border: 'none', background: 'linear-gradient(135deg, #FF375F, #FF3B30)', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 6px 24px rgba(255,55,95,0.4)' }}>
                    Refresh
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ===== Interest grid ===== */
          <div className="animate-fade-up" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <h1 style={{ fontSize: isMobile ? 26 : 30, fontWeight: 800, color: 'white', margin: 0, letterSpacing: 0.5 }}>
                Explore<span style={{ color: '#FF375F' }}>.</span>
              </h1>
              <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 9999 }}>
                <span style={{ width: 8, height: 8, borderRadius: 9999, background: '#34C759', boxShadow: '0 0 10px #34C759' }} />
                <span style={{ color: '#ABABAB', fontSize: 13, fontWeight: 600 }}>{totalPeople} people</span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#6B6B6B', margin: '0 0 16px' }}>
              Pick an interest to find people who share it.
            </p>

            <div className="glass lift" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', borderRadius: 16, marginBottom: 18 }}>
              <SearchIcon size={18} color="#6B6B6B" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search interests..."
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: 14, padding: '13px 0' }}
              />
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 18 }}>
                <div style={{ width: 56, height: 56, borderRadius: 18, border: '3px solid rgba(255,55,95,0.2)', borderTopColor: '#FF375F', animation: 'spin 0.8s linear infinite' }} />
                <span className="neon-text" style={{ fontSize: 16, fontWeight: 700 }}>Finding people...</span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {INTEREST_OPTIONS.filter(it => it.toLowerCase().includes(search.trim().toLowerCase())).map((interest) => {
                  const style = interestStyle(interest);
                  const members = groups[interest] || [];
                  const count = members.length;
                  const cover = members[0]?.photos?.[0];
                  return (
                    <button
                      key={interest}
                      onClick={() => openInterest(interest)}
                      className="lift"
                      style={{
                        position: 'relative', borderRadius: 20, overflow: 'hidden', border: 'none', cursor: 'pointer', padding: 0,
                        aspectRatio: '4 / 5', background: `linear-gradient(160deg, ${style.c1}, ${style.c2})`, textAlign: 'left',
                      }}
                    >
                      {cover && (
                        <img src={cover} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      <div style={{ position: 'absolute', inset: 0, background: cover ? 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.62) 100%)' : 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%)' }} />
                      {count > 0 && (
                        <div style={{ position: 'absolute', top: 12, right: 12, padding: '4px 10px', borderRadius: 9999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', fontSize: 12, fontWeight: 800, color: 'white' }}>
                          {count}
                        </div>
                      )}
                      <div style={{ position: 'absolute', left: 14, right: 14, bottom: 14 }}>
                        <div style={{ fontSize: 26, lineHeight: 1 }}>{style.emoji}</div>
                        <div style={{ fontSize: 19, fontWeight: 800, color: 'white', marginTop: 8, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{interest}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginTop: 3, textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
                          {count > 0 ? `${count} ${count === 1 ? 'person' : 'people'}` : 'No one yet'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {!loading && totalPeople === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 24, textAlign: 'center' }}>
                <span style={{ fontSize: 14, color: '#6B6B6B', maxWidth: 300 }}>
                  No profiles are available right now. Check back soon.
                </span>
                <button onClick={load} className="glass" style={{ padding: '12px 26px', borderRadius: 9999, border: '1px solid rgba(255,255,255,0.12)', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RefreshIcon size={16} color="#FF6B8A" />
                    Refresh
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {isMobile && <TabBar />}
      </GradientBackground>
    </DesktopLayout>
  );
}
