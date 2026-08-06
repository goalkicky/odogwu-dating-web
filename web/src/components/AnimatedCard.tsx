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
  width?: React.CSSProperties['width'];
  height?: React.CSSProperties['height'];
}

export default function AnimatedCard({
  user,
  isFirst,
  onSwipeLeft,
  onSwipeRight,
  onSuperLike,
  width,
  height,
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

  const cardStyle: React.CSSProperties = {
    width: width || '90%',
    maxWidth: width ? undefined : '400px',
    height: height || '540px',
    borderRadius: '28px',
    backgroundColor: '#16161C',
    position: 'absolute',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 18px 60px rgba(0,0,0,0.55), 0 0 40px rgba(255,55,95,0.08)',
  };

  if (!isFirst) {
    return (
      <div
        style={{
          ...cardStyle,
          transform: 'scale(0.95) translateY(8px)',
          opacity: 0.8,
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ width: '100%', height: '100%', position: 'relative', backgroundColor: '#1A1A1A' }} />
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
        ...cardStyle,
        transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease',
        cursor: 'grab',
        userSelect: 'none',
      }}
    >
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
    </div>
  );
}
