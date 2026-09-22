'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { PROFILE_TEMPLATE_CSS } from '@/lib/profileTemplateStyles';
import { useAuth } from '@/store/AuthContext';
import { userService, storageService, matchService, superlikeService } from '@/lib/cloudflare/services';

function formatAgo(iso: string): string {
  if (!iso) return '';
  const sec = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return `${Math.floor(sec)}s ago`;
  const min = sec / 60;
  if (min < 60) return `${Math.floor(min)}m ago`;
  const hr = min / 60;
  if (hr < 24) return `${Math.floor(hr)}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

function Photo({ photo, name }: { photo: string; name: string }) {
  if (photo) return <img className="av-photo" src={photo} alt={`${name}'s profile photo`} loading="lazy" decoding="async" />;
  return (
    <div
      className="av-photo"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 44,
        fontWeight: 800,
        color: '#fff',
        background: 'linear-gradient(135deg, #FF2E5F, #B44CFF)',
      }}
    >
      {(name[0] || 'O').toUpperCase()}
    </div>
  );
}

export default function ActivePage() {
  const { profile, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [profiles, setProfiles] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [visible, setVisible] = useState(9);
  const [passed, setPassed] = useState<Set<string>>(new Set());
  const [leaving, setLeaving] = useState<string | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [superliked, setSuperliked] = useState<Set<string>>(new Set());
  const [messagesCount, setMessagesCount] = useState(0);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  const uid = (profile as any)?.$id || (profile as any)?.id;

  useEffect(() => {
    if (loading || !isAuthenticated || !profile || !uid) return;

    if (profile?.interestedIn) {
      userService
        .getDiscoverUsers(uid, {
          gender: profile.interestedIn === 'both' ? 'male' : profile.interestedIn,
          minAge: 18,
          maxAge: 60,
          maxDistance: 200,
        })
        .then((docs: any[]) => {
          const sorted = [...docs].sort((a: any, b: any) => {
            const ta = a.lastActive ? new Date(a.lastActive).getTime() : 0;
            const tb = b.lastActive ? new Date(b.lastActive).getTime() : 0;
            return tb - ta;
          });
          setProfiles(sorted);
        })
        .catch(() => {})
        .finally(() => setLoadingProfiles(false));
    } else {
      setLoadingProfiles(false);
    }

    matchService
      .getUserMatches(uid)
      .then((res: any) => {
        const docs = Array.isArray(res) ? res : (res?.documents || []);
        setMessagesCount(docs.length);
      })
      .catch(() => {});
  }, [loading, isAuthenticated, profile, uid]);

  const term = q.trim().toLowerCase();
  const filtered = profiles.filter(
    p => !term || (p.fullName || '').toLowerCase().includes(term) || (p.city || '').toLowerCase().includes(term)
  ).filter(p => !passed.has(p.id || p.$id));
  const shown = filtered.slice(0, visible);
  const total = term ? filtered.length : profiles.length;

  const passProfile = (id: string) => {
    setLeaving(id);
    setTimeout(() => {
      setPassed(prev => new Set(prev).add(id));
      setLeaving(null);
    }, 260);
  };

  const handleLike = async (p: any) => {
    setLiked(prev => {
      const next = new Set(prev);
      if (next.has(p.id)) next.delete(p.id);
      else next.add(p.id);
      return next;
    });
    if (uid) {
      try {
        const res = await userService.likeUser(uid, p.id);
        if (res?.mutual && res.match?.$id) router.push(`/match/${res.match.$id}`);
      } catch {}
    }
  };

  const handleSuperLike = async (p: any) => {
    setSuperliked(prev => {
      const next = new Set(prev);
      if (next.has(p.id)) next.delete(p.id);
      else next.add(p.id);
      return next;
    });
    try { await superlikeService.send(p.id); } catch {}
  };

  const handleMessage = async (p: any) => {
    if (!uid) return;
    try {
      const match = await matchService.createMatch(uid, p.id);
      if (match?.id) router.push(`/chat/${match.id}`);
      else router.push('/matches');
    } catch {
      router.push('/matches');
    }
  };

  return (
    <AppShell header={<></>}>
      <style jsx global>{PROFILE_TEMPLATE_CSS}</style>
      <style jsx global>{`
        .av-search {
          height: 54px; border-radius: 29px; background: #fff0f4;
          display: flex; align-items: center; padding: 0 20px; gap: 12px; margin: 0 7px 22px;
        }
        .av-search svg { width: 22px; height: 22px; fill: none; stroke: #111; stroke-width: 2; flex-shrink: 0; }
        .av-search input {
          border: 0; outline: 0; background: transparent; width: 100%;
          font-size: 17px; color: #333; font: inherit;
        }
        .av-search input::placeholder { color: #777985; }
        .av-heading { margin: 0 6px 9px; }
        .av-heading h1 { font-size: 20px; margin: 0 0 2px; font-weight: 750; letter-spacing: -0.35px; color: #111; }
        .av-heading p { font-size: 15px; color: #777985; margin: 0; }

        .av-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
        .av-card {
          position: relative; height: 250px; border-radius: 11px; overflow: hidden;
          background: #111; box-shadow: 0 1px 3px rgba(0,0,0,.14);
          transition: transform .25s ease, opacity .25s ease; color: #fff; border: 0;
        }
        .av-photo {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; object-position: center top; filter: saturate(1.02);
        }
        .av-card:after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0) 35%, rgba(0,0,0,.06) 49%, rgba(0,0,0,.9) 88%, rgba(0,0,0,.97) 100%);
        }
        .av-online {
          position: absolute; right: 10px; top: 10px; width: 13px; height: 13px;
          border-radius: 50%; background: #0de78f; z-index: 3;
        }
        .av-info {
          position: absolute; left: 10px; right: 8px; bottom: 64px; z-index: 4;
          color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,.6);
        }
        .av-name {
          font-size: 18px; font-weight: 500; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis; display: flex; align-items: center; gap: 4px;
        }
        .av-verified {
          display: inline-flex; align-items: center; justify-content: center;
          width: 14px; height: 14px; border-radius: 50%; background: #1474df; color: #fff;
          font-size: 9px; margin-left: 3px; flex-shrink: 0; text-shadow: none;
        }
        .av-loc, .av-active { font-size: 11px; margin-top: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .av-loc { display: flex; align-items: center; gap: 3px; min-width: 0; }
        .av-loc svg { width: 11px; height: 11px; fill: #fff; stroke: #fff; flex-shrink: 0; }
        .av-loc span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .av-active { display: flex; align-items: center; gap: 5px; margin-top: 6px; }
        .av-mini {
          width: 10px; height: 10px; border-radius: 50%;
          background: #0de78f; box-shadow: 0 0 4px rgba(13,231,143,.4); flex-shrink: 0;
        }

        .av-actions {
          position: absolute; z-index: 5; bottom: 10px; left: 7px; right: 7px;
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px;
        }
        .av-act {
          display: flex; flex-direction: column; align-items: center; color: #fff;
          font-size: 10px; gap: 1px; text-shadow: 0 1px 2px #000;
          background: none; border: 0; cursor: pointer; padding: 0; font: inherit;
          white-space: nowrap;
        }
        .av-circle {
          width: 34px; height: 34px; border-radius: 50%; background: #fff;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,.2); font-size: 24px; font-weight: 500; line-height: 1;
        }
        .av-pass .av-circle { color: #e31d35; }
        .av-super .av-circle { color: #176bdc; font-size: 22px; }
        .av-like .av-circle { color: #ed1741; font-size: 19px; }
        .av-msg .av-circle { color: #111; font-size: 16px; }
        .av-msg-icon { width: 22px; height: 22px; display: block; fill: currentColor; }
        .av-act.active .av-circle { background: #e91635; color: #fff; }
        .av-act:active .av-circle { transform: scale(.92); }
        .av-act small { font-size: 8px; line-height: 1; }

        .av-results { text-align: center; color: #7d7e87; font-size: 15px; margin: 37px 0 0; }
        .av-loadmore {
          display: block; color: #dc2037; font-weight: 650; font-size: 15px;
          margin: 14px auto 0; background: none; border: 0; cursor: pointer; padding: 0;
        }
        .av-loadmore span { font-size: 20px; display: inline-block; vertical-align: -2px; margin-left: 3px; }
        .av-empty { grid-column: 1 / -1; text-align: center; padding: 45px 10px; color: #777; }

        @media (min-width: 760px) {
          .av-grid { gap: 14px; }
          .av-card { height: 300px; }
          .av-name { font-size: 21px; }
          .av-loc, .av-active { font-size: 12px; }
          .av-actions { bottom: 12px; }
          .av-circle { width: 40px; height: 40px; font-size: 28px; }
          .av-super .av-circle { font-size: 26px; }
          .av-like .av-circle { font-size: 22px; }
          .av-msg-icon { width: 26px; height: 26px; }
          .av-act { font-size: 11px; }
          .av-search { margin-left: 0; margin-right: 0; }
          .av-heading { margin-left: 0; }
        }

        @media (max-width: 599px) {
          .av-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
          .av-card { height: 220px; }
        }

        @media (max-width: 430px) {
          .av-search { margin: 0 0 20px; height: 50px; padding: 0 16px; }
          .av-heading h1 { font-size: 18px; }
          .av-heading p { font-size: 13px; }
          .av-grid { gap: 6px; }
          .av-card { height: 200px; border-radius: 9px; }
          .av-online { right: 7px; top: 8px; width: 10px; height: 10px; }
          .av-info { left: 6px; bottom: 46px; }
          .av-name { font-size: 14px; }
          .av-loc, .av-active { font-size: 9px; margin-top: 3px; }
          .av-mini { width: 7px; height: 7px; }
          .av-actions { left: 3px; right: 3px; bottom: 6px; gap: 2px; }
          .av-circle { width: 23px; height: 23px; font-size: 16px; }
          .av-super .av-circle { font-size: 15px; }
          .av-like .av-circle { font-size: 13px; }
          .av-msg-icon { width: 18px; height: 18px; }
          .av-act small { font-size: 6px; letter-spacing: -0.2px; white-space: normal; line-height: 1.05; text-align: center; max-width: 100%; }
          .av-results { margin-top: 30px; }
        }

        @media (max-width: 350px) {
          .av-card { height: 192px; }
          .av-name { font-size: 13px; }
          .av-loc, .av-active { font-size: 8px; }
          .av-info { bottom: 42px; }
          .av-circle { width: 22px; height: 22px; font-size: 15px; }
          .av-super .av-circle { font-size: 14px; }
          .av-like .av-circle { font-size: 12px; }
          .av-msg-icon { width: 17px; height: 17px; }
          .av-act small { font-size: 5.5px; }
        }
      `}</style>

      <div className="ep">
        <div className="app-shell">
          <header className="topbar">
            <button className="icon-btn back" aria-label="Go back" type="button" onClick={() => router.back()}>
              ‹
            </button>
            <img className="brand-logo" src="/o-logo.png" alt="Odogwu Dating" width={44} height={44} decoding="async" />
            <button className="chat-btn" aria-label="Messages" type="button" onClick={() => router.push('/matches')}>
              <span className="bubble">•••</span><em>{messagesCount || 0}</em>
            </button>
          </header>

          <main>
            <div className="av-search">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.7"></circle><path d="m16.2 16.2 4.3 4.3"></path></svg>
              <input type="search" placeholder="Search profiles..." autoComplete="off" value={q} onChange={e => setQ(e.target.value)} />
            </div>

            <section className="av-heading">
              <h1>All Recently Active</h1>
              <p>People who were recently active on the app</p>
            </section>

            <section className="av-grid" aria-live="polite">
              {loadingProfiles && profiles.length === 0 && (
                <div className="av-empty">Loading profiles...</div>
              )}
              {!loadingProfiles && shown.length === 0 && (
                <div className="av-empty">No profiles found.</div>
              )}
              {shown.map((p: any, idx: number) => {
                const name = p.fullName || 'Member';
                const photo = p.photos?.[0] ? storageService.getFilePreview(p.photos[0]) : '';
                const pid = p.id || p.$id || idx;
                const online = !!p.lastActive && (Date.now() - new Date(p.lastActive).getTime()) < 120000;
                const ago = p.lastActive ? formatAgo(p.lastActive) : '';
                return (
                  <article
                    key={pid}
                    className="av-card"
                    style={leaving === (p.id || p.$id) ? { transform: 'translateX(-110%) rotate(-8deg)', opacity: 0 } : undefined}
                  >
                    <Photo photo={photo} name={name} />
                    {online && <span className="av-online"></span>}
                    <div className="av-info">
                      <div className="av-name">
                        {name}, {p.age || ''}
                        {p.verified ? <span className="av-verified">✓</span> : null}
                      </div>
                      <div className="av-loc">
                        <svg viewBox="0 0 24 24"><path d="M12 21s7-6.3 7-12A7 7 0 1 0 5 9c0 5.7 7 12 7 12Z"></path><circle cx="12" cy="9" r="2.2" fill="none" strokeWidth="2"></circle></svg>
                        <span>{p.city || 'Nigeria'}, Nigeria</span>
                      </div>
                      <div className="av-active"><span className="av-mini"></span>{ago ? `Active ${ago}` : 'Recently active'}</div>
                    </div>
                    <div className="av-actions">
                      <button className="av-act av-pass" title="Pass" onClick={() => passProfile(p.id || p.$id)}>
                        <span className="av-circle">×</span><small>Pass</small>
                      </button>
                      <button
                        className={`av-act av-super ${superliked.has(p.id || p.$id) ? 'active' : ''}`}
                        title="Super Like"
                        onClick={() => handleSuperLike(p)}
                      >
                        <span className="av-circle">★</span><small>Super Like</small>
                      </button>
                      <button
                        className={`av-act av-like ${liked.has(p.id || p.$id) ? 'active' : ''}`}
                        title="Like"
                        onClick={() => handleLike(p)}
                      >
                        <span className="av-circle">♥</span><small>Like</small>
                      </button>
                      <button className="av-act av-msg" title="Message" onClick={() => handleMessage(p)}>
                        <span className="av-circle">
                          <svg className="av-msg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5C6.8 3.5 2.5 7 2.5 11.3c0 2.2 1.1 4.2 2.8 5.6L4.6 21l4.3-2.1c.9.2 2 .3 3.1.3 5.2 0 9.5-3.5 9.5-7.8S17.2 3.5 12 3.5Z"/></svg>
                        </span><small>Message</small>
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>

            <div className="av-results">
              <div>
                Showing {shown.length ? 1 : 0}–{shown.length} of {total}
              </div>
              {!term && visible < profiles.length && (
                <button className="av-loadmore" onClick={() => setVisible(Math.min(visible + 3, profiles.length))}>
                  Load more <span>⌄</span>
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    </AppShell>
  );
}