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
      className="dc-card"
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
        borderRadius: 16,
        backgroundColor: '#fff',
        overflow: 'hidden',
        border: '1px solid #F1F1F2',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease',
        cursor: 'grab',
        userSelect: 'none',
      }}
    >
      <style jsx>{`
        .dc-photo { width: 100%; height: 372px; position: relative; background: #eee; overflow: hidden; border-top-left-radius: 15px; border-top-right-radius: 15px; }
        .dc-photo img { width: 100%; height: 100%; object-fit: cover; object-position: center top; display: block; }
        .dc-shade { position: absolute; left: 0; right: 0; top: 0; bottom: 0; z-index: 1; pointer-events: none; background: linear-gradient(to bottom, rgba(255,255,255,0) 52%, rgba(255,255,255,0.55) 67%, #FFFFFF 80%); }
        .dc-pill { position: absolute; top: 27px; z-index: 2; padding: 5px 10px; border-radius: 999px; color: #fff; font-size: 11.5px; font-weight: 500; display: flex; gap: 6px; align-items: center; line-height: 15px; }
        .dc-pill-left { left: 24px; background: linear-gradient(135deg, #F50B66, #D90540); } .dc-pill-left span { font-size: 12px; line-height: 1; }
        .dc-pill-right { right: 14px; background: rgba(18,18,18,0.78); }
        .dc-pill-check { width: 13.5px; height: 13.5px; background: #fff; color: #555555; border-radius: 50%; display: grid; place-items: center; font-size: 8.5px; font-weight: 800; }
        .dc-blocks { position: absolute; top: 33px; left: 50%; transform: translateX(-50%); z-index: 3; display: flex; gap: 5px; }
        .dc-block { flex: 0 0 20px; width: 20px; height: 3px; border-radius: 999px; }
        .dc-content { position: relative; z-index: 1; background: #fff; margin-top: -14px; padding: 0 22px; }
        .dc-carve { display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 10px; }
        .dc-carve .dc-name { display: flex; align-items: center; gap: 5px; }
        .dc-carve .dc-name h2 { font-size: 22px; letter-spacing: -0.4px; margin: 0; color: #111111; line-height: 28px; font-weight: 700; }
        .dc-carve .dc-verified { width: 18px; height: 18px; border-radius: 50%; background: #E50046; color: #fff; display: grid; place-items: center; font-size: 11px; font-weight: 800; flex-shrink: 0; }
        .dc-carve .dc-location { display: flex; align-items: center; gap: 6px; color: #656A72; font-size: 13.5px; margin: 5px 0 0; flex-wrap: wrap; line-height: 19px; font-weight: 400; }
        .dc-carve .dc-location svg { width: 15px; height: 15px; }
        .dc-carve .dc-location b { font-size: 12px; }
        .dc-location svg { width: 15px; height: 15px; fill: none; stroke: #6C7077; stroke-width: 1.8; flex-shrink: 0; }
        .dc-location b { font-size: 15px; color: #6A6A6A; }
        .dc-bio { font-size: 14px; line-height: 20px; margin: 13px 0 14px; color: #111111; font-weight: 400; display: flex; align-items: flex-start; gap: 8px; }
        .dc-bio em { flex-shrink: 0; color: #E50046; font-size: 21px; line-height: 1; font-weight: 700; font-style: normal; width: 18px; }
        .dc-int-h { font-size: 14px; margin: 0 0 10px; color: #171717; font-weight: 600; line-height: 20px; }
        .dc-interests { display: flex; flex-wrap: wrap; gap: 7px 5px; padding-bottom: 8px; }
        .dc-chip { height: 29px; border: 1px solid #EBEBEE; border-radius: 999px; padding: 0 11px; display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 500; color: #111111; background: #fff; white-space: nowrap; box-sizing: border-box; }
        .dc-chip i { font-style: normal; width: 17px; height: 17px; border-radius: 50%; display: grid; place-items: center; font-size: 10px; flex-shrink: 0; }
        .dc-facts { border-top: 1px solid #EFEFF1; display: grid; grid-template-columns: 1fr 1fr 1fr; margin-top: 12px; padding: 12px 0 5px; }
        .dc-fact { display: flex; flex-direction: column; align-items: center; text-align: center; min-height: 38px; justify-content: center; }
        .dc-fact + .dc-fact { border-left: 1px solid #EEEEEF; }
        .dc-fact small { display: block; color: #858991; font-size: 12px; line-height: 16px; margin-bottom: 1px; }
        .dc-fact strong { display: block; font-size: 14px; font-weight: 600; color: #111111; line-height: 18px; white-space: normal; }

        @media (max-width: 700px) {
          .dc-card { display: flex; flex-direction: column; }
          .dc-photo { height: 372px; flex: 0 0 auto; min-height: 0; }
          .dc-pill { font-size: 11px; padding: 4px 9px; }
          .dc-content { margin-top: -26px; padding: 0 18px; }
          .dc-carve { margin-bottom: 8px; }
          .dc-carve .dc-name h2 { font-size: 20px; line-height: 26px; }
          .dc-carve .dc-location { font-size: 12.5px; }
          .dc-bio { font-size: 13px; line-height: 19px; gap: 7px; align-items: flex-start; margin-bottom: 12px; }
          .dc-chip { font-size: 11px; height: 27px; padding: 0 10px; }
          .dc-interests { gap: 6px 5px; max-height: none; overflow: visible; }
          .dc-fact small { font-size: 11px; } .dc-fact strong { font-size: 12px; white-space: normal; }
        }
        @media (max-width: 390px) {
          .dc-photo { height: 330px; }
          .dc-interests { gap: 6px 4px; } .dc-chip { padding: 0 10px; font-size: 11px; }
          .dc-int-h { font-size: 13px; }
          .dc-fact strong { font-size: 11px; } .dc-fact small { font-size: 11px; }
        }
        @media (min-width: 1100px) {
          .dc-photo { height: 372px; }
        }
      `}</style>

      <div className="dc-photo">
        <img src={photoUri} alt={user.fullName} draggable={false} loading={isFirst ? 'eager' : 'lazy'} decoding="async" fetchPriority={isFirst ? 'high' : 'low'} />
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
                  background: i === currentPhotoIndex ? '#fff' : 'rgba(255,255,255,0.55)',
                  boxShadow: i === currentPhotoIndex ? '0 0 8px rgba(255,255,255,0.8)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="dc-content">
        <div className="dc-carve">
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
        </div>

        {user.bio && (
          <p className="dc-bio"><em>“</em>{user.bio}</p>
        )}

        {user.interests && user.interests.length > 0 && (
          <>
            <h3 className="dc-int-h">My Interests ({user.interests.length})</h3>
            <div className="dc-interests">
              {user.interests.map(it => {
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