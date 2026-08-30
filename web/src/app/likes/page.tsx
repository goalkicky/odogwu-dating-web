'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HeartIcon, EyeIcon, DiamondIcon } from '@/components/Icons';
import AppShell from '@/components/AppShell';
import MatchPopup from '@/components/MatchPopup';
import { useAuth } from '@/store/AuthContext';
import { matchService, storageService, userService, likeService } from '@/lib/cloudflare/services';
import { account } from '@/lib/cloudflare/config';

export default function LikesPage() {
  const { profile } = useAuth();
  const [likers, setLikers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [likingId, setLikingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchPopupUser, setMatchPopupUser] = useState<any>(null);
  const [matchPopupId, setMatchPopupId] = useState<string | undefined>(undefined);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const uid = (profile as any).$id;
    matchService.getWhoLikedMe(uid)
      .then(docs => {
        const withPhotos = docs.map((d: any) => {
          const mp = d.matchedUser;
          if (!mp) return d;
          return {
            ...d,
            matchedUser: {
              ...mp,
              _photoUrl: mp.photos?.[0] ? storageService.getFilePreview(mp.photos[0]) : '',
            },
          };
        });
        setLikers(withPhotos);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    likeService.getStatus()
      .then((s: any) => setIsPremium(!!s?.isPremium))
      .catch(() => setIsPremium(!!profile?.isPremium));
  }, [profile]);

  const handleLikeBack = async (likerId: string) => {
    if (!account || !profile) return;
    setLikingId(likerId);
    try {
      const res = await userService.likeUser((profile as any).$id, likerId);
      setLikers(prev => prev.filter(d => {
        const otherId = d.userId;
        return otherId !== likerId;
      }));
      if (res?.mutual) {
        const liker = likers.find(d => d.userId === likerId);
        if (liker?.matchedUser) {
          const mp = liker.matchedUser;
          setMatchPopupUser({
            ...mp,
            photos: (mp.photos || []).map((fid: string) => storageService.getFilePreview(fid)),
          });
          setMatchPopupId(res.match?.$id);
        }
      }
    } catch {}
    setLikingId(null);
  };

  return (
    <AppShell>
      <div>
        {/* Hero header */}
        <div className="animate-fade-up" style={{ borderRadius: 24, padding: 24, marginBottom: 22, background: '#fff', border: '1px solid #EFEFF3', boxShadow: '0 2px 10px rgba(20,20,25,0.04)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #FF2E5F, #FF4530)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 28px rgba(255,46,95,0.45)' }}>
            <EyeIcon size={26} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#151515', margin: 0 }}>Who Likes You</h1>
            <p style={{ fontSize: 13, color: '#8A8A8F', margin: '3px 0 0' }}>
              {likers.length > 0 ? `${likers.length} ${likers.length === 1 ? 'person' : 'people'} can't stop thinking about you` : 'Your likes will appear here'}
            </p>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#d20a19', padding: '6px 16px', borderRadius: 9999, background: '#FFF0F4' }}>
            {likers.length}
          </div>
        </div>

        {/* Premium upsell */}
        {!isPremium && likers.length > 0 && (
          <div className="animate-fade-up" style={{ marginBottom: 18, borderRadius: 18, padding: 16, background: '#FFFDF0', border: '1px solid #F5E8B8', display: 'flex', alignItems: 'center', gap: 12 }}>
            <DiamondIcon size={22} color="#E0A800" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#151515' }}>Unlock who liked you</div>
              <div style={{ fontSize: 12, color: '#8A8A8F' }}>See names &amp; clear photos instantly</div>
            </div>
            <Link href="/premium" style={{ padding: '9px 18px', borderRadius: 9999, background: 'linear-gradient(135deg, #FFE600, #FFB62B)', color: '#1A1A1A', fontSize: 13, fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 18px rgba(255,230,0,0.35)' }}>
              Go Premium
            </Link>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 70, gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, border: '3px solid rgba(255,46,95,0.2)', borderTopColor: '#FF2E5F', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ color: '#8A8A8F', fontSize: 15 }}>Loading...</span>
          </div>
        ) : likers.length === 0 ? (
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 70, gap: 14, borderRadius: 24, background: '#fff', border: '1px solid #EFEFF3', boxShadow: '0 2px 10px rgba(20,20,25,0.04)' }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(255,46,95,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EyeIcon size={40} color="#FF7BA0" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#151515' }}>No likes yet</span>
            <span style={{ fontSize: 14, color: '#8A8A8F', textAlign: 'center', maxWidth: 280 }}>Keep swiping on Discover to get more likes!</span>
            <Link href="/discover" style={{ marginTop: 6, padding: '12px 28px', borderRadius: 9999, background: 'linear-gradient(135deg, #FF2E5F, #FF4530)', color: 'white', fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 6px 24px rgba(255,46,95,0.4)' }}>
              Start Swiping
            </Link>
          </div>
        ) : (
          <>
          <div className="animate-fade-up" style={{ marginBottom: 16 }}>
            <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#fff', border: '1px solid #EDEDF1' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8A8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text" placeholder="Search likes..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px 14px 44px', borderRadius: 16,
                  border: 'none', background: 'transparent', color: '#151515', fontSize: 15, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
          <div className="animate-fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {likers.filter((item: any) => {
              const q = searchQuery.toLowerCase();
              if (!q) return true;
              const mp = item.matchedUser || {};
              return (mp.fullName || '').toLowerCase().includes(q);
            }).map((item: any) => {
              const mp = item.matchedUser || {};
              const photoUrl = mp._photoUrl || '';
              const name = mp.fullName || 'User';
              const age = mp.age || '';
              return (
                <div key={item.$id} className="lift" style={{
                  position: 'relative', borderRadius: 26, overflow: 'hidden',
                  background: '#1A1A1A', aspectRatio: '3/4',
                }}>
                  {photoUrl ? (
                    <img src={photoUrl} alt={name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: isPremium ? 'none' : 'blur(12px) scale(1.2)', transition: 'filter 0.4s' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F3F6' }}>
                      <span style={{ color: '#8A8A8F', fontSize: 40, fontWeight: 700 }}>{name[0]}</span>
                    </div>
                  )}

                  {!isPremium && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.25)' }}>
                      <div style={{ padding: '6px 14px', borderRadius: 9999, background: 'rgba(13,13,16,0.85)', border: '1px solid rgba(255,230,0,0.4)', fontSize: 11, fontWeight: 800, color: '#FFE600', letterSpacing: 0.5, backdropFilter: 'blur(4px)' }}>
                        🔒 PREMIUM
                      </div>
                    </div>
                  )}

                  <div style={{
                    position: 'absolute', left: 0, right: 0, top: '45%', bottom: 0,
                    background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.85) 100%)',
                  }} />

                  <div style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 14 }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                      {name}
                      {age ? <span style={{ fontWeight: 600, marginLeft: 5 }}>{age}</span> : null}
                    </div>
                  </div>

                  <button
                    onClick={() => handleLikeBack(mp.$id || mp.id)}
                    disabled={likingId === (mp.$id || mp.id)}
                    aria-label="Like back"
                    style={{
                      position: 'absolute', right: 12, bottom: 12,
                      width: 40, height: 40, borderRadius: '50%', border: 'none',
                      background: 'linear-gradient(135deg, #FF2E5F, #FF4530)',
                      color: 'white', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: likingId === (mp.$id || mp.id) ? 0.5 : 1,
                      boxShadow: '0 0 18px rgba(255,46,95,0.65), 0 6px 16px rgba(255,46,95,0.4)',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <HeartIcon size={20} color="white" />
                  </button>
                </div>
              );
            })}
          </div>
          </>
        )}
      </div>
      {matchPopupUser && (
        <MatchPopup
          matchedUser={matchPopupUser}
          matchId={matchPopupId}
          myPhotoUrl={(profile as any)?.photos?.[0] ? storageService.getFilePreview((profile as any).photos[0]) : ''}
          onClose={() => { setMatchPopupUser(null); setMatchPopupId(undefined); }}
        />
      )}
    </AppShell>
  );
}
