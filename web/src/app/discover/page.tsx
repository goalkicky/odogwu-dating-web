'use client';
import React, { useState, useCallback } from 'react';
import { FlameIcon, HeartIcon, CloseIcon, StarIcon, FlashIcon, RefreshIcon, InfoIcon } from '@/components/Icons';
import AnimatedCard from '@/components/AnimatedCard';
import ActionButton from '@/components/ActionButton';
import GradientBackground from '@/components/GradientBackground';
import TabBar from '@/components/TabBar';

const MOCK_USERS = [
  { id: '1', photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'], fullName: 'Sarah Johnson', age: 26, bio: 'Adventure seeker & coffee addict ☕️', city: 'Lagos, Nigeria' },
  { id: '2', photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'], fullName: 'Michael Chen', age: 28, bio: 'Software engineer by day, chef by night', city: 'Abuja, Nigeria' },
  { id: '3', photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'], fullName: 'Emily Davis', age: 24, bio: 'Music lover & yoga enthusiast 🧘‍♀️', city: 'Port Harcourt, Nigeria' },
  { id: '4', photos: ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400'], fullName: 'James Wilson', age: 30, bio: 'Traveling the world 🌍', city: 'Nairobi, Kenya' },
];

export default function DiscoverPage() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleSwipeLeft = useCallback(() => {
    setLastAction('dislike');
    setTimeout(() => {
      setUsers(prev => {
        const next = prev.slice(1);
        if (next.length === 0) return MOCK_USERS;
        return next;
      });
      setLastAction(null);
    }, 300);
  }, []);

  const handleSwipeRight = useCallback(() => {
    setLastAction('like');
    setTimeout(() => {
      setUsers(prev => {
        const next = prev.slice(1);
        if (next.length === 0) return MOCK_USERS;
        return next;
      });
      setLastAction(null);
    }, 300);
  }, []);

  const handleSuperLike = useCallback(() => {
    setLastAction('superlike');
    setTimeout(() => {
      setUsers(prev => {
        const next = prev.slice(1);
        if (next.length === 0) return MOCK_USERS;
        return next;
      });
      setLastAction(null);
    }, 300);
  }, []);

  const handleReload = useCallback(() => {
    setUsers([...MOCK_USERS].sort(() => Math.random() - 0.5));
  }, []);

  const handleInfo = useCallback((user: any) => {
    alert(`${user.fullName}\n${user.bio}\n\n📍 ${user.city}`);
  }, []);

  return (
    <GradientBackground style={{ minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '60px 20px 12px' }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, #FF375F, #6C63FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FlameIcon size={22} color="white" />
        </div>
        <span style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>Discover</span>
        <div style={{ width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <OptionsIcon size={24} color="#ABABAB" />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 0', position: 'relative', minHeight: '520px' }}>
        {users.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4Z"/>
            </svg>
            <span style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>No more profiles</span>
            <span style={{ fontSize: 16, color: '#ABABAB' }}>Check back later for new people</span>
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '520px' }}>
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
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 20px 40px' }}>
        <ActionButton variant="secondary" size={50} onPress={handleReload}>
          <RefreshIcon size={24} color="#FFD700" />
        </ActionButton>
        <ActionButton variant="danger" size={60} onPress={handleSwipeLeft}>
          <CloseIcon size={30} color="white" />
        </ActionButton>
        <ActionButton variant="superlike" size={50} onPress={handleSuperLike}>
          <StarIcon size={24} color="white" />
        </ActionButton>
        <ActionButton variant="primary" size={60} onPress={handleSwipeRight}>
          <HeartIcon size={30} color="white" />
        </ActionButton>
        <ActionButton variant="boost" size={50} onPress={() => alert('Boost! Get seen by more people!')}>
          <FlashIcon size={24} color="white" />
        </ActionButton>
      </div>

      {lastAction && (
        <div style={{ position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(255,255,255,0.08)', padding: '8px 20px', borderRadius: 9999 }}>
          <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>
            {lastAction === 'like' ? 'Liked!' : lastAction === 'dislike' ? 'Nope' : 'Super Like!'}
          </span>
        </div>
      )}

      <TabBar />
    </GradientBackground>
  );
}

function OptionsIcon({ size, color }: { size?: number; color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
    </svg>
  );
}
