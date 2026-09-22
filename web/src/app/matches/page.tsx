'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/store/AuthContext';
import { matchService, messageService, storageService } from '@/lib/cloudflare/services';
import { account } from '@/lib/cloudflare/config';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function MatchesPage() {
  const router = useRouter();
  const { profile, user } = useAuth();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'connections' | 'requests'>('connections');
  const [lastTexts, setLastTexts] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (!profile && !user) return;
    const uid = (profile as any).$id;
    if (!uid) return;
    setLoading(true);
    account?.createJWT()
      .then(async () => {
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
        const per: Record<string, any[]> = {};
        await Promise.all(
          withPhotos.map(async (m: any) => {
            if (!m.$id) return;
            try {
              const res: any = await messageService.getMessages(m.$id);
              const docs: any[] = res?.documents || [];
              const texts = docs
                .filter((d: any) => d.type === 'text' && d.text)
                .sort((a: any, b: any) => String(a.createdAt).localeCompare(String(b.createdAt)));
              per[m.$id] = texts.slice(-2);
            } catch {}
          })
        );
        setLastTexts(per);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [profile, user]);

  const q = searchQuery.toLowerCase();
  const conversationMatches = matches.filter((m: any) => m.hasConversation && m.matchedUser && (m.matchedUser.fullName || '').toLowerCase().includes(q));
  const requestCount = matches.filter((m: any) => !m.hasConversation).length;

  const openProfile = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    const mp = item.matchedUser || {};
    const otherId = item.matchedUserId || mp.$id || mp.id;
    if (otherId) router.push(`/my-profile/${otherId}`);
  };

  return (
    <AppShell
      header={
        <header className="uv-topbar" style={{ position: 'relative', alignItems: 'center', paddingTop: 26 }}>
          <img className="uv-brand-logo" src="/o-logo.png" alt="Odogwu" style={{ height: 30 }} width={30} height={30} decoding="async" />
          <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontSize: 17, fontWeight: 800, color: '#151515', letterSpacing: -0.3, whiteSpace: 'nowrap' }}>Messages</span>
        </header>
      }
    >
      <style>{`
        .msg-search{height:50px;border:1.5px solid #dedee2;border-radius:14px;display:flex;align-items:center;padding:0 10px;box-shadow:0 1px 3px rgba(0,0,0,.02)}
        .msg-search svg{width:22px;height:22px;stroke:#aeb0b7;fill:none;stroke-width:1.8;margin-right:12px;flex-shrink:0}
        .msg-search input{width:100%;border:0;outline:0;color:#333;background:transparent;font-size:18px}
        .msg-search input::placeholder{color:#b7b8bd;opacity:1}
        .msg-tabs{height:64px;display:flex;align-items:center;gap:24px}
        .msg-tab{position:relative;height:100%;font-size:22px;font-weight:600;color:#17181d;padding:0;cursor:pointer}
        .msg-tab.active{color:#d71945}
        .msg-tab.active:after{content:"";position:absolute;height:3px;background:#d71945;left:-1px;right:-1px;bottom:5px;border-radius:4px}
        .msg-request-count{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;margin-left:7px;border-radius:50%;background:#d71945;color:#fff;font-size:18px;vertical-align:middle}
        .msg-conv{height:92px;border-bottom:1px solid #e8e8eb;display:grid;grid-template-columns:80px 1fr 86px;column-gap:14px;align-items:center}
        .msg-avatar-wrap{width:80px;height:80px;position:relative}
        .msg-avatar-wrap img,.msg-avatar-wrap .msg-avatar-fallback{width:80px;height:80px;display:block;object-fit:cover;border-radius:50%}
        .msg-avatar-fallback{display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#FF2E5F,#B44CFF);color:#fff;font-size:34px;font-weight:800}
        .msg-online{position:absolute;width:15px;height:15px;border-radius:50%;background:#13c979;border:2px solid #fff;right:1px;bottom:1px}
        .msg-online.off{background:#b9bcc2}
        .msg-person-line{display:flex;align-items:center;gap:6px;margin-bottom:6px}
        .msg-person-line strong{font-size:18px;line-height:1.05;letter-spacing:-.3px;color:#101114}
        .msg-verified{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:#1496e9;color:#fff;font-size:12px;font-weight:800;line-height:1}
        .msg-preview{font-size:15px;line-height:1.55;color:#3f4046;letter-spacing:.05px;overflow:hidden;text-overflow:ellipsis}
        .msg-meta{height:100%;display:flex;flex-direction:column;align-items:flex-end;justify-content:center;gap:20px}
        .msg-meta time{font-size:16px;color:#62636a;white-space:nowrap}
        .msg-unread-badge{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:#d71945;color:#fff;font-size:18px;font-weight:700}
        @media (max-width:620px){
          .msg-tabs{height:62px;gap:22px}
          .msg-tab{font-size:20px}
          .msg-conv{height:92px;grid-template-columns:76px 1fr 68px;column-gap:12px}
          .msg-avatar-wrap,.msg-avatar-wrap img,.msg-avatar-wrap .msg-avatar-fallback{width:76px;height:76px}
          .msg-avatar-fallback{font-size:32px}
          .msg-online{width:15px;height:15px}
          .msg-person-line strong{font-size:17px}
          .msg-preview{font-size:13px}
          .msg-meta time{font-size:15px}
        }
        @media (max-width:450px){
          .msg-search{height:46px;border-radius:12px}
          .msg-search input{font-size:15px}
          .msg-tabs{height:58px;gap:18px}
          .msg-tab{font-size:18px}
          .msg-request-count{width:31px;height:31px;font-size:16px}
          .msg-conv{height:82px;grid-template-columns:64px minmax(0,1fr) 48px;column-gap:10px}
          .msg-avatar-wrap,.msg-avatar-wrap img,.msg-avatar-wrap .msg-avatar-fallback{width:64px;height:64px}
          .msg-avatar-fallback{font-size:27px}
          .msg-online{width:14px;height:14px;right:0;bottom:0}
          .msg-person-line{gap:4px;margin-bottom:3px}
          .msg-person-line strong{font-size:15px}
          .msg-verified{width:16px;height:16px;font-size:10px}
          .msg-preview{font-size:13px}
          .msg-meta{gap:13px}
          .msg-meta time{font-size:12px}
          .msg-unread-badge{width:30px;height:30px;font-size:15px}
        }
        @media (max-width:360px){
          .msg-conv{grid-template-columns:54px minmax(0,1fr) 42px;column-gap:8px}
          .msg-avatar-wrap,.msg-avatar-wrap img,.msg-avatar-wrap .msg-avatar-fallback{width:54px;height:54px}
          .msg-person-line strong{font-size:14px}
          .msg-preview{font-size:12px}
        }
      `}</style>

      <div style={{ padding: '0', flex: 1 }}>
        <label className="msg-search">
          <svg viewBox="0 0 24 24">
            <circle cx="10.8" cy="10.8" r="7.4"></circle>
            <path d="M16.2 16.2 21 21"></path>
          </svg>
          <input
            type="text"
            placeholder="Search messages"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </label>

        <div className="msg-tabs">
          <button className={`msg-tab ${activeTab === 'connections' ? 'active' : ''}`} onClick={() => setActiveTab('connections')}>Connections</button>
          <button className={`msg-tab ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
            Requests
            {requestCount > 0 && <b className="msg-request-count">{requestCount}</b>}
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, gap: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, border: '3px solid rgba(255,46,95,0.2)', borderTopColor: '#FF2E5F', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ color: '#8A8A8F', fontSize: 15 }}>Loading conversations...</span>
          </div>
        ) : activeTab === 'connections' ? (
          <div>
            {conversationMatches.length === 0 ? (
              <div style={{ padding: 24, borderRadius: 18, textAlign: 'center', background: '#fff', border: '1px solid #EFEFF3' }}>
                <p style={{ color: '#8A8A8F', fontSize: 14, margin: 0 }}>No conversations yet. Start chatting from Discover! 💬</p>
              </div>
            ) : (
              conversationMatches.map((item: any) => {
                const mp = item.matchedUser || {};
                const photoUrl = mp._photoUrl || '';
                const name = mp.fullName || 'User';
                const texts = lastTexts[item.$id] || [];
                const online = !!mp.lastActive && (Date.now() - new Date(mp.lastActive).getTime()) < 120000;
                const userId = (user as any)?.$id;
                const preview = texts.length > 0 ? texts.map((t: any) => {
                  let line = t.senderId === userId ? `You: ${t.text}` : t.text;
                  if (line.length > 45) line = line.slice(0, 45).trimEnd() + '...';
                  return line;
                }) : ['Say hello! 👋'];
                const time = texts.length > 0 ? timeAgo(texts[texts.length - 1].createdAt) : '';

                return (
                  <Link
                    key={item.$id}
                    href={`/chat/${item.$id}`}
                    className="msg-conv"
                    style={{ textDecoration: 'none', display: 'grid' }}
                  >
                    <div className="msg-avatar-wrap" onClick={(e) => openProfile(e, item)} style={{ cursor: 'pointer' }}>
                      {photoUrl ? (
                        <img src={photoUrl} alt={name} loading="lazy" decoding="async" />
                      ) : (
                        <div className="msg-avatar-fallback">{name[0]}</div>
                      )}
                      <span className={`msg-online${online ? '' : ' off'}`}></span>
                    </div>
                    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div className="msg-person-line">
                        <strong>{name}</strong>
                      </div>
                      <div className="msg-preview">
                        {preview.map((line: string, i: number) => (
                          <span key={i} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{line}</span>
                        ))}
                      </div>
                    </div>
                    <div className="msg-meta">
                      {time && <time>{time}</time>}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        ) : (
          <div>
            {requestCount === 0 ? (
              <div style={{ padding: 24, borderRadius: 18, textAlign: 'center', background: '#fff', border: '1px solid #EFEFF3' }}>
                <p style={{ color: '#8A8A8F', fontSize: 14, margin: 0 }}>No pending requests</p>
              </div>
            ) : (
              matches.filter((m: any) => !m.hasConversation && m.matchedUser && (m.matchedUser.fullName || '').toLowerCase().includes(q)).map((item: any) => {
                const mp = item.matchedUser || {};
                const photoUrl = mp._photoUrl || '';
                const name = mp.fullName || 'User';
                const online = !!mp.lastActive && (Date.now() - new Date(mp.lastActive).getTime()) < 120000;
                return (
                  <Link
                    key={item.$id}
                    href={`/chat/${item.$id}`}
                    className="msg-conv"
                    style={{ textDecoration: 'none', display: 'grid' }}
                  >
                    <div className="msg-avatar-wrap" onClick={(e) => openProfile(e, item)} style={{ cursor: 'pointer' }}>
                      {photoUrl ? (
                        <img src={photoUrl} alt={name} loading="lazy" decoding="async" />
                      ) : (
                        <div className="msg-avatar-fallback">{name[0]}</div>
                      )}
                      <span className={`msg-online${online ? '' : ' off'}`}></span>
                    </div>
                    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div className="msg-person-line">
                        <strong>{name}</strong>
                      </div>
                      <div className="msg-preview">
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>New match — say hello! 👋</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
