'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { HeartIcon, CloseIcon, StarIcon, RefreshIcon } from '@/components/Icons';
import AnimatedCard from '@/components/AnimatedCard';
import ActionButton from '@/components/ActionButton';
import GradientBackground from '@/components/GradientBackground';
import TabBar from '@/components/TabBar';
import DesktopLayout from '@/components/DesktopLayout';
import { useMobile } from '@/lib/useMediaQuery';
import { useAuth } from '@/store/AuthContext';
import { userService, storageService } from '@/lib/appwrite/services';
import { account } from '@/lib/appwrite/config';

export default function DiscoverPage() {
  const { profile } = useAuth();
  const isMobile = useMobile();
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
        <div style={{ display: 'flex', flexDirection: 'column', height: isMobile ? '100%' : 'auto', gap: 0 }}>
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
                onClick={handleReload}
                className="glass lift"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px', borderRadius: 9999,
                  color: '#D0D0D0', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RefreshIcon size={16} color="#FF6B8A" />
                Refresh
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
            </div>
          </div>
        </div>
        {isMobile && <TabBar />}
      </GradientBackground>
    </DesktopLayout>
  );
}
