'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FilterIcon, ChatIcon, ChevronForwardIcon } from '@/components/Icons';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/store/AuthContext';
import { matchService, storageService } from '@/lib/cloudflare/services';
import { account } from '@/lib/cloudflare/config';

export default function MatchesPage() {
  const { profile, user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const q = searchQuery.toLowerCase();
  // Matches with an existing conversation leave the "New Matches" row and live in Messages only
  const newMatches = matches.filter((m: any) => !m.hasConversation && m.matchedUser && (m.matchedUser.fullName || '').toLowerCase().includes(q));
  const conversationMatches = matches.filter((m: any) => m.matchedUser && (m.matchedUser.fullName || '').toLowerCase().includes(q));

  const avatar = (photoUrl: string, name: string, size: number) => (
    photoUrl ? (
      <img src={photoUrl} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
    ) : (
      <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #FF2E5F, #B44CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: size * 0.42, fontWeight: 800 }}>
        {name[0]}
      </div>
    )
  );

  return (
    <AppShell>
      <div>
        <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #FF2E5F, #B44CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18 }}>M</div>
            <div>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#151515' }}>Matches</span>
              {matches.length > 0 && (
                <div style={{ fontSize: 12, color: '#FF7BA0', fontWeight: 700, marginTop: 1 }}>
                  {matches.length} {matches.length === 1 ? 'connection' : 'connections'}
                </div>
              )}
            </div>
          </div>
          <button className="lift" style={{ background: '#fff', border: '1px solid #EDEDF1', cursor: 'pointer', padding: 10, borderRadius: 12, display: 'flex' }}>
            <FilterIcon size={20} color="#65656A" />
          </button>
        </div>

        <div className="animate-fade-up" style={{ position: 'relative', marginBottom: 26, borderRadius: 16, overflow: 'hidden', background: '#fff', border: '1px solid #EDEDF1' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8A8A8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text" placeholder="Search matches..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '14px 16px 14px 44px', borderRadius: 16,
              border: 'none', background: 'transparent', color: '#151515', fontSize: 15,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 14, border: '3px solid rgba(255,46,95,0.2)', borderTopColor: '#FF2E5F', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: '#8A8A8F', fontSize: 15 }}>Loading matches...</span>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 34 }} className="animate-fade-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#151515' }}>New Matches</span>
              <span style={{ width: 8, height: 8, borderRadius: 9999, background: '#FF2E5F', boxShadow: '0 0 10px #FF2E5F' }} />
            </div>
            {newMatches.length === 0 ? (
              <div style={{ padding: 24, borderRadius: 18, textAlign: 'center', background: '#fff', border: '1px solid #EFEFF3' }}>
                <p style={{ color: '#8A8A8F', fontSize: 14, margin: 0 }}>
                  No matches yet. Keep swiping on Discover! Ã°Å¸â€™Ëœ
                </p>
              </div>
            ) : (
              <div
                className="hscroll"
                style={{
                  display: 'flex', gap: 18, flexWrap: 'nowrap',
                  overflowX: 'auto', paddingBottom: 8,
                  WebkitOverflowScrolling: 'touch' as any,
                }}>
                {newMatches.map((item: any) => {
                  const mp = item.matchedUser || {};
                  const photoUrl = mp._photoUrl || '';
                  const name = mp.fullName || 'User';
                  return (
                    <Link
                      key={item.$id}
                      href={`/chat/${item.$id}`}
                      className="lift"
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, width: 84, flexShrink: 0, textDecoration: 'none' }}
                    >
                      <div style={{ position: 'relative' }}>
                        <div className="grad-ring" style={{ width: 84, height: 84, display: 'flex', boxShadow: '0 6px 24px rgba(255,46,95,0.25)' }}>
                          <div style={{ width: 78, height: 78, borderRadius: '50%', overflow: 'hidden', background: '#F3F3F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {avatar(photoUrl, name, 78)}
                          </div>
                        </div>
                        <div style={{ position: 'absolute', top: -2, right: -4, padding: '3px 8px', borderRadius: 9999, background: 'linear-gradient(135deg, #FF2E5F, #FF4530)', fontSize: 9, fontWeight: 800, color: 'white', letterSpacing: 1, boxShadow: '0 4px 12px rgba(255,46,95,0.5)' }}>
                          NEW
                        </div>
                      </div>
                      <span style={{ color: '#65656A', fontSize: 12, fontWeight: 600, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: 84 }}>{name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="animate-fade-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <ChatIcon size={20} color="#FF7BA0" />
              <span style={{ fontSize: 18, fontWeight: 800, color: '#151515' }}>Messages</span>
            </div>
            {conversationMatches.length === 0 ? (
              <div style={{ padding: 24, borderRadius: 18, textAlign: 'center', background: '#fff', border: '1px solid #EFEFF3' }}>
                <p style={{ color: '#8A8A8F', fontSize: 14, margin: 0 }}>
                  No messages yet. Start a conversation! Ã°Å¸â€™Â¬
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {conversationMatches.map((item: any) => {
                  const mp = item.matchedUser || {};
                  const photoUrl = mp._photoUrl || '';
                  const name = mp.fullName || 'User';
                  const age = mp.age || '';
                  const lm = item.lastMessage;
                  const isMe = lm && lm.senderId === (user as any)?.$id;
                  const preview = lm ? (isMe ? `You: ${lm.text}` : lm.text) : 'Say hello! Ã°Å¸â€˜â€¹';
                  return (
                    <Link
                      key={item.$id}
                      href={`/chat/${item.$id}`}
                      className="lift"
                      style={{
                        display: 'flex', alignItems: 'center', padding: 14, borderRadius: 18, gap: 14,
                        textDecoration: 'none', cursor: 'pointer', background: '#fff', border: '1px solid #EDEDF1', boxShadow: '0 1px 4px rgba(20,20,25,0.03)',
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        <div className="grad-ring" style={{ width: 62, height: 62, display: 'flex' }}>
                          <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', background: '#F3F3F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {avatar(photoUrl, name, 56)}
                          </div>
                        </div>
                        <span style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 9999, background: '#3DFC77', border: '2px solid #fff', boxShadow: '0 0 6px rgba(61,252,119,0.6)' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: '#151515' }}>{name}</span>
                          {age && <span style={{ fontSize: 14, color: '#8A8A8F' }}>{age}</span>}
                        </div>
                        <span style={{ fontSize: 14, color: '#8A8A8F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {preview}
                        </span>
                      </div>
                      <ChevronForwardIcon size={18} color="#C7C7CC" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
      </div>
    </AppShell>
  );
}
