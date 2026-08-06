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

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (!isFirst) return;
    setDragStart({ x: clientX, y: clientY });
    setIsDragging(true);
  }, [isFirst]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!dragStart || !isDragging) return;
    const dx = clientX - dragStart.x;
    const dy = clientY - dragStart.y;
    setOffset({ x: dx, y: dy });
  }, [dragStart, isDragging]);

  const handleDragEnd = useCallback(() => {
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

  const handleMouseDown = useCallback((e: React.MouseEvent) => handleDragStart(e.clientX, e.clientY), [handleDragStart]);
  const handleMouseMove = useCallback((e: React.MouseEvent) => handleDragMove(e.clientX, e.clientY), [handleDragMove]);
  const handleMouseUp = useCallback(() => handleDragEnd(), [handleDragEnd]);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
  }, [handleDragStart]);
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
  }, [handleDragMove]);
  const handleTouchEnd = useCallback(() => handleDragEnd(), [handleDragEnd]);

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
          height: '540px',
          borderRadius: '28px',
          backgroundColor: '#16161C',
          position: 'absolute',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          transform: `scale(${0.95 - (3 - 1) * 0.03}) translateY(${(3 - 1) * 8}px)`,
          opacity: 0.8,
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{ width: '100%', height: '74%', position: 'relative', backgroundColor: '#1A1A1A' }} />
        <div style={{ padding: '16px', paddingTop: '24px' }}>
          <div style={{ height: '28px', width: '60%', backgroundColor: '#2A2A2A', borderRadius: '6px', marginBottom: '8px' }} />
          <div style={{ height: '16px', width: '80%', backgroundColor: '#242424', borderRadius: '6px' }} />
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
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        width: '90%',
        maxWidth: '400px',
        height: '540px',
        borderRadius: '28px',
        backgroundColor: '#16161C',
        position: 'absolute',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 18px 60px rgba(0,0,0,0.55), 0 0 40px rgba(255,55,95,0.08)',
        transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease',
        cursor: 'grab',
        userSelect: 'none',
      }}
    >
      <div style={{ width: '100%', height: '74%', position: 'relative' }}>
        <img
          src={photoUri}
          alt={user.fullName}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          draggable={false}
        />

        {/* Soft top + bottom gradient overlays */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 90, background: 'linear-gradient(rgba(0,0,0,0.5), transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 150, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))' }} />

        {/* Photo progress bars */}
        <div style={{ position: 'absolute', top: '14px', left: '12px', right: '12px', display: 'flex', gap: '5px' }}>
          {user.photos?.slice(0, 5).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPhotoIndex(i)}
              style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                backgroundColor: i === currentPhotoIndex ? 'white' : 'rgba(255,255,255,0.35)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                boxShadow: i === currentPhotoIndex ? '0 0 8px rgba(255,255,255,0.8)' : 'none',
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </div>

        {likeOpacity > 0.1 && (
          <div style={{ position: 'absolute', top: '70px', left: '24px', transform: 'rotate(-15deg)', opacity: likeOpacity, animation: 'popIn 0.3s ease' }}>
            <div style={{ padding: '8px 18px', borderRadius: '10px', border: '3px solid white', background: 'linear-gradient(135deg, #34C759, #30D158)', boxShadow: '0 0 24px rgba(52,199,89,0.7)' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: '28px', letterSpacing: '2px' }}>LIKE</span>
            </div>
          </div>
        )}
        {nopeOpacity > 0.1 && (
          <div style={{ position: 'absolute', top: '70px', right: '24px', transform: 'rotate(15deg)', opacity: nopeOpacity, animation: 'popIn 0.3s ease' }}>
            <div style={{ padding: '8px 18px', borderRadius: '10px', border: '3px solid white', background: 'linear-gradient(135deg, #FF3B30, #FF453A)', boxShadow: '0 0 24px rgba(255,59,48,0.7)' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: '28px', letterSpacing: '2px' }}>NOPE</span>
            </div>
          </div>
        )}
        {superLikeOpacity > 0.1 && (
          <div style={{ position: 'absolute', top: '140px', left: '50%', transform: 'translateX(-50%)', opacity: superLikeOpacity, animation: 'popIn 0.3s ease' }}>
            <div style={{ padding: '8px 18px', borderRadius: '10px', border: '3px solid white', background: 'linear-gradient(135deg, #4FC3F7, #0288D1)', boxShadow: '0 0 24px rgba(79,195,247,0.7)' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: '24px', letterSpacing: '2px' }}>SUPER LIKE</span>
            </div>
          </div>
        )}

        {/* Name + age pinned to bottom of photo */}
        <div style={{ position: 'absolute', bottom: 14, left: 20, right: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '30px', fontWeight: 800, color: '#FFFFFF', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>{user.fullName}</span>
              <span style={{ fontSize: '26px', fontWeight: 400, color: '#D0D0D0' }}>{user.age}</span>
            </div>
            {user.city && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C0C0C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <span style={{ color: '#C0C0C0', fontSize: '13px' }}>{user.city}</span>
              </div>
            )}
          </div>
          <button onClick={onInfoPress} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)', cursor: 'pointer', padding: 8, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.35)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/><circle cx="12" cy="12" r="10"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Bio panel */}
      <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(180deg, #16161C, #101014)' }}>
        {user.bio && (
          <p style={{ color: '#ABABAB', fontSize: '14px', margin: 0, lineHeight: '21px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.bio}
          </p>
        )}
        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#6B6B6B', letterSpacing: 0.5, padding: '4px 10px', borderRadius: 9999, border: '1px solid rgba(255,255,255,0.1)' }}>
            {user.photos?.length || 1} PHOTOS
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#FF6B8A', letterSpacing: 0.5, padding: '4px 10px', borderRadius: 9999, border: '1px solid rgba(255,55,95,0.3)', background: 'rgba(255,55,95,0.08)' }}>
            {user.city ? `${user.city} AREA` : 'ONLINE'}
          </span>
        </div>
      </div>
    </div>
  );
}
