'use client';
import React, { useState, useEffect } from 'react';
import { HeartIcon, EyeIcon, CloseIcon } from '@/components/Icons';
import GradientBackground from '@/components/GradientBackground';
import TabBar from '@/components/TabBar';
import DesktopLayout from '@/components/DesktopLayout';
import { useAuth } from '@/store/AuthContext';
import { matchService, storageService, userService } from '@/lib/appwrite/services';
import { account } from '@/lib/appwrite/config';

export default function LikesPage() {
  const { profile } = useAuth();
  const [likers, setLikers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [jwt, setJwt] = useState('');
  const [likingId, setLikingId] = useState<string | null>(null);

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

  return (
    <DesktopLayout>
      <GradientBackground style={{ minHeight: '100vh', paddingBottom: '85px', paddingTop: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '60px 20px 12px' }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, #FF375F, #FF3B30)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <EyeIcon size={22} color="white" />
        </div>
        <span style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>Who Likes You</span>
        <div style={{ width: 36 }} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
          <span style={{ color: '#ABABAB', fontSize: 16 }}>Loading...</span>
        </div>
      ) : likers.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 16 }}>
          <EyeIcon size={48} color="#6B6B6B" />
          <span style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>No likes yet</span>
          <span style={{ fontSize: 14, color: '#6B6B6B', textAlign: 'center' }}>Keep swiping on discover to get more likes!</span>
        </div>
      ) : (
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {likers.map((item: any) => {
            const mp = item.matchedUser || {};
            const photoUrl = mp._photoUrl || '';
            const name = mp.fullName || 'User';
            const age = mp.age || '';
            return (
              <div key={item.$id} style={{
                display: 'flex', alignItems: 'center', padding: 16, borderRadius: 16, gap: 14,
                backgroundColor: 'rgba(255,255,255,0.08)',
              }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', backgroundColor: '#1A1A1A', flexShrink: 0 }}>
                  {photoUrl ? (
                    <img src={photoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#6B6B6B', fontSize: 22 }}>{name[0]}</span>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>{name}</span>
                  {age && <span style={{ fontSize: 14, color: '#6B6B6B', marginLeft: 6 }}>{age}</span>}
                </div>
                <button
                  onClick={() => handleLikeBack(mp.$id || mp.id)}
                  disabled={likingId === (mp.$id || mp.id)}
                  style={{
                    padding: '10px 20px', borderRadius: 9999, border: 'none',
                    background: 'linear-gradient(135deg, #FF375F, #FF3B30)',
                    color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    opacity: likingId === (mp.$id || mp.id) ? 0.5 : 1,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <HeartIcon size={16} color="white" />
                  Like Back
                </button>
              </div>
            );
          })}
        </div>
      )}
      <TabBar />
      </GradientBackground>
    </DesktopLayout>
  );
}
