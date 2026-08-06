'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { HeartIcon, CloseIcon, StarIcon, FlashIcon, RefreshIcon } from '@/components/Icons';
import AnimatedCard from '@/components/AnimatedCard';
import ActionButton from '@/components/ActionButton';
import GradientBackground from '@/components/GradientBackground';
import TabBar from '@/components/TabBar';
import DesktopLayout from '@/components/DesktopLayout';
import { useAuth } from '@/store/AuthContext';
import { userService, storageService } from '@/lib/appwrite/services';
import { account } from '@/lib/appwrite/config';

export default function DiscoverPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<any[]>([]);

  const [lastAction, setLastAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    if (!profile || !account) return;
    setLoading(true);
    try {
      const [docs, likedIds] = await Promise.all([
        userService.getDiscoverUsers((profile as any).$id, {
          gender: profile.interestedIn || 'both',
          minAge: 18,
          maxAge: 60,
        }),
        userService.getLikedUserIds((profile as any).$id).catch(() => [] as string[]),
      ]);
      const likedSet = new Set(likedIds);
      const filtered = docs.filter((d: any) => !likedSet.has(d.$id));
      const photoIds = [...new Set(filtered.flatMap((d: any) => d.photos || []))];
      if (photoIds.length > 0) {
        try {
          await fetch('/api/storage/ensure-public-read/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileIds: photoIds }),
          });
        } catch {}
      }
      const mapped = filtered.map((d: any) => ({
        id: d.$id,
        photos: (d.photos || []).map((fid: string) => storageService.getFilePreview(fid)),
        fullName: d.fullName || '',
        age: d.age || 0,
        bio: d.bio || '',
        city: d.city || '',
      })).filter((u: any) => u.photos.length > 0);
      setUsers(mapped);
    } catch {}
    setLoading(false);
  }, [profile]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

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
    setLastAction('like');
    const liked = users[0];
    if (liked && account) {
      try {
        await userService.likeUser((profile as any).$id, liked.id);
        const mutual = await userService.isMutualMatch((profile as any).$id, liked.id);
        if (mutual) setLastAction('match');
      } catch {}
    }
    setTimeout(() => { setLastAction(null); nextUser(); }, 300);
  }, [users, profile, nextUser]);

  const handleSuperLike = useCallback(async () => {
    setLastAction('superlike');
    const liked = users[0];
    if (liked && account) {
      try {
        await userService.likeUser((profile as any).$id, liked.id);
      } catch {}
    }
    setTimeout(() => { setLastAction(null); nextUser(); }, 300);
  }, [users, profile, nextUser]);

  const handleReload = useCallback(() => {
    loadUsers();
  }, [loadUsers]);

  const handleInfo = useCallback((user: any) => {
    alert(`${user.fullName}\n${user.bio}\n\n📍 ${user.city}`);
  }, []);

  if (loading) {
    return (
      <DesktopLayout>
        <GradientBackground style={{ minHeight: '100vh' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', gap: 18 }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, border: '3px solid rgba(255,55,95,0.2)', borderTopColor: '#FF375F', animation: 'spin 0.8s linear infinite' }} />
            <span className="neon-text" style={{ fontSize: 16, fontWeight: 700 }}>Loading profiles...</span>
          </div>
          <TabBar />
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
          <TabBar />
        </GradientBackground>
      </DesktopLayout>
    );
  }

  const current = users[0];

  return (
    <DesktopLayout>
      <GradientBackground style={{ minHeight: '100vh', padding: '24px 16px 110px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: 'white', margin: 0, letterSpacing: 0.5 }}>
              Discover<span style={{ color: '#FF375F' }}>.</span>
            </h1>
            <p style={{ fontSize: 14, color: '#6B6B6B', margin: '4px 0 0' }}>
              {users.length > 0 ? `${users.length} profiles ready for you` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="glass" style={{ padding: '8px 14px', borderRadius: 9999, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 9999, background: '#34C759', boxShadow: '0 0 10px #34C759' }} />
              <span style={{ color: '#ABABAB', fontSize: 13, fontWeight: 600 }}>Live</span>
            </div>
            <button
              onClick={handleReload}
              className="glass lift"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', borderRadius: 9999,
                color: '#D0D0D0', fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RefreshIcon size={16} color="#FF6B8A" />
              Refresh
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
            <div style={{ position: 'relative', width: 400, minHeight: 540, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                position: 'absolute', inset: -20, borderRadius: 40,
                background: 'radial-gradient(circle, rgba(255,55,95,0.14) 0%, rgba(124,77,255,0.1) 45%, transparent 70%)',
                filter: 'blur(10px)',
              }} />
              {users.slice(0, 3).reverse().map((user, index) => (
                <AnimatedCard
                  key={user.id}
                  user={user}
                  isFirst={index === users.slice(0, 3).length - 1}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  onSuperLike={handleSuperLike}
                  onInfoPress={() => handleInfo(user)}
                />
              ))}
            </div>

            <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
              <ActionButton variant="secondary" size={46} onPress={handleReload}>
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
              <ActionButton variant="boost" size={46} onPress={() => {}}>
                <FlashIcon size={20} color="white" />
              </ActionButton>
            </div>

            {lastAction && (
              <div className="animate-pop" style={{ animation: lastAction === 'match' ? 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' : 'fadeUp 0.3s ease' }}>
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
          </div>

          {current && (
            <div className="glass animate-fade-up" style={{ flex: '1 1 300px', minWidth: 260, maxWidth: 400, padding: 24, borderRadius: 24, alignSelf: 'flex-start', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: 0, lineHeight: '34px' }}>
                {current.fullName}
                <span style={{ fontWeight: 400, color: '#ABABAB', marginLeft: 10 }}>{current.age}</span>
              </h2>

              {current.city && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF6B8A" strokeWidth="2">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span style={{ color: '#ABABAB', fontSize: 14 }}>{current.city}</span>
                </div>
              )}

              <div style={{ marginTop: 18, padding: '16px 18px', borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontSize: 15, color: '#D0D0D0', lineHeight: '24px', margin: 0 }}>
                  {current.bio || 'No bio yet'}
                </p>
              </div>

              {current.photos && current.photos.length > 1 && (
                <div style={{ marginTop: 20 }}>
                  <p style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 10, fontWeight: 700, letterSpacing: 1 }}>GALLERY</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {current.photos.slice(1, 4).map((url: string, i: number) => (
                      <div key={i} className="lift" style={{
                        width: 96, height: 116, borderRadius: 14, overflow: 'hidden',
                        backgroundColor: '#16161C', border: '1px solid rgba(255,255,255,0.08)',
                        cursor: 'pointer',
                      }}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p style={{ fontSize: 12, color: '#4A4A4A', marginTop: 22, fontStyle: 'italic' }}>
                Drag the card or use the buttons below to respond
              </p>
            </div>
          )}
        </div>
      </div>
      <TabBar />
      </GradientBackground>
    </DesktopLayout>
  );
}
