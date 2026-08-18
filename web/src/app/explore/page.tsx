'use client';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ChevronBackIcon, RefreshIcon, HeartIcon, CloseIcon, StarIcon, SearchIcon, CameraIcon, PlusIcon, GlobeIcon, PeopleIcon, GridIcon } from '@/components/Icons';
import AnimatedCard from '@/components/AnimatedCard';
import ActionButton from '@/components/ActionButton';
import GradientBackground from '@/components/GradientBackground';
import TabBar from '@/components/TabBar';
import DesktopLayout from '@/components/DesktopLayout';
import SuperlikeUpsellModal from '@/components/SuperlikeUpsellModal';
import LikeUpsellModal from '@/components/LikeUpsellModal';
import { useMobile } from '@/lib/useMediaQuery';
import { useAuth } from '@/store/AuthContext';
import { userService, storageService, superlikeService, likeService, feedService } from '@/lib/cloudflare/services';
import { account } from '@/lib/cloudflare/config';
import { INTEREST_CATEGORIES, interestCategory, InterestCategory } from '@/lib/interests';
import PostCard from '@/components/PostCard';
import CommentSheet from '@/components/CommentSheet';
import CreatePostModal from '@/components/CreatePostModal';
import { FeedPost } from '@/lib/types';

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
  const match = INTEREST_STYLE[interest] || interestCategory(interest);
  return match || { emoji: '🌟', c1: '#7C4DFF', c2: '#FF375F' };
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
  const [activeCategory, setActiveCategory] = useState<InterestCategory | null>(null);
  const [activeInterest, setActiveInterest] = useState<string | null>(null);
  const [deck, setDeck] = useState<ExploreUser[]>([]);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [superlikes, setSuperlikes] = useState<any>({ remaining: 0, dailyLimit: 0, refillsAt: '', isPremium: false });
  const [showSuperlikeUpsell, setShowSuperlikeUpsell] = useState(false);
  const [likes, setLikes] = useState<any>({ remaining: 0, used: 0, dailyLimit: 0, refillsAt: '', isPremium: false });
  const [showLikeUpsell, setShowLikeUpsell] = useState(false);

  // Feed state
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedCursor, setFeedCursor] = useState<string | null>(null);
  const [feedHasMore, setFeedHasMore] = useState(true);
  const [feedFilter, setFeedFilter] = useState<'all' | 'public' | 'friends'>('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [commentPost, setCommentPost] = useState<FeedPost | null>(null);

  const loadFeed = useCallback(async (cursor?: string, filter?: 'all' | 'public' | 'friends') => {
    setFeedLoading(true);
    try {
      const visibility = filter === 'all' ? undefined : filter === 'public' ? 'public' as const : 'friends' as const;
      const data = await feedService.getFeed(cursor, visibility);
      const docs = (data?.documents || []) as FeedPost[];
      if (cursor) {
        setFeedPosts(prev => [...prev, ...docs]);
      } else {
        setFeedPosts(docs);
      }
      setFeedCursor(data?.cursor || null);
      setFeedHasMore(docs.length >= 10);
    } catch {}
    setFeedLoading(false);
  }, []);

  useEffect(() => { loadFeed(undefined, feedFilter); }, [feedFilter, loadFeed]);

  const loadMoreFeed = useCallback(() => {
    if (feedCursor && feedHasMore && !feedLoading) {
      loadFeed(feedCursor, feedFilter);
    }
  }, [feedCursor, feedHasMore, feedLoading, feedFilter, loadFeed]);

  const handlePostCreated = useCallback(() => {
    setShowCreatePost(false);
    loadFeed(undefined, feedFilter);
  }, [feedFilter, loadFeed]);

  const handlePostDeleted = useCallback((postId: string) => {
    setFeedPosts(prev => prev.filter(p => p.id !== postId));
  }, []);

  const handleLikeToggle = useCallback(() => {}, []);

  const handleSaveToggle = useCallback(() => {}, []);

  const handleCommentAdded = useCallback((postId: string) => {
    setFeedPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
  }, []);

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

  useEffect(() => {
    superlikeService.getStatus().then(setSuperlikes).catch(() => {});
    likeService.getStatus().then(setLikes).catch(() => {});
  }, []);

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

  const backToCategories = useCallback(() => {
    setActiveCategory(null);
    setActiveInterest(null);
    setDeck([]);
    setLastAction(null);
  }, []);

  const openCategory = useCallback((category: InterestCategory) => {
    setActiveCategory(category);
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
    if (!likes.isPremium && (likes.remaining ?? 0) <= 0) {
      setShowLikeUpsell(true);
      if (liked) removeSwiped(liked.id);
      setTimeout(() => { setLastAction(null); advance(); }, 300);
      return;
    }
    if (liked) {
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
      removeSwiped(liked.id);
    }
    setTimeout(() => { setLastAction(null); advance(); }, 300);
  }, [current, profile, likes, removeSwiped, advance]);

  const handleSuperLike = useCallback(async () => {
    const liked = current;
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
      removeSwiped(liked.id);
    }
    setTimeout(() => { setLastAction(null); advance(); }, 300);
  }, [current, superlikes, removeSwiped, advance]);

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
          /* ===== Feed timeline for a selected interest ===== */
          <div className="animate-fade-up" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <button
                onClick={backToGrid}
                aria-label="Back to interests"
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
                  Timeline of posts about {activeInterest.toLowerCase()}.
                </p>
              </div>
            </div>

            {/* Feed header + create */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <GridIcon size={20} color="#FF375F" />
                <h2 style={{ fontSize: isMobile ? 22 : 24, fontWeight: 800, color: 'white', margin: 0 }}>Feed</h2>
              </div>
              <button
                onClick={() => setShowCreatePost(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 9999, border: 'none',
                  background: 'linear-gradient(135deg, #FF375F, #FF3B30)',
                  color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(255,55,95,0.35)',
                }}
              >
                <PlusIcon size={16} color="white" /> Post
              </button>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
              {([
                { key: 'all' as const, label: 'All', icon: <GridIcon size={14} color={feedFilter === 'all' ? 'white' : '#6B6B6B'} /> },
                { key: 'public' as const, label: 'Public', icon: <GlobeIcon size={14} color={feedFilter === 'public' ? 'white' : '#6B6B6B'} /> },
                { key: 'friends' as const, label: 'Friends', icon: <PeopleIcon size={14} color={feedFilter === 'friends' ? 'white' : '#6B6B6B'} /> },
              ]).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFeedFilter(tab.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 700,
                    background: feedFilter === tab.key ? 'linear-gradient(135deg, rgba(255,55,95,0.2), rgba(124,77,255,0.15))' : 'rgba(255,255,255,0.04)',
                    color: feedFilter === tab.key ? 'white' : '#6B6B6B',
                    boxShadow: feedFilter === tab.key ? 'inset 0 0 0 1px rgba(255,55,95,0.3)' : 'inset 0 0 0 1px rgba(255,255,255,0.06)',
                    transition: 'all 0.2s',
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Feed posts */}
            {feedLoading && feedPosts.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '30vh', gap: 18 }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, border: '3px solid rgba(255,55,95,0.2)', borderTopColor: '#FF375F', animation: 'spin 0.8s linear infinite' }} />
                <span className="neon-text" style={{ fontSize: 14, fontWeight: 700 }}>Loading feed...</span>
              </div>
            ) : feedPosts.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 12, textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: 22, background: 'linear-gradient(135deg, rgba(255,55,95,0.12), rgba(124,77,255,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <CameraIcon size={32} color="#6B6B6B" />
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>No posts yet</span>
                <span style={{ fontSize: 13, color: '#6B6B6B', maxWidth: 280 }}>
                  Be the first to share something about {activeInterest.toLowerCase()}.
                </span>
                <button
                  onClick={() => setShowCreatePost(true)}
                  style={{
                    marginTop: 4, display: 'flex', alignItems: 'center', gap: 8,
                    padding: '12px 24px', borderRadius: 9999, border: 'none',
                    background: 'linear-gradient(135deg, #FF375F, #FF3B30)',
                    color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 6px 24px rgba(255,55,95,0.4)',
                  }}
                >
                  <PlusIcon size={16} color="white" /> Create First Post
                </button>
              </div>
            ) : (
              <div>
                {feedPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={(profile as any)?.$id || ''}
                    onLikeToggle={handleLikeToggle}
                    onSaveToggle={handleSaveToggle}
                    onComment={(p) => setCommentPost(p)}
                    onDelete={handlePostDeleted}
                  />
                ))}
                {feedHasMore && (
                  <button
                    onClick={loadMoreFeed}
                    disabled={feedLoading}
                    style={{
                      width: '100%', padding: '14px 0', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)',
                      background: 'rgba(255,255,255,0.03)', color: '#6B6B6B', fontSize: 13, fontWeight: 600,
                      cursor: feedLoading ? 'default' : 'pointer', opacity: feedLoading ? 0.5 : 1,
                    }}
                  >
                    {feedLoading ? 'Loading...' : 'Load more'}
                  </button>
                )}
              </div>
            )}
          </div>
        ) : activeCategory ? (
          /* ===== Interest grid within a category ===== */
          <div className="animate-fade-up" style={{ maxWidth: 560, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <button
                onClick={backToCategories}
                aria-label="Back to categories"
                className="glass lift"
                style={{ width: 42, height: 42, borderRadius: 9999, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <ChevronBackIcon size={20} color="white" />
              </button>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{activeCategory.emoji}</span>
                  <h1 style={{ fontSize: isMobile ? 24 : 26, fontWeight: 800, color: 'white', margin: 0, letterSpacing: 0.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {activeCategory.label}
                  </h1>
                </div>
                <p style={{ fontSize: 13, color: '#6B6B6B', margin: '2px 0 0' }}>
                  Pick an interest to find people who share it.
                </p>
              </div>
            </div>

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
                {activeCategory.items.filter(it => it.toLowerCase().includes(search.trim().toLowerCase())).map((interest) => {
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
        ) : (
          /* ===== Category grid ===== */
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
              Pick a category to find people who share your interests.
            </p>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 18 }}>
                <div style={{ width: 56, height: 56, borderRadius: 18, border: '3px solid rgba(255,55,95,0.2)', borderTopColor: '#FF375F', animation: 'spin 0.8s linear infinite' }} />
                <span className="neon-text" style={{ fontSize: 16, fontWeight: 700 }}>Finding people...</span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {INTEREST_CATEGORIES.map((category) => {
                  const count = category.items.reduce((sum, it) => sum + (groups[it] || []).length, 0);
                  const firstInterest = category.items.find(it => (groups[it] || []).length > 0);
                  const style = firstInterest ? interestStyle(firstInterest) : category;
                  const cover = firstInterest ? groups[firstInterest]?.[0]?.photos?.[0] : undefined;
                  return (
                    <button
                      key={category.label}
                      onClick={() => openCategory(category)}
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
                        <div style={{ fontSize: 26, lineHeight: 1 }}>{category.emoji}</div>
                        <div style={{ fontSize: 19, fontWeight: 800, color: 'white', marginTop: 8, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{category.label}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginTop: 3, textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
                          {count > 0 ? `${count} ${count === 1 ? 'person' : 'people'}` : `${category.items.length} interests`}
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

        {showSuperlikeUpsell && (
          <SuperlikeUpsellModal onClose={() => setShowSuperlikeUpsell(false)} />
        )}

        {showLikeUpsell && (
          <LikeUpsellModal onClose={() => setShowLikeUpsell(false)} />
        )}

        {commentPost && (
          <CommentSheet
            post={commentPost}
            currentUserId={(profile as any)?.$id || ''}
            onClose={() => setCommentPost(null)}
            onCommentAdded={handleCommentAdded}
          />
        )}

        {showCreatePost && (
          <CreatePostModal
            currentUserId={(profile as any)?.$id || ''}
            onClose={() => setShowCreatePost(false)}
            onPostCreated={handlePostCreated}
          />
        )}
      </GradientBackground>
    </DesktopLayout>
  );
}
