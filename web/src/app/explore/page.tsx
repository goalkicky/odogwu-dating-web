'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { ChevronBackIcon, RefreshIcon, CameraIcon, PlusIcon, GridIcon } from '@/components/Icons';
import GradientBackground from '@/components/GradientBackground';
import TabBar from '@/components/TabBar';
import DesktopLayout from '@/components/DesktopLayout';
import SuperlikeUpsellModal from '@/components/SuperlikeUpsellModal';
import LikeUpsellModal from '@/components/LikeUpsellModal';
import { useMobile } from '@/lib/useMediaQuery';
import { useAuth } from '@/store/AuthContext';
import { userService, storageService, superlikeService, likeService, feedService } from '@/lib/cloudflare/services';
import { account } from '@/lib/cloudflare/config';
import { INTEREST_CATEGORIES, InterestCategory } from '@/lib/interests';
import PostCard from '@/components/PostCard';
import CommentSheet from '@/components/CommentSheet';
import CreatePostModal from '@/components/CreatePostModal';
import FeedProfileModal from '@/components/FeedProfileModal';
import { FeedPost } from '@/lib/types';

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
  const [deck, setDeck] = useState<ExploreUser[]>([]);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [superlikes, setSuperlikes] = useState<any>({ remaining: 0, dailyLimit: 0, refillsAt: '', isPremium: false });
  const [showSuperlikeUpsell, setShowSuperlikeUpsell] = useState(false);
  const [likes, setLikes] = useState<any>({ remaining: 0, used: 0, dailyLimit: 0, refillsAt: '', isPremium: false });
  const [showLikeUpsell, setShowLikeUpsell] = useState(false);

  // Feed state
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedCursor, setFeedCursor] = useState<string | null>(null);
  const [feedHasMore, setFeedHasMore] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [commentPost, setCommentPost] = useState<FeedPost | null>(null);
  const [showInterestRestriction, setShowInterestRestriction] = useState(false);
  const [profileModal, setProfileModal] = useState<{ userId: string; userName: string; userPhoto: string } | null>(null);
  const [postCounts, setPostCounts] = useState<Record<string, number>>({});

  // Total posts published under a category (category tag + any of its interests)
  const categoryPostCount = useCallback((category: InterestCategory) => {
    return (
      (postCounts[category.label] || 0) +
      category.items.reduce((sum, it) => sum + (postCounts[it] || 0), 0)
    );
  }, [postCounts]);

  const handleOpenCreatePost = useCallback(() => {
    if (!activeCategory) return;
    const userInterests: string[] = (profile as any)?.interests || [];
    const hasCategoryInterest = activeCategory.items.some(it => userInterests.includes(it));
    if (!hasCategoryInterest) {
      setShowInterestRestriction(true);
      return;
    }
    setShowCreatePost(true);
  }, [activeCategory, profile]);

  const loadFeed = useCallback(async (cursor?: string) => {
    if (!activeCategory) return;
    setFeedLoading(true);
    try {
      const data = await feedService.getFeed([activeCategory.label, ...activeCategory.items], cursor);
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
  }, [activeCategory]);

  useEffect(() => {
    if (activeCategory) {
      loadFeed();
    } else {
      setFeedPosts([]);
      setFeedCursor(null);
      setFeedHasMore(true);
    }
  }, [activeCategory, loadFeed]);

  const loadMoreFeed = useCallback(() => {
    if (feedCursor && feedHasMore && !feedLoading) {
      loadFeed(feedCursor);
    }
  }, [feedCursor, feedHasMore, feedLoading, loadFeed]);

  const handlePostCreated = useCallback(() => {
    setShowCreatePost(false);
    if (activeCategory) {
      setPostCounts(prev => ({ ...prev, [activeCategory.label]: (prev[activeCategory.label] || 0) + 1 }));
    }
    loadFeed();
  }, [activeCategory, loadFeed]);

  const handlePostDeleted = useCallback((postId: string) => {
    const removed = feedPosts.find(p => p.id === postId);
    setFeedPosts(prev => prev.filter(p => p.id !== postId));
    if (removed?.interest) {
      setPostCounts(prev => ({ ...prev, [removed.interest as string]: Math.max(0, (prev[removed.interest as string] || 0) - 1) }));
    }
  }, [feedPosts]);

  const handleLikeToggle = useCallback(() => {}, []);

  const handleSaveToggle = useCallback(() => {}, []);

  const handleCommentAdded = useCallback((postId: string) => {
    setFeedPosts(prev => prev.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
  }, []);

  const handleProfileClick = useCallback((userId: string, userName: string, userPhoto: string) => {
    if (userId === (profile as any)?.$id) return;
    setProfileModal({ userId, userName, userPhoto });
  }, [profile]);

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

  const loadPostCounts = useCallback(() => {
    const keys = INTEREST_CATEGORIES.flatMap(c => [c.label, ...c.items]);
    feedService.getPostCounts(keys).then(setPostCounts).catch(() => {});
  }, []);

  useEffect(() => { loadPostCounts(); }, [loadPostCounts]);

  const backToCategories = useCallback(() => {
    setActiveCategory(null);
    setDeck([]);
    setLastAction(null);
    loadPostCounts();
  }, [loadPostCounts]);

  // Clicking a category goes straight to that category's feed
  const openCategory = useCallback((category: InterestCategory) => {
    setActiveCategory(category);
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
      removeSwiped(rejected.id);
      // Fire API call in background — don't await
      userService.likeExists((profile as any).$id, rejected.id).catch(() => {});
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
      removeSwiped(liked.id);
      // Fire API calls in background — don't await
      userService.likeUser((profile as any).$id, liked.id).then((res) => {
        if (res && typeof res.remaining === 'number') setLikes(res);
        return userService.isMutualMatch((profile as any).$id, liked.id);
      }).then((mutual) => {
        if (mutual) setLastAction('match');
      }).catch((e) => {
        if (e?.status === 402 || e?.code === 'NO_LIKES' || String(e?.message || '').includes('like')) {
          setShowLikeUpsell(true);
        }
      });
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
      removeSwiped(liked.id);
      // Fire API call in background — don't await
      superlikeService.send(liked.id).then((res) => {
        setSuperlikes(res);
        if (res.mutual) setLastAction('match');
      }).catch((e) => {
        if (e?.status === 402 || e?.code === 'NO_SUPERLIKES' || String(e?.message || '').includes('super like')) {
          setShowLikeUpsell(true);
        }
      });
    }
    setTimeout(() => { setLastAction(null); advance(); }, 300);
  }, [current, superlikes, removeSwiped, advance]);

  const totalPeople = users.length;

  return (
    <DesktopLayout>
      <GradientBackground
        style={{
          minHeight: '100svh',
          padding: isMobile ? '18px 16px 110px' : '24px 16px 60px',
        }}
      >
        {activeCategory ? (
          /* ===== Feed timeline for the selected category ===== */
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
                  Posts published under {activeCategory.label}.
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
                onClick={handleOpenCreatePost}
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
                  Be the first to share something in {activeCategory.label}.
                </span>
                <button
                  onClick={handleOpenCreatePost}
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
                    onProfileClick={handleProfileClick}
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
              Pick a category to see its feed.
            </p>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: 18 }}>
                <div style={{ width: 56, height: 56, borderRadius: 18, border: '3px solid rgba(255,55,95,0.2)', borderTopColor: '#FF375F', animation: 'spin 0.8s linear infinite' }} />
                <span className="neon-text" style={{ fontSize: 16, fontWeight: 700 }}>Finding people...</span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {INTEREST_CATEGORIES.map((category) => {
                  const posts = categoryPostCount(category);
                  const bg = `/categories/${encodeURIComponent(category.label)}.jpeg`;
                  return (
                    <button
                      key={category.label}
                      onClick={() => openCategory(category)}
                      className="lift"
                      style={{
                        position: 'relative', borderRadius: 20, overflow: 'hidden', border: 'none', cursor: 'pointer', padding: 0,
                        aspectRatio: '4 / 5', background: `linear-gradient(160deg, ${category.c1}, ${category.c2})`, textAlign: 'left',
                      }}
                    >
                      <img src={bg} alt={category.label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.62) 100%)' }} />
                      <div style={{ position: 'absolute', left: 14, right: 14, bottom: 14 }}>
                        <div style={{ fontSize: 26, lineHeight: 1 }}>{category.emoji}</div>
                        <div style={{ fontSize: 19, fontWeight: 800, color: 'white', marginTop: 8, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{category.label}</div>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginTop: 3, textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
                          {posts > 0 ? `${posts} ${posts === 1 ? 'post' : 'posts'}` : 'No posts yet'}
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

        {showCreatePost && activeCategory && (
          <CreatePostModal
            currentUserId={(profile as any)?.$id || ''}
            category={activeCategory.label}
            onClose={() => setShowCreatePost(false)}
            onPostCreated={handlePostCreated}
          />
        )}

        {showInterestRestriction && activeCategory && (
          <div onClick={() => setShowInterestRestriction(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)', padding: 16 }}>
            <div onClick={(e) => e.stopPropagation()} className="feed-sheet-up" style={{ width: '100%', maxWidth: 380, background: 'rgba(16,16,22,0.97)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)', padding: '32px 24px', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(255,55,95,0.15), rgba(124,77,255,0.12))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '1px solid rgba(255,55,95,0.2)' }}>
                <span style={{ fontSize: 28 }}>🔒</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'white', margin: '0 0 10px' }}>Category Locked</h3>
              <p style={{ fontSize: 14, color: '#6B6B6B', margin: '0 0 24px', lineHeight: 1.5 }}>
                You can&apos;t post in <span style={{ color: '#FF375F', fontWeight: 700 }}>{activeCategory.label}</span> because you haven&apos;t added any of its interests to your profile yet.
              </p>
              <button
                onClick={() => setShowInterestRestriction(false)}
                style={{
                  width: '100%', padding: '12px 0', borderRadius: 14, border: 'none',
                  background: 'linear-gradient(135deg, #FF375F, #FF3B30)',
                  color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 6px 24px rgba(255,55,95,0.4)',
                }}
              >
                Got it
              </button>
            </div>
          </div>
        )}

        {profileModal && (
          <FeedProfileModal
            userId={profileModal.userId}
            userName={profileModal.userName}
            userPhoto={profileModal.userPhoto}
            currentUserId={(profile as any)?.$id || ''}
            onClose={() => setProfileModal(null)}
          />
        )}
      </GradientBackground>
    </DesktopLayout>
  );
}
