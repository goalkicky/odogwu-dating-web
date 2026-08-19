'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { CloseIcon, HeartIcon, StarIcon } from '@/components/Icons';
import { userService, superlikeService, likeService, storageService } from '@/lib/cloudflare/services';

interface FeedProfileModalProps {
  userId: string;
  userName: string;
  userPhoto: string;
  currentUserId: string;
  onClose: () => void;
  onMatch?: () => void;
}

export default function FeedProfileModal({ userId, userName, userPhoto, currentUserId, onClose, onMatch }: FeedProfileModalProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [age, setAge] = useState<number>(0);
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<'liked' | 'superliked' | 'match' | null>(null);
  const [superlikes, setSuperlikes] = useState<any>({ remaining: 0 });
  const [likes, setLikes] = useState<any>({ remaining: 0, dailyLimit: 0, isPremium: false });
  const [currentPhoto, setCurrentPhoto] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const profile = await userService.getProfile(userId) as any;
        if (profile?.photos) {
          const resolved = profile.photos.map((fid: string) => storageService.getFilePreview(fid));
          setPhotos(resolved);
        }
        setAge(profile?.age || 0);
        setBio(profile?.bio || '');
        setCity(profile?.city || '');
      } catch {}
      setLoading(false);
    })();
    superlikeService.getStatus().then(setSuperlikes).catch(() => {});
    likeService.getStatus().then(setLikes).catch(() => {});
  }, [userId]);

  const handleLike = useCallback(async () => {
    if (actionLoading || actionResult) return;
    if (!likes.isPremium && (likes.remaining ?? 0) <= 0) return;
    setActionLoading(true);
    try {
      const res = await userService.likeUser(currentUserId, userId);
      if (res && typeof res.remaining === 'number') setLikes(res);
      const mutual = await userService.isMutualMatch(currentUserId, userId);
      if (mutual) {
        setActionResult('match');
        onMatch?.();
      } else {
        setActionResult('liked');
      }
    } catch {}
    setActionLoading(false);
  }, [actionLoading, actionResult, currentUserId, userId, likes, onMatch]);

  const handleSuperLike = useCallback(async () => {
    if (actionLoading || actionResult) return;
    if (!superlikes || superlikes.remaining <= 0) return;
    setActionLoading(true);
    try {
      const res = await superlikeService.send(userId);
      setSuperlikes(res);
      if (res.mutual) {
        setActionResult('match');
        onMatch?.();
      } else {
        setActionResult('superliked');
      }
    } catch {}
    setActionLoading(false);
  }, [actionLoading, actionResult, userId, superlikes, onMatch]);

  const handlePass = useCallback(() => {
    if (actionResult) return;
    setActionResult('liked');
    setTimeout(onClose, 400);
  }, [actionResult, onClose]);

  const photoSrc = photos[currentPhoto] || userPhoto || '';

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} className="feed-sheet-up" style={{ width: '100%', maxWidth: 400, maxHeight: '90vh', background: '#111', borderRadius: 28, overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>

        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}
        >
          <CloseIcon size={18} color="white" />
        </button>

        {/* Photo area */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 4', background: '#0A0A0E' }}>
          {loading ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 14, border: '3px solid rgba(255,55,95,0.2)', borderTopColor: '#FF375F', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : photoSrc ? (
            <img src={photoSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1A1A2E, #2A2A3E)' }}>
              <span style={{ fontSize: 64, fontWeight: 700, color: '#FF375F' }}>{userName?.charAt(0)?.toUpperCase() || '?'}</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }} />

          {/* Photo progress bars */}
          {photos.length > 1 && (
            <div style={{ position: 'absolute', top: 14, left: 12, right: 48, display: 'flex', gap: 4 }}>
              {photos.slice(0, 5).map((_, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentPhoto(i)}
                  style={{
                    flex: 1, height: 4, borderRadius: 2, cursor: 'pointer',
                    background: i === currentPhoto ? 'white' : 'rgba(255,255,255,0.35)',
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </div>
          )}

          {/* Name + age + city */}
          <div style={{ position: 'absolute', bottom: 12, left: 16, right: 16 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: 'white', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>{userName}</span>
              {age > 0 && <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.9)' }}>{age}</span>}
            </div>
            {city && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{city}</span>
              </div>
            )}
            {bio && (
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 6, lineHeight: 1.4 }}>{bio}</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '16px 20px 20px' }}>
          {/* Pass */}
          <button onClick={handlePass} disabled={!!actionResult} style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', cursor: actionResult ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: actionResult ? 0.4 : 1 }}>
            <CloseIcon size={24} color="#FF6B6B" />
          </button>

          {/* Superlike */}
          <button onClick={handleSuperLike} disabled={actionLoading || !!actionResult || superlikes.remaining <= 0} style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid rgba(79,195,247,0.3)', background: 'rgba(79,195,247,0.1)', cursor: actionLoading || actionResult || superlikes.remaining <= 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', opacity: actionLoading || actionResult || superlikes.remaining <= 0 ? 0.4 : 1 }}>
            <StarIcon size={22} color="#4FC3F7" />
            <span style={{ position: 'absolute', top: -4, right: -6, minWidth: 18, height: 18, padding: '0 4px', boxSizing: 'border-box', borderRadius: 9999, background: superlikes.remaining > 0 ? 'linear-gradient(135deg, #4FC3F7, #0288D1)' : '#FF3B30', color: 'white', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #111' }}>
              {superlikes.remaining}
            </span>
          </button>

          {/* Like */}
          <button onClick={handleLike} disabled={actionLoading || !!actionResult || (!likes.isPremium && (likes.remaining ?? 0) <= 0)} style={{ width: 62, height: 62, borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg, #FF375F, #FF3B30)', cursor: actionLoading || actionResult || (!likes.isPremium && (likes.remaining ?? 0) <= 0) ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px rgba(255,55,95,0.4)', position: 'relative', opacity: actionLoading || actionResult || (!likes.isPremium && (likes.remaining ?? 0) <= 0) ? 0.4 : 1 }}>
            <HeartIcon size={28} color="white" />
            {!likes.isPremium && likes.dailyLimit > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -6, minWidth: 18, height: 18, padding: '0 4px', boxSizing: 'border-box', borderRadius: 9999, background: (likes.remaining ?? 0) > 0 ? 'linear-gradient(135deg, #FF375F, #FF6B81)' : '#FF3B30', color: 'white', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #111' }}>
                {Math.max(0, likes.remaining ?? 0)}
              </span>
            )}
          </button>
        </div>

        {/* Action result toast */}
        {actionResult && (
          <div className="animate-pop" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 20 }}>
            {actionResult === 'match' ? (
              <div style={{ background: 'linear-gradient(135deg, #FF375F, #7C4DFF)', padding: '12px 28px', borderRadius: 9999, boxShadow: '0 8px 30px rgba(255,55,95,0.5)' }}>
                <span style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>It's a Match!</span>
              </div>
            ) : actionResult === 'liked' ? (
              <div style={{ background: 'linear-gradient(135deg, #34C759, #30D158)', padding: '12px 28px', borderRadius: 9999, boxShadow: '0 8px 30px rgba(52,199,89,0.5)' }}>
                <span style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>Liked!</span>
              </div>
            ) : actionResult === 'superliked' ? (
              <div style={{ background: 'linear-gradient(135deg, #4FC3F7, #0288D1)', padding: '12px 28px', borderRadius: 9999, boxShadow: '0 8px 30px rgba(79,195,247,0.5)' }}>
                <span style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>Super Liked!</span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
