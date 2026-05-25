'use client';
import React, { useRef, useState, useCallback } from 'react';

interface UserCard {
  id: string;
  photos: string[];
  fullName: string;
  age: number;
  bio: string;
  city?: string;
}

interface AnimatedCardProps {
  user: UserCard;
  isFirst: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSuperLike: () => void;
  onInfoPress: () => void;
}

export default function AnimatedCard({
  user,
  isFirst,
  onSwipeLeft,
  onSwipeRight,
  onSuperLike,
  onInfoPress,
}: AnimatedCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isFirst) return;
    setDragStart({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  }, [isFirst]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragStart || !isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setOffset({ x: dx, y: dy });
  }, [dragStart, isDragging]);

  const handleMouseUp = useCallback(() => {
    if (!dragStart) return;
    const dx = offset.x;
    const dy = offset.y;
    if (dx > 120) {
      setOffset({ x: window.innerWidth * 1.5, y: 0 });
      setTimeout(onSwipeRight, 300);
    } else if (dx < -120) {
      setOffset({ x: -window.innerWidth * 1.5, y: 0 });
      setTimeout(onSwipeLeft, 300);
    } else if (dy < -120) {
      setOffset({ x: 0, y: -1000 });
      setTimeout(onSuperLike, 300);
    } else {
      setOffset({ x: 0, y: 0 });
    }
    setIsDragging(false);
    setDragStart(null);
  }, [dragStart, offset, onSwipeLeft, onSwipeRight, onSuperLike]);

  const rotation = offset.x * 0.08;
  const likeOpacity = Math.min(Math.max(offset.x / 100, 0), 1);
  const nopeOpacity = Math.min(Math.max(-offset.x / 100, 0), 1);
  const superLikeOpacity = Math.min(Math.max(-offset.y / 150, 0), 1);

  const photoUri = user.photos?.[currentPhotoIndex] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400';

  if (!isFirst) {
    return (
      <div
        style={{
          width: '90%',
          maxWidth: '400px',
          height: '520px',
          borderRadius: '24px',
          backgroundColor: '#1E1E1E',
          position: 'absolute',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          transform: `scale(${0.95 - (3 - 1) * 0.03}) translateY(${(3 - 1) * 8}px)`,
          opacity: 0.8,
        }}
      >
        <div style={{ width: '100%', height: '72%', position: 'relative', backgroundColor: '#1A1A1A' }} />
        <div style={{ padding: '16px', paddingTop: '24px' }}>
          <div style={{ height: '28px', width: '60%', backgroundColor: '#2A2A2A', borderRadius: '4px', marginBottom: '8px' }} />
          <div style={{ height: '16px', width: '80%', backgroundColor: '#242424', borderRadius: '4px' }} />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        width: '90%',
        maxWidth: '400px',
        height: '520px',
        borderRadius: '24px',
        backgroundColor: '#1E1E1E',
        position: 'absolute',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease',
        cursor: 'grab',
        userSelect: 'none',
      }}
    >
      <div style={{ width: '100%', height: '72%', position: 'relative' }}>
        <img
          src={photoUri}
          alt={user.fullName}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          draggable={false}
        />

        <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', display: 'flex', gap: '4px' }}>
          {user.photos?.slice(0, 5).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPhotoIndex(i)}
              style={{
                flex: 1,
                height: '3px',
                borderRadius: '2px',
                backgroundColor: i === currentPhotoIndex ? 'white' : 'rgba(255,255,255,0.4)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '120px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
          }}
        />

        {likeOpacity > 0.1 && (
          <div style={{ position: 'absolute', top: '60px', left: '20px', transform: 'rotate(-15deg)', opacity: likeOpacity }}>
            <div style={{ padding: '8px 16px', borderRadius: '8px', border: '3px solid white', background: 'linear-gradient(135deg, #34C759, #30D158)' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: '28px', letterSpacing: '2px' }}>LIKE</span>
            </div>
          </div>
        )}
        {nopeOpacity > 0.1 && (
          <div style={{ position: 'absolute', top: '60px', right: '20px', transform: 'rotate(15deg)', opacity: nopeOpacity }}>
            <div style={{ padding: '8px 16px', borderRadius: '8px', border: '3px solid white', background: 'linear-gradient(135deg, #FF3B30, #FF453A)' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: '28px', letterSpacing: '2px' }}>NOPE</span>
            </div>
          </div>
        )}
        {superLikeOpacity > 0.1 && (
          <div style={{ position: 'absolute', top: '120px', alignSelf: 'center', left: '50%', transform: 'translateX(-50%)', opacity: superLikeOpacity }}>
            <div style={{ padding: '8px 16px', borderRadius: '8px', border: '3px solid white', background: 'linear-gradient(135deg, #FF3B30, #FF6B6B)' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: '24px', letterSpacing: '2px' }}>SUPER LIKE</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF' }}>{user.fullName}</span>
          <span style={{ fontSize: '22px', fontWeight: 400, color: '#ABABAB' }}>{user.age}</span>
          <button onClick={onInfoPress} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </button>
        </div>
        {user.bio && (
          <p style={{ color: '#ABABAB', fontSize: '14px', marginTop: '4px', lineHeight: '20px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.bio}
          </p>
        )}
        {user.city && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ABABAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span style={{ color: '#6B6B6B', fontSize: '13px' }}>{user.city}</span>
          </div>
        )}
      </div>
    </div>
  );
}
