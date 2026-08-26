'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FilterIcon, ChatIcon, ChevronForwardIcon } from '@/components/Icons';
import GradientBackground from '@/components/GradientBackground';
import TabBar from '@/components/TabBar';
import DesktopLayout from '@/components/DesktopLayout';
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
      <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #FF375F, #7C4DFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: size * 0.42, fontWeight: 800 }}>
        {name[0]}
      </div>
    )
  );

  return (
    <DesktopLayout>
      <GradientBackground style={{ minHeight: '100vh', padding: '24px 16px 110px' }}>
      <div>
        <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="https://kamsirmdlabs.com/img/logo.png" alt="Matches" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover' }} />
            <div>
              <span style={{ fontSize: 24, fontWeight: 800, color: 'white' }}>Matches</span>
              {matches.length > 0 && (
                <div style={{ fontSize: 12, color: '#FF6B8A', fontWeight: 700, marginTop: 1 }}>
                  {matches.length} {matches.length === 1 ? 'connection' : 'connections'}
                </div>
              )}
            </div>
          </div>
          <button className="glass lift" style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: 10, borderRadius: 12, display: 'flex' }}>
            <FilterIcon size={20} color="#D0D0D0" />
          </button>
        </div>

        <div className="glass animate-fade-up" style={{ position: 'relative', marginBottom: 26, borderRadius: 16 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text" placeholder="Search matches..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '14px 16px 14px 44px', borderRadius: 16,
              border: 'none', background: 'transparent', color: 'white', fontSize: 15,
              outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 14, border: '3px solid rgba(255,55,95,0.2)', borderTopColor: '#FF375F', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: '#ABABAB', fontSize: 15 }}>Loading matches...</span>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 34 }} className="animate-fade-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>New Matches</span>
              <span style={{ width: 8, height: 8, borderRadius: 9999, background: '#FF375F', boxShadow: '0 0 10px #FF375F' }} />
            </div>
            {newMatches.length === 0 ? (
              <div className="glass" style={{ padding: 24, borderRadius: 18, textAlign: 'center' }}>
                <p style={{ color: '#6B6B6B', fontSize: 14, margin: 0 }}>
                  No matches yet. Keep swiping on Discover! 💘
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
                        <div className="grad-ring" style={{ width: 84, height: 84, display: 'flex', boxShadow: '0 6px 24px rgba(255,55,95,0.25)' }}>
                          <div style={{ width: 78, height: 78, borderRadius: '50%', overflow: 'hidden', background: '#16161C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {avatar(photoUrl, name, 78)}
                          </div>
                        </div>
                        <div style={{ position: 'absolute', top: -2, right: -4, padding: '3px 8px', borderRadius: 9999, background: 'linear-gradient(135deg, #FF375F, #FF3B30)', fontSize: 9, fontWeight: 800, color: 'white', letterSpacing: 1, boxShadow: '0 4px 12px rgba(255,55,95,0.5)' }}>
                          NEW
                        </div>
                      </div>
                      <span style={{ color: '#D0D0D0', fontSize: 12, fontWeight: 600, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: 84 }}>{name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <div className="animate-fade-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <ChatIcon size={20} color="#FF6B8A" />
              <span style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>Messages</span>
            </div>
            {conversationMatches.length === 0 ? (
              <div className="glass" style={{ padding: 24, borderRadius: 18, textAlign: 'center' }}>
                <p style={{ color: '#6B6B6B', fontSize: 14, margin: 0 }}>
                  No messages yet. Start a conversation! 💬
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
                  const preview = lm ? (isMe ? `You: ${lm.text}` : lm.text) : 'Say hello! 👋';
                  return (
                    <Link
                      key={item.$id}
                      href={`/chat/${item.$id}`}
                      className="glass lift"
                      style={{
                        display: 'flex', alignItems: 'center', padding: 14, borderRadius: 18, gap: 14,
                        textDecoration: 'none', cursor: 'pointer',
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        <div className="grad-ring" style={{ width: 62, height: 62, display: 'flex' }}>
                          <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', background: '#16161C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {avatar(photoUrl, name, 56)}
                          </div>
                        </div>
                        <span style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 9999, background: '#34C759', border: '2px solid #16161C', boxShadow: '0 0 10px #34C759' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{name}</span>
                          {age && <span style={{ fontSize: 14, color: '#6B6B6B' }}>{age}</span>}
                        </div>
                        <span style={{ fontSize: 14, color: '#ABABAB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {preview}
                        </span>
                      </div>
                      <ChevronForwardIcon size={18} color="#4A4A4A" />
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
