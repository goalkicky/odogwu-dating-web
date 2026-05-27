'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FlameIcon, FilterIcon } from '@/components/Icons';
import GradientBackground from '@/components/GradientBackground';
import TabBar from '@/components/TabBar';
import DesktopLayout from '@/components/DesktopLayout';
import { useAuth } from '@/store/AuthContext';
import { matchService, storageService } from '@/lib/appwrite/services';
import { account } from '@/lib/appwrite/config';

export default function MatchesPage() {
  const { profile, user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile && !user) return;
    const uid = (profile as any).$id;
    if (!uid) return;
    setLoading(true);
    account?.createJWT()
      .then(async tokenRes => {
        const token = tokenRes.jwt;
        const docs = await matchService.getUserMatches(uid);
        const withPhotos = docs.map((m: any) => {
          const mp = m.matchedUser;
          if (!mp) return m;
          return {
            ...m,
            matchedUser: {
              ...mp,
              _photoUrl: mp.photos?.[0] ? storageService.getFilePreview(mp.photos[0]) : '',
            },
          };
        });
        setMatches(withPhotos);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [profile, user]);

  const newMatches = matches.filter((m: any) => m.matchedUser);
  const conversationMatches = matches.filter((m: any) => m.matchedUser);

  return (
    <DesktopLayout>
      <GradientBackground style={{ minHeight: '100vh', padding: '24px 16px 85px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #FF375F, #FF3B30)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FlameIcon size={24} color="white" />
            </div>
            <span style={{ fontSize: 24, fontWeight: 800, color: 'white' }}>Matches</span>
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
            <FilterIcon size={24} color="#ABABAB" />
          </button>
        </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
          <span style={{ color: '#ABABAB', fontSize: 16 }}>Loading matches...</span>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 16 }}>New Matches</h2>
            {newMatches.length === 0 ? (
              <p style={{ color: '#6B6B6B', fontSize: 14 }}>No matches yet. Keep swiping!</p>
            ) : (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {newMatches.map((item: any) => {
                  const mp = item.matchedUser || {};
                  const photoUrl = mp._photoUrl || '';
                  const name = mp.fullName || 'User';
                  return (
                    <div key={item.$id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 80 }}>
                      <div style={{ width: 76, height: 76, borderRadius: '50%', padding: 3, background: 'linear-gradient(135deg, #FF375F, #FF3B30)' }}>
                        {photoUrl ? (
                          <img src={photoUrl} alt={name} style={{ width: 70, height: 70, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 70, height: 70, borderRadius: '50%', backgroundColor: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#6B6B6B', fontSize: 20 }}>{name[0]}</span>
                          </div>
                        )}
                      </div>
                      <span style={{ color: '#ABABAB', fontSize: 12, fontWeight: 500, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: 76 }}>{name}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 16 }}>Messages</h2>
            {conversationMatches.length === 0 ? (
              <p style={{ color: '#6B6B6B', fontSize: 14 }}>No messages yet. Start a conversation!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {conversationMatches.map((item: any) => {
                  const mp = item.matchedUser || {};
                  const photoUrl = mp._photoUrl || '';
                  const name = mp.fullName || 'User';
                  const age = mp.age || '';
                  return (
                    <Link
                      key={item.$id}
                      href={`/chat/${item.$id}`}
                      style={{
                        display: 'flex', alignItems: 'center', padding: 16, borderRadius: 16, gap: 14,
                        backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 8, textDecoration: 'none', cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
                    >
                      <div style={{ position: 'relative' }}>
                        {photoUrl ? (
                          <img src={photoUrl} alt={name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#6B6B6B', fontSize: 18 }}>{name[0]}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                          <span style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>{name}</span>
                          {age && <span style={{ fontSize: 14, color: '#6B6B6B' }}>{age}</span>}
                        </div>
                        <span style={{ fontSize: 14, color: '#ABABAB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Say hello!
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
      </div>
      <TabBar />
      </GradientBackground>
    </DesktopLayout>
  );
}
