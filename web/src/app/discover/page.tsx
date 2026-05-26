'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { FlameIcon, HeartIcon, CloseIcon, StarIcon, FlashIcon, RefreshIcon } from '@/components/Icons';
import AnimatedCard from '@/components/AnimatedCard';
import ActionButton from '@/components/ActionButton';
import GradientBackground from '@/components/GradientBackground';
import TabBar from '@/components/TabBar';
import { useAuth } from '@/store/AuthContext';
import { userService, storageService } from '@/lib/appwrite/services';
import { account } from '@/lib/appwrite/config';

export default function DiscoverPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [jwt, setJwt] = useState('');
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    if (!profile || !account) return;
    setLoading(true);
    try {
      const token = await account.createJWT().then(r => r.jwt).catch(() => '');
      setJwt(token);
      const docs = await userService.getDiscoverUsers((profile as any).$id, {
        gender: profile.interestedIn || 'both',
        minAge: 18,
        maxAge: 60,
      });
      const mapped = docs.map((d: any) => ({
        id: d.$id,
        photos: (d.photos || []).map((fid: string) => storageService.getFilePreview(fid, token || undefined)),
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
      <GradientBackground style={{ height: '100dvh', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
          <span style={{ color: '#ABABAB', fontSize: 16 }}>Loading profiles...</span>
        </div>
        <TabBar />
      </GradientBackground>
    );
  }

  if (users.length === 0) {
    return (
      <GradientBackground style={{ height: '100dvh', overflow: 'hidden' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', gap: 16 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"/>
          </svg>
          <span style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>No more profiles</span>
          <button onClick={loadUsers} style={{ background: 'none', border: 'none', color: '#FF375F', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Refresh</button>
        </div>
        <TabBar />
      </GradientBackground>
    );
  }

  return (
    <div style={{ height: '100dvh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #1A0000, #2D0000, #1A0000)', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '48px 20px 6px' }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #FF375F, #FF3B30)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FlameIcon size={18} color="white" />
        </div>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>Discover</span>
        <div style={{ width: 32 }} />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 0, padding: '4px 0' }}>
        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
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
      </div>

      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '6px 20px 100px' }}>
        <ActionButton variant="secondary" size={48} onPress={handleReload}>
          <RefreshIcon size={20} color="#FFD700" />
        </ActionButton>
        <ActionButton variant="danger" size={60} onPress={handleSwipeLeft}>
          <CloseIcon size={28} color="white" />
        </ActionButton>
        <ActionButton variant="superlike" size={48} onPress={handleSuperLike}>
          <StarIcon size={20} color="white" />
        </ActionButton>
        <ActionButton variant="primary" size={60} onPress={handleSwipeRight}>
          <HeartIcon size={28} color="white" />
        </ActionButton>
        <ActionButton variant="boost" size={48} onPress={() => {}}>
          <FlashIcon size={20} color="white" />
        </ActionButton>
      </div>

      {lastAction && (
        <div style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', background: lastAction === 'match' ? 'linear-gradient(135deg, #FF375F, #FF3B30)' : 'rgba(255,255,255,0.08)', padding: '8px 20px', borderRadius: 9999, zIndex: 100 }}>
          <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>
            {lastAction === 'match' ? "It's a Match!" : lastAction === 'like' ? 'Liked!' : lastAction === 'dislike' ? 'Nope' : 'Super Like!'}
          </span>
        </div>
      )}

      <TabBar />
    </div>
  );
}
