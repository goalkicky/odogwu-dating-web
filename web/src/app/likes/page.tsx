'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { HeartIcon, EyeIcon, DiamondIcon } from '@/components/Icons';
import GradientBackground from '@/components/GradientBackground';
import TabBar from '@/components/TabBar';
import DesktopLayout from '@/components/DesktopLayout';
import { useAuth } from '@/store/AuthContext';
import { matchService, storageService, userService } from '@/lib/cloudflare/services';
import { account } from '@/lib/cloudflare/config';

export default function LikesPage() {
  const { profile } = useAuth();
  const [likers, setLikers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [jwt, setJwt] = useState('');
  const [likingId, setLikingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!profile) return;
    const uid = (profile as any).$id;
    account?.createJWT()
      .then(async tokenRes => {
        const token = tokenRes.jwt;
        setJwt(token);
        const docs = await matchService.getWhoLikedMe(uid);
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
  }, [profile]);

  const handleLikeBack = async (likerId: string) => {
    if (!account || !profile) return;
    setLikingId(likerId);
    try {
      await userService.likeUser((profile as any).$id, likerId);
      setLikers(prev => prev.filter(d => {
        const otherId = d.userId;
        return otherId !== likerId;
      }));
    } catch {}
    setLikingId(null);
  };

  const isPremium = !!profile?.isPremium;

  return (
    <DesktopLayout>
      <GradientBackground style={{ minHeight: '100vh', padding: '24px 16px 110px' }}>
      <div>
        {/* Hero header */}
        <div className="glass animate-fade-up" style={{ borderRadius: 24, padding: 24, marginBottom: 22, background: 'linear-gradient(135deg, rgba(255,55,95,0.12), rgba(124,77,255,0.1)), rgba(255,255,255,0.03)', border: '1px solid rgba(255,55,95,0.2)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #FF375F, #FF3B30)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 28px rgba(255,55,95,0.45)', animation: 'glowPulse 3s ease infinite' }}>
            <EyeIcon size={26} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: 0 }}>Who Likes You</h1>
            <p style={{ fontSize: 13, color: '#ABABAB', margin: '3px 0 0' }}>
              {likers.length > 0 ? `${likers.length} ${likers.length === 1 ? 'person' : 'people'} can't stop thinking about you` : 'Your likes will appear here'}
            </p>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'white', padding: '6px 16px', borderRadius: 9999, background: 'rgba(255,255,255,0.08)' }}>
            {likers.length}
          </div>
        </div>

        {/* Premium upsell */}
        {!isPremium && likers.length > 0 && (
          <div className="animate-fade-up" style={{ marginBottom: 18, borderRadius: 18, padding: 16, background: 'linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,55,95,0.08))', border: '1px solid rgba(255,215,0,0.25)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <DiamondIcon size={22} color="#FFD700" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Unlock who liked you</div>
              <div style={{ fontSize: 12, color: '#ABABAB' }}>See names &amp; clear photos instantly</div>
            </div>
            <Link href="/premium" style={{ padding: '9px 18px', borderRadius: 9999, background: 'linear-gradient(135deg, #FFD700, #FF9500)', color: '#1A1A1A', fontSize: 13, fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 18px rgba(255,215,0,0.35)' }}>
              Go Premium
            </Link>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 70, gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, border: '3px solid rgba(255,55,95,0.2)', borderTopColor: '#FF375F', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ color: '#ABABAB', fontSize: 15 }}>Loading...</span>
          </div>
        ) : likers.length === 0 ? (
          <div className="glass animate-fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 70, gap: 14, borderRadius: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(255,55,95,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EyeIcon size={40} color="#FF6B8A" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>No likes yet</span>
            <span style={{ fontSize: 14, color: '#6B6B6B', textAlign: 'center', maxWidth: 280 }}>Keep swiping on Discover to get more likes!</span>
            <Link href="/discover" style={{ marginTop: 6, padding: '12px 28px', borderRadius: 9999, background: 'linear-gradient(135deg, #FF375F, #FF3B30)', color: 'white', fontSize: 14, fontWeight: 700, textDecoration: 'none', boxShadow: '0 6px 24px rgba(255,55,95,0.4)' }}>
              Start Swiping
            </Link>
          </div>
        ) : (
          <>
          <div className="animate-fade-up" style={{ marginBottom: 16 }}>
            <div className="glass" style={{ position: 'relative', borderRadius: 16 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text" placeholder="Search likes..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '14px 16px 14px 44px', borderRadius: 16,
                  border: 'none', background: 'transparent', color: 'white', fontSize: 15, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                <div key={item.$id} className="glass lift" style={{
                  display: 'flex', alignItems: 'center', padding: 14, borderRadius: 18, gap: 14,
                }}>
                  <div style={{ position: 'relative' }}>
                    <div className="grad-ring" style={{ width: 66, height: 66, display: 'flex' }}>
                      <div style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', backgroundColor: '#16161C', flexShrink: 0 }}>
                        {photoUrl ? (
                          <img src={photoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isPremium ? 'none' : 'blur(9px) scale(1.15)', transition: 'filter 0.4s' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#6B6B6B', fontSize: 22, fontWeight: 700 }}>{name[0]}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {!isPremium && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ padding: '4px 10px', borderRadius: 9999, background: 'rgba(13,13,16,0.85)', border: '1px solid rgba(255,215,0,0.4)', fontSize: 10, fontWeight: 800, color: '#FFD700', letterSpacing: 0.5, backdropFilter: 'blur(4px)' }}>
                          🔒 PREMIUM
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{name}</span>
                    {age && <span style={{ fontSize: 14, color: '#6B6B6B', marginLeft: 6 }}>{age}</span>}
                  </div>
                  <button
                    onClick={() => handleLikeBack(mp.$id || mp.id)}
                    disabled={likingId === (mp.$id || mp.id)}
                    style={{
                      padding: '11px 22px', borderRadius: 9999, border: 'none',
                      background: 'linear-gradient(135deg, #FF375F, #FF3B30)',
                      color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer',
                      opacity: likingId === (mp.$id || mp.id) ? 0.5 : 1,
                      display: 'flex', alignItems: 'center', gap: 7,
                      boxShadow: '0 6px 22px rgba(255,55,95,0.4)',
                      transition: 'transform 0.15s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <HeartIcon size={16} color="white" />
                    Like Back
                  </button>
                </div>
              );
            })}
          </div>
          </>
        )}
      </div>
      <TabBar />
      </GradientBackground>
    </DesktopLayout>
  );
}
