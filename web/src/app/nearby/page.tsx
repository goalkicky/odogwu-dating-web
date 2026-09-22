'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { PROFILE_TEMPLATE_CSS } from '@/lib/profileTemplateStyles';
import { useAuth } from '@/store/AuthContext';
import { userService, matchService, storageService } from '@/lib/cloudflare/services';

export default function NearbyPage() {
  const router = useRouter();
  const { profile, isAuthenticated, loading } = useAuth();
  const [nearby, setNearby] = useState<any[]>([]);
  const [messagesCount, setMessagesCount] = useState(0);
  const [toast, setToast] = useState('');
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set());
  const [locationLabel, setLocationLabel] = useState('');
  const uid = (profile as any)?.$id || (profile as any)?.id;

  useEffect(() => {
    if (loading || !isAuthenticated || !profile) return;
    const uid = (profile as any)?.$id || (profile as any)?.id;
    if (!uid) return;

    let savedLat: number | undefined;
    let savedLng: number | undefined;
    try {
      const raw = localStorage.getItem('dogwu_location');
      if (raw) {
        const loc = JSON.parse(raw);
        if (typeof loc.lat === 'number' && typeof loc.lon === 'number') {
          savedLat = loc.lat;
          savedLng = loc.lon;
        }
      }
    } catch {}

    if (profile.interestedIn) {
      userService.getDiscoverUsers(uid, {
        gender: profile.interestedIn === 'both' ? 'male' : profile.interestedIn,
        minAge: 18, maxAge: 60, maxDistance: 25,
        ...(savedLat !== undefined && savedLng !== undefined ? { lat: savedLat, lng: savedLng } : {}),
      }).then((docs: any[]) => setNearby((Array.isArray(docs) ? docs : []).slice(0, 12))).catch(() => {});
    }

    matchService.getUserMatches(uid).then((docs: any) => {
      const arr = Array.isArray(docs) ? docs : (docs?.documents || []);
      setMessagesCount(arr.reduce((s: number, d: any) => s + Number(d.unreadCount || 0), 0));
    }).catch(() => {});
  }, [profile, isAuthenticated, loading]);

  const toastTimer = React.useRef<any>(null);
  const showToast = (message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 1500);
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('dogwu_location');
      if (raw) {
        const loc = JSON.parse(raw);
        if (loc?.name) setLocationLabel(loc.name);
        if (localStorage.getItem('dogwu_location_justset') === '1') {
          localStorage.removeItem('dogwu_location_justset');
          showToast(`Location set to ${loc.name}`);
        }
      }
    } catch {}
  }, []);

  const handleLike = async (member: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const mid = member?.id || member?.$id;
    if (!mid || !uid) return;
    if (likedSet.has(mid)) {
      setLikedSet(prev => { const n = new Set(prev); n.delete(mid); return n; });
      showToast('Like removed');
    } else {
      setLikedSet(prev => new Set(prev).add(mid));
      userService.likeUser(uid, mid).catch(() => {});
      showToast(`Liked ${member.fullName || member.name || 'profile'} 💕`);
    }
  };

  const profileSrc = (member: any) => {
    if (!member) return '';
    return member.photos?.[0] ? storageService.getFilePreview(member.photos[0]) : '';
  };

  const initial = (member: any) => {
    const name = member?.fullName || member?.full_name || member?.displayName || member?.name || member?.username || 'Member';
    return (name[0] || 'M').toUpperCase();
  };

  return (
    <AppShell header={<></>}>
      <style jsx global>{PROFILE_TEMPLATE_CSS}</style>
      <style jsx global>{`
        .nb-head { display: grid; grid-template-columns: 114px 1fr auto; gap: 17px; align-items: center; margin-bottom: 20px; }
        .nb-map { width: 114px; height: 114px; border-radius: 50%; object-fit: cover; }
        .nb-copy h1 { font-size: 31px; line-height: 1.05; margin: 0 0 10px; font-weight: 750; letter-spacing: -.7px; }
        .nb-copy p { margin: 0 0 6px; font-size: 17px; line-height: 1.2; color: #50535b; font-weight: 500; }
        .nb-copy .nb-pink-line { color: #404249; }
        .nb-location { height: 53px; padding: 0 18px; border: 1px solid #f0e2e6; border-radius: 28px; background: #fff; color: #d9293e; font-weight: 700; font-size: 15px; display: flex; align-items: center; gap: 7px; box-shadow: 0 1px 5px rgba(0,0,0,.02); cursor: pointer; white-space: nowrap; }
        .nb-location svg { width: 20px; height: 20px; }
        .nb-profiles { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .nb-profile { margin: 0; border-radius: 16px; overflow: hidden; background: #eee; line-height: 0; padding: 0; border: 0; cursor: pointer; display: block; width: 100%; position: relative; }
        .nb-profile img { width: 100%; height: auto; display: block; aspect-ratio: 328/322; object-fit: cover; }
        .nb-profile-fallback { width: 100%; aspect-ratio: 328/322; display: flex; align-items: center; justify-content: center; font-size: 56px; font-weight: 800; color: #fff; background: linear-gradient(135deg, #ff2e5f, #b44cff); }
        .nb-caprow { position: absolute; left: 0; right: 0; bottom: 0; z-index: 3; padding: 18px 56px 9px 8px; background: linear-gradient(to top, rgba(0,0,0,.76), rgba(0,0,0,0)); display: flex; flex-direction: column; gap: 5px; align-items: flex-start; line-height: 1.2; }
        .nb-ident { display: flex; align-items: center; gap: 4px; max-width: 100%; min-width: 0; line-height: 1.2; }
        .nb-ident b { font-size: 12px; font-weight: 700; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,.7); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.2; }
        .nb-ident svg { width: 12px; height: 12px; flex-shrink: 0; display: block; }
        .nb-row { display: flex; align-items: center; gap: 3px; font-size: 7px; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,.7); max-width: 100%; min-width: 0; line-height: 1.2; }
        .nb-row svg { width: 8px; height: 8px; flex-shrink: 0; display: block; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
        .nb-like { position: absolute; right: 8px; bottom: 8px; z-index: 4; width: 34px; height: 34px; border-radius: 50%; background: #fff; border: 0; cursor: pointer; display: grid; place-items: center; color: #ed1734; box-shadow: 0 2px 6px rgba(0,0,0,.25); padding: 0; }
        .nb-like svg { width: 24px; height: 24px; display: block; }
        .nb-like.liked { background: #ed1734; color: #fff; }
        .nb-like2 { position: absolute; right: 8px; top: 8px; z-index: 4; width: 30px; height: 30px; border-radius: 50%; background: rgba(0,0,0,.32); border: 0; cursor: pointer; display: grid; place-items: center; color: #fff; padding: 0; }
        .nb-like2 svg { width: 19px; height: 19px; display: block; }
        .nb-like2.liked { color: #ed1734; }
        .nb-status { position: absolute; left: 8px; top: 8px; z-index: 4; display: flex; align-items: center; gap: 4px; padding: 3px 7px; border-radius: 999px; font-size: 7px; font-weight: 600; line-height: 1.1; white-space: nowrap; }
        .nb-status .dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .nb-status.online { background: rgba(30,30,30,.5); color: #fff; }
        .nb-status.online .dot { background: #0de78f; box-shadow: 0 0 0 1.5px #fff; }
        .nb-status.recent { background: rgba(122,125,130,.55); color: #fff; }
        .nb-row span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .nb-empty { grid-column: 1/-1; padding: 30px 10px; text-align: center; font-size: 15px; color: #7b7d84; line-height: 1.45; background: #fafafa; border-radius: 16px; }
        .nb-premium { margin-top: 20px; min-height: 116px; border-radius: 22px; background: linear-gradient(100deg,#fff0f4,#fff7f8); display: flex; align-items: center; padding: 16px 22px; gap: 16px; }
        .nb-premium-icon { width: 57px; height: 57px; flex: 0 0 57px; border-radius: 50%; background: #ffe1e8; color: #ed1734; display: grid; place-items: center; }
        .nb-premium-icon svg { width: 36px; height: 36px; }
        .nb-premium-copy { flex: 1; display: flex; flex-direction: column; gap: 7px; }
        .nb-premium-copy strong { font-size: 18px; line-height: 1.15; }
        .nb-premium-copy span { font-size: 15px; color: #5b5d64; line-height: 1.28; }
        .nb-upgrade { border: 0; background: #ed1734; color: #fff; border-radius: 28px; padding: 15px 29px; font-size: 17px; font-weight: 700; cursor: pointer; min-width: 132px; }
        @media (max-width: 620px) {
          .nb-head { grid-template-columns: 105px 1fr; gap: 13px; margin-bottom: 18px; }
          .nb-map { width: 105px; height: 105px; }
          .nb-copy h1 { font-size: 28px; }
          .nb-copy p { font-size: 15px; }
          .nb-location { grid-column: 1/-1; justify-self: end; margin-top: -4px; height: 47px; }
          .nb-profiles { gap: 10px; }
          .nb-premium { padding: 14px 16px; gap: 11px; border-radius: 19px; min-height: 111px; }
          .nb-premium-icon { width: 50px; height: 50px; flex-basis: 50px; }
          .nb-premium-copy strong { font-size: 15px; }
          .nb-premium-copy span { font-size: 13px; }
          .nb-upgrade { min-width: 105px; padding: 13px 16px; font-size: 15px; }
        }
        @media (max-width: 420px) {
          .nb-head { grid-template-columns: 88px 1fr; gap: 10px; }
          .nb-map { width: 88px; height: 88px; }
          .nb-copy h1 { font-size: 24px; margin-bottom: 6px; }
          .nb-copy p { font-size: 13px; }
          .nb-location { font-size: 13px; height: 44px; }
          .nb-profiles { gap: 8px; }
          .nb-premium { margin-top: 16px; padding: 12px 12px; }
          .nb-premium-icon { width: 45px; height: 45px; flex-basis: 45px; }
          .nb-premium-copy strong { font-size: 13px; }
          .nb-premium-copy span { font-size: 11px; }
          .nb-upgrade { min-width: 88px; font-size: 13px; padding: 12px 13px; }
        }
        @media (max-width: 350px) {
          .nb-copy p:last-child { display: none; }
          .nb-location { grid-column: 2; }
          .nb-premium-icon { display: none; }
          .nb-premium-copy strong { font-size: 12px; }
          .nb-premium-copy span { font-size: 10px; }
          .nb-upgrade { min-width: 74px; padding: 10px 9px; font-size: 12px; }
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
            <section className="nb-head">
              <img className="nb-map" src="/nearby/map.png" alt="" loading="lazy" decoding="async" />
              <div className="nb-copy">
                <h1>Nearby</h1>
                <p className="nb-pink-line">Find singles close to you <span>💕</span></p>
                <p>Showing people within {locationLabel ? `25 km of ${locationLabel}` : '25 km of you'}</p>
              </div>
              <button className="nb-location" onClick={() => { window.location.href = '/location.html'; }}>
                <svg viewBox="0 0 24 24"><path d="M12 21s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="9" r="2.2" fill="currentColor"/></svg>
                {locationLabel || 'Change location'}
              </button>
            </section>

            <section className="nb-profiles" aria-label="Nearby singles">
              {nearby.map((member: any, i: number) => {
                const photo = profileSrc(member);
                const mid = member?.id || member?.$id || '';
                const distance = typeof member.distanceKm === 'number' ? `${member.distanceKm} km away` : (member.city ? member.city : '');
                const isOnline = !!member.lastActive && (Date.now() - new Date(member.lastActive).getTime()) < 120000;
                return (
                  <div key={mid || i} className="nb-profile" role="button" tabIndex={0} onClick={() => router.push('/discover')} onKeyDown={(e) => e.key === 'Enter' && router.push('/discover')}>
                    {photo
                      ? <img src={photo} alt="" loading="lazy" decoding="async" />
                      : <div className="nb-profile-fallback">{initial(member)}</div>}
                    <div className={`nb-status${isOnline ? ' online' : ' recent'}`}>
                      {isOnline
                        ? <><span className="dot"></span><span>Online</span></>
                        : <span>Recently Active</span>}
                    </div>
                    <div className="nb-caprow">
                      <div className="nb-ident">
                        <b>{member.fullName || member.full_name || member.displayName || member.name || member.username || 'Member'}{member.age ? `, ${member.age}` : ''}</b>
                        {member.verified
                          ? <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="#37b1f5"/><path d="m7.5 12.5 3 3 6.5-7" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          : null}
                      </div>
                      {distance
                        ? <div className="nb-row">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z"/><circle cx="12" cy="9" r="2.2"/></svg>
                            <span>{distance}</span>
                          </div>
                        : null}
                      {member.occupation || member.job || member.work
                        ? <div className="nb-row">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2.5"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/></svg>
                            <span>{member.occupation || member.job || member.work}</span>
                          </div>
                        : null}
                    </div>
                    <button className={`nb-like${likedSet.has(mid) ? ' liked' : ''}`} aria-label={likedSet.has(mid) ? 'Unlike' : 'Like'} onClick={(e) => handleLike(member, e)}>
                      <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 40s-14-9-14-20a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 11-14 20-14 20Z" fill="currentColor"/></svg>
                    </button>
                    <button className={`nb-like2${likedSet.has(mid) ? ' liked' : ''}`} aria-label={likedSet.has(mid) ? 'Unlike' : 'Like'} onClick={(e) => handleLike(member, e)}>
                      <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 40s-14-9-14-20a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 11-14 20-14 20Z" fill={likedSet.has(mid) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={likedSet.has(mid) ? 0 : 3.5} strokeLinejoin="round" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                );
              })}
              {nearby.length === 0 && (
                <div className="nb-empty">
                  No matches in this location yet — update your area or check back soon 💕
                </div>
              )}
            </section>

            <section className="nb-premium">
              <div className="nb-premium-icon">
                <svg viewBox="0 0 42 42"><path d="M21 4 35 9v11c0 8.4-5.8 14.2-14 18-8.2-3.8-14-9.6-14-18V9z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15 19l6-4 6 4v7h-12z" fill="none" stroke="currentColor" stroke-width="2"/></svg>
              </div>
              <div className="nb-premium-copy">
                <strong>Be seen more, get more matches 💕</strong>
                <span>Upgrade to Premium to boost your profile and connect with more people near you.</span>
              </div>
              <button className="nb-upgrade" onClick={() => router.push('/premium')}>Upgrade</button>
            </section>
          </main>
        </div>
      </div>

      <div className={`ep toast${toast ? ' show' : ''}`} role="status" aria-live="polite">{toast}</div>
    </AppShell>
  );
}