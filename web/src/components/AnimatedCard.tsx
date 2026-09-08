'use client';
import React, { useRef, useState, useCallback } from 'react';
import { interestCategory } from '@/lib/interests';

interface UserCard {
  id: string;
  photos: string[];
  fullName: string;
  age: number;
  bio: string;
  city?: string;
  distanceKm?: number;
  gender?: string;
  interests?: string[];
  verified?: boolean;
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
  const genderLabel = user.gender ? user.gender[0].toUpperCase() + user.gender.slice(1) : '';

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
        width: width || '100%',
        height: height || 'auto',
        position: 'relative',
        borderRadius: 20,
        backgroundColor: '#fff',
        overflow: 'hidden',
        border: '1px solid #e4e4e6',
        boxShadow: '0 4px 16px rgba(0,0,0,0.09)',
        transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease',
        cursor: 'grab',
        userSelect: 'none',
      }}
    >
      <style jsx>{`
        .dc-photo { width: 100%; height: 560px; position: relative; background: #eee; overflow: hidden; }
        .dc-photo img { width: 100%; height: 100%; object-fit: cover; object-position: center 44%; display: block; }
        .dc-shade { position: absolute; left: 0; right: 0; bottom: 0; height: 190px; z-index: 1; background: linear-gradient(transparent, rgba(255,255,255,.97)); }
        .dc-pill { position: absolute; top: 27px; z-index: 2; padding: 10px 17px; border-radius: 28px; color: #fff; font-size: 16px; font-weight: 600; display: flex; gap: 7px; align-items: center; }
        .dc-pill-left { left: 24px; background: #f62a65; } .dc-pill-left span { font-size: 19px; line-height: 1; }
        .dc-pill-right { right: 24px; background: rgba(30,35,40,.88); }
        .dc-pill-check { width: 22px; height: 22px; background: #fff; color: #20252a; border-radius: 50%; display: grid; place-items: center; font-size: 13px; font-weight: 700; }
        .dc-blocks { position: absolute; top: 78px; left: 24px; right: 24px; z-index: 2; display: flex; gap: 5px; }
        .dc-block { flex: 1; height: 4px; border-radius: 2px; }
        .dc-content { position: relative; z-index: 1; background: #fff; padding: 0 28px; margin-top: -1px; }
        .dc-name { display: flex; align-items: center; gap: 8px; margin-top: -70px; }
        .dc-name h2 { font-size: 39px; letter-spacing: -1.4px; margin: 0; color: #101217; line-height: 1.1; }
        .dc-verified { width: 31px; height: 31px; border-radius: 50%; background: #f52261; color: #fff; display: grid; place-items: center; font-size: 19px; font-weight: 800; flex-shrink: 0; }
        .dc-location { display: flex; align-items: center; gap: 8px; color: #666; font-size: 18px; margin: 10px 0 25px; }
        .dc-location svg { width: 21px; height: 21px; fill: none; stroke: #72767b; stroke-width: 2; flex-shrink: 0; }
        .dc-location b { font-size: 15px; color: #8a8a8a; }
        .dc-bio { font-size: 20px; line-height: 1.45; margin: 0 0 25px; color: #101217; }
        .dc-bio em { color: #f43a68; font-size: 40px; line-height: 0; vertical-align: -12px; margin-right: 7px; font-weight: 700; font-style: normal; }
        .dc-int-h { font-size: 17px; margin: 0 0 13px; color: #101217; }
        .dc-interests { display: flex; flex-wrap: wrap; gap: 9px 8px; padding-bottom: 24px; }
        .dc-chip { height: 43px; border: 1px solid #e5e6e9; border-radius: 24px; padding: 0 14px; display: flex; align-items: center; gap: 7px; font-size: 16px; color: #101217; box-shadow: 0 1px 3px rgba(0,0,0,.03); white-space: nowrap; }
        .dc-chip i { font-style: normal; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font-size: 14px; flex-shrink: 0; }
        .dc-facts { border-top: 1px solid #ddd; display: grid; grid-template-columns: 1fr 1fr 1fr; padding: 25px 0 28px; }
        .dc-fact { position: relative; padding-left: 43px; min-height: 55px; }
        .dc-fact + .dc-fact { border-left: 1px solid #ddd; padding-left: 55px; }
        .dc-fick { position: absolute; left: 8px; top: 4px; font-size: 24px; }
        .dc-fact + .dc-fact .dc-fick { left: 20px; }
        .dc-fact small { display: block; color: #8b8d92; font-size: 14px; margin-bottom: 4px; }
        .dc-fact strong { display: block; font-size: 15px; font-weight: 500; color: #101217; white-space: nowrap; }

        @media (max-width: 700px) {
          .dc-photo { height: 560px; }
          .dc-pill { font-size: 15px; padding: 9px 14px; }
          .dc-content { padding: 0 27px; }
          .dc-name { margin-top: -67px; } .dc-name h2 { font-size: 34px; }
          .dc-location { font-size: 16px; margin-bottom: 23px; }
          .dc-bio { font-size: 17px; }
          .dc-chip { font-size: 14px; height: 42px; padding: 0 12px; }
          .dc-facts { padding-top: 22px; }
          .dc-fact { padding-left: 32px; } .dc-fact + .dc-fact { padding-left: 35px; }
          .dc-fick { left: 0; font-size: 20px; } .dc-fact + .dc-fact .dc-fick { left: 5px; }
          .dc-fact small { font-size: 12px; } .dc-fact strong { font-size: 12px; white-space: normal; }
        }
        @media (max-width: 390px) {
          .dc-photo { height: 510px; }
          .dc-interests { gap: 7px 5px; } .dc-chip { padding: 0 10px; font-size: 13px; }
          .dc-fact strong { font-size: 11px; } .dc-fact small { font-size: 11px; }
        }
        @media (min-width: 1100px) {
          .dc-photo { height: 610px; }
        }
      `}</style>

      <div className="dc-photo">
        <img src={photoUri} alt={user.fullName} draggable={false} />
        <div className="dc-shade" />

        <div className="dc-pill dc-pill-left"><span>✦</span> For You</div>
        {user.verified && (
          <div className="dc-pill dc-pill-right"><span className="dc-pill-check">✓</span> Verified</div>
        )}

        {user.photos && user.photos.length > 1 && (
          <div className="dc-blocks">
            {user.photos.slice(0, 5).map((_, i) => (
              <button
                key={i}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(i); }}
                className="dc-block"
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  background: i === currentPhotoIndex ? '#fff' : 'rgba(255,255,255,0.45)',
                  boxShadow: i === currentPhotoIndex ? '0 0 8px rgba(255,255,255,0.8)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="dc-content">
        <div className="dc-name">
          <h2>{user.fullName}{user.age ? `, ${user.age}` : ''}</h2>
          {user.verified && <span className="dc-verified">✓</span>}
        </div>

        <div className="dc-location">
          <svg viewBox="0 0 24 24"><path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z"/><circle cx="12" cy="9" r="2.2"/></svg>
          <span>{user.city || 'Nearby'}</span>
          {typeof user.distanceKm === 'number' && (
            <><b>•</b><span>{user.distanceKm} km away</span></>
          )}
        </div>

        {user.bio && (
          <p className="dc-bio"><em>“</em>{user.bio}</p>
        )}

        {user.interests && user.interests.length > 0 && (
          <>
            <h3 className="dc-int-h">My Interests ({user.interests.length})</h3>
            <div className="dc-interests">
              {user.interests.slice(0, 12).map(it => {
                const cat = interestCategory(it);
                return (
                  <span key={it} className="dc-chip">
                    <i style={{ background: cat ? cat.c1 : '#eef0f3', color: cat ? '#fff' : '#999' }}>{cat ? cat.emoji : '✦'}</i>
                    {it}
                  </span>
                );
              })}
            </div>
          </>
        )}

        <div className="dc-facts">
          <div className="dc-fact"><span className="dc-fick">🎓</span><small>Age</small><strong>{user.age || '—'}</strong></div>
          <div className="dc-fact"><span className="dc-fick">📍</span><small>Distance</small><strong>{typeof user.distanceKm === 'number' ? `${user.distanceKm} km` : (user.city || 'Nearby')}</strong></div>
          <div className="dc-fact"><span className="dc-fick">♥</span><small>Gender</small><strong>{genderLabel || '—'}</strong></div>
        </div>
      </div>

      {likeOpacity > 0.1 && (
        <div style={{ position: 'absolute', top: '140px', left: '24px', transform: 'rotate(-15deg)', opacity: likeOpacity, animation: 'popIn 0.3s ease', zIndex: 5 }}>
          <div style={{ padding: '8px 18px', borderRadius: '10px', border: '3px solid white', background: 'linear-gradient(135deg, #3DFC77, #3DFC77)', boxShadow: '0 0 24px rgba(61,252,119,0.7)' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '28px', letterSpacing: '2px' }}>LIKE</span>
          </div>
        </div>
      )}
      {nopeOpacity > 0.1 && (
        <div style={{ position: 'absolute', top: '140px', right: '24px', transform: 'rotate(15deg)', opacity: nopeOpacity, animation: 'popIn 0.3s ease', zIndex: 5 }}>
          <div style={{ padding: '8px 18px', borderRadius: '10px', border: '3px solid white', background: 'linear-gradient(135deg, #FF4530, #FF4530)', boxShadow: '0 0 24px rgba(255,69,48,0.7)' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '28px', letterSpacing: '2px' }}>NOPE</span>
          </div>
        </div>
      )}
      {superLikeOpacity > 0.1 && (
        <div style={{ position: 'absolute', top: '210px', left: '50%', transform: 'translateX(-50%)', opacity: superLikeOpacity, animation: 'popIn 0.3s ease', zIndex: 5 }}>
          <div style={{ padding: '8px 18px', borderRadius: '10px', border: '3px solid white', background: 'linear-gradient(135deg, #22E5FF, #0AA6CE)', boxShadow: '0 0 24px rgba(79,195,247,0.7)' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '24px', letterSpacing: '2px' }}>SUPER LIKE</span>
          </div>
        </div>
      )}
    </div>
  );
}