'use client';
import React, { useRef, useState, useCallback } from 'react';

interface UserCard {
  id: string;
  photos: string[];
  fullName: string;
  age: number;
  bio: string;
  city?: string;
  distanceKm?: number;
}

interface AnimatedCardProps {
  user: UserCard;
  isFirst: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSuperLike: () => void;
  onOpenProfile?: () => void;
  width?: React.CSSProperties['width'];
  height?: React.CSSProperties['height'];
}

export default function AnimatedCard({
  user,
  isFirst,
  onSwipeLeft,
  onSwipeRight,
  onSuperLike,
  onOpenProfile,
  width,
  height,
}: AnimatedCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const pressPosRef = useRef<{ x: number; y: number } | null>(null);
  const movedRef = useRef(false);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (!isFirst) return;
    const rect = cardRef.current?.getBoundingClientRect();
    pressPosRef.current = rect ? { x: clientX - rect.left, y: clientY - rect.top } : null;
    movedRef.current = false;
    setDragStart({ x: clientX, y: clientY });
    setIsDragging(true);
  }, [isFirst]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!dragStart || !isDragging) return;
    const dx = clientX - dragStart.x;
    const dy = clientY - dragStart.y;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) movedRef.current = true;
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
      // Tap (no drag): left half of the picture -> previous photo, right half -> next photo (Tinder-style)
      if (!movedRef.current && Math.abs(dx) < 8 && Math.abs(dy) < 8 && user.photos.length > 1) {
        const rect = cardRef.current?.getBoundingClientRect();
        const press = pressPosRef.current;
        if (rect && press) {
          if (press.x < rect.width / 2) {
            setCurrentPhotoIndex(i => Math.max(i - 1, 0));
          } else {
            setCurrentPhotoIndex(i => Math.min(i + 1, user.photos.length - 1));
          }
        }
      }
      setOffset({ x: 0, y: 0 });
    }
    setIsDragging(false);
    setDragStart(null);
  }, [dragStart, offset, onSwipeLeft, onSwipeRight, onSuperLike, user.photos]);

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
    boxShadow: '0 18px 60px rgba(0,0,0,0.55), 0 0 40px rgba(255,46,95,0.08)',
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

      {/* Name + age + city overlaid on photo */}
      <div style={{ position: 'absolute', left: 20, right: 20, bottom: 92 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: '#FFFFFF', textShadow: '0 2px 12px rgba(0,0,0,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.fullName}</span>
          <span style={{ fontSize: 24, fontWeight: 400, color: 'rgba(255,255,255,0.95)', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>{user.age}</span>
        </div>
        {user.city && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, textShadow: '0 1px 6px rgba(0,0,0,0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.city}</span>
            {typeof user.distanceKm === 'number' && (
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12.5, textShadow: '0 1px 6px rgba(0,0,0,0.6)', whiteSpace: 'nowrap' }}>
                · {user.distanceKm} km
              </span>
            )}
          </div>
        )}
      </div>

      {/* Photo progress bars */}
      <div style={{ position: 'absolute', top: '14px', left: '12px', right: '12px', display: 'flex', gap: '5px' }}>
        {user.photos?.slice(0, 5).map((_, i) => (
          <button
            key={i}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(i); }}
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

      {onOpenProfile && (
        <button
          aria-label="View full profile"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onOpenProfile(); }}
          style={{
            position: 'absolute', top: '50px', right: '16px', zIndex: 10,
            width: 40, height: 40, borderRadius: 9999,
            background: 'linear-gradient(135deg, rgba(255,46,95,0.6), rgba(180,76,255,0.6))',
            border: '1px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(255,46,95,0.35), 0 0 30px rgba(180,76,255,0.2)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(255,46,95,0.5), 0 0 40px rgba(180,76,255,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,46,95,0.35), 0 0 30px rgba(180,76,255,0.2)'; }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
          </svg>
        </button>
      )}

      {likeOpacity > 0.1 && (
        <div style={{ position: 'absolute', top: '70px', left: '24px', transform: 'rotate(-15deg)', opacity: likeOpacity, animation: 'popIn 0.3s ease' }}>
          <div style={{ padding: '8px 18px', borderRadius: '10px', border: '3px solid white', background: 'linear-gradient(135deg, #3DFC77, #3DFC77)', boxShadow: '0 0 24px rgba(61,252,119,0.7)' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '28px', letterSpacing: '2px' }}>LIKE</span>
          </div>
        </div>
      )}
      {nopeOpacity > 0.1 && (
        <div style={{ position: 'absolute', top: '70px', right: '24px', transform: 'rotate(15deg)', opacity: nopeOpacity, animation: 'popIn 0.3s ease' }}>
          <div style={{ padding: '8px 18px', borderRadius: '10px', border: '3px solid white', background: 'linear-gradient(135deg, #FF4530, #FF4530)', boxShadow: '0 0 24px rgba(255,69,48,0.7)' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '28px', letterSpacing: '2px' }}>NOPE</span>
          </div>
        </div>
      )}
      {superLikeOpacity > 0.1 && (
        <div style={{ position: 'absolute', top: '140px', left: '50%', transform: 'translateX(-50%)', opacity: superLikeOpacity, animation: 'popIn 0.3s ease' }}>
          <div style={{ padding: '8px 18px', borderRadius: '10px', border: '3px solid white', background: 'linear-gradient(135deg, #22E5FF, #0AA6CE)', boxShadow: '0 0 24px rgba(79,195,247,0.7)' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '24px', letterSpacing: '2px' }}>SUPER LIKE</span>
          </div>
        </div>
      )}
    </div>
  );
}
