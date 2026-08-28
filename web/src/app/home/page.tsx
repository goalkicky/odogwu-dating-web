'use client';
import React, { useState, useEffect, CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { useMobile } from '@/lib/useMediaQuery';
import { matchService, userService, storageService, feedService, likeService } from '@/lib/cloudflare/services';

function formatAgo(iso: string): string {
  if (!iso) return 'now';
  const sec = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return `${Math.floor(sec)}s ago`;
  const min = sec / 60;
  if (min < 60) return `${Math.floor(min)}m ago`;
  const hr = min / 60;
  if (hr < 24) return `${Math.floor(hr)}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

const GRAD_PLACEHOLDER: CSSProperties = {
  width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 44, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #d9164b, #c9093d)',
};

function StoryAvatar({ photo, name }: { photo: string; name: string }) {
  if (photo) return <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />;
  return <div style={{ position: 'absolute', inset: 0, ...GRAD_PLACEHOLDER, background: 'linear-gradient(135deg, #d9164b, #7c4dff)' }}>{name[0]}</div>;
}

export default function HomePage() {
  const { profile, isAuthenticated, loading } = useAuth();
  const isMobile = useMobile();
  const router = useRouter();

  const [likesCount, setLikesCount] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0);
  const [nearby, setNearby] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [messagesCount, setMessagesCount] = useState(0);

  const uid = (profile as any)?.$id || (profile as any)?.id;
  const profilePhoto = profile?.photos?.[0] ? storageService.getFilePreview(profile.photos[0]) : '';
  const fullName = (profile as any)?.fullName || (profile as any)?.displayName || 'Your';
  const initial = (fullName[0] || 'O').toUpperCase();

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    if (!profile || !uid) return;

    Promise.allSettled([
      matchService.getWhoLikedMe(uid),
      matchService.getUserMatches(uid),
      likeService.getStatus(),
    ]).then(([likesRes, matchesRes, premRes]) => {
      if (likesRes.status === 'fulfilled') setLikesCount(Array.isArray(likesRes.value) ? likesRes.value.length : (likesRes.value?.total || 0));
      if (matchesRes.status === 'fulfilled') {
        const docs = Array.isArray(matchesRes.value) ? matchesRes.value : (matchesRes.value?.documents || []);
        setMatchesCount(docs.length);
        setMessagesCount(docs.filter((d: any) => d.hasConversation).length);
      }
      if (premRes.status === 'fulfilled') setIsPremium(!!(premRes.value as any)?.isPremium);
    });

    if (profile?.interestedIn) {
      userService.getDiscoverUsers(uid, {
        gender: profile.interestedIn === 'both' ? 'male' : profile.interestedIn,
        minAge: 18, maxAge: 60, maxDistance: 200,
      }).then((docs: any[]) => setNearby(docs.slice(0, 12))).catch(() => {});
    }

    feedService.getFeed(profile?.interests || []).then((d: any) => {
      const posts = d?.documents || d?.posts || (Array.isArray(d) ? d : []);
      setStories(
        posts.slice(0, 6).map((p: any) => ({
          id: p.id || p.$id,
          name: p.userName || 'Odogwu',
          ago: formatAgo(p.createdAt),
          caption: p.caption || '',
          photo: p.images?.[0] ? storageService.getFilePreview(p.images[0]) : '',
        }))
      );
    }).catch(() => {});
  }, [loading, isAuthenticated, profile, uid]);

  const profileComplete = !!(profile?.age && profile?.gender && profile?.photos?.length);

  const go = (href: string) => router.push(href);

  return (
    <>
      <style jsx global>{`
        .tmpl-app {
          width: 100%; max-width: 710px; margin: 0 auto; background: #fff;
          min-height: 100svh; position: relative; padding: 26px 23px 112px;
          color: #151515; font-family: Arial, Helvetica, sans-serif;
          box-sizing: border-box;
        }
        .tmpl-topbar { height: 111px; display: flex; align-items: flex-start; justify-content: space-between; position: relative; }
        .tmpl-icon-btn { color: #171717; background: none; border: 0; cursor: pointer; padding: 0; }
        .tmpl-menu { width: 38px; margin-top: 30px; padding: 0; }
        .tmpl-menu span { display: block; width: 34px; height: 3px; background: #222; margin: 8px 0; border-radius: 2px; }
        .tmpl-brand { display: flex; align-items: center; gap: 9px; margin-top: 10px; }
        .tmpl-brand-mark { width: 66px; height: 66px; border: 7px solid #cf0a13; border-radius: 50%; position: relative; flex-shrink: 0; box-sizing: border-box; }
        .tmpl-brand-mark:before { content: ""; position: absolute; width: 18px; height: 18px; border: 6px solid #fff; border-radius: 50%; background: #cf0a13; left: -5px; top: -5px; box-sizing: border-box; }
        .tmpl-brand-mark i { position: absolute; width: 16px; height: 16px; border: 4px solid #fff; border-top-color: transparent; border-radius: 50%; right: 7px; top: 4px; box-sizing: border-box; }
        .tmpl-brand-name { font-size: 42px; line-height: 39px; font-weight: 800; letter-spacing: -2px; color: #bd0d17; }
        .tmpl-brand-sub { text-align: center; font-size: 13px; font-weight: 700; letter-spacing: 6px; margin-top: 8px; }
        .tmpl-brand-sub b { color: #d20a19; letter-spacing: 0; }
        .tmpl-brand-sub span { color: #d20a19; }
        .tmpl-messages-top { position: relative; width: 50px; height: 50px; margin-top: 31px; background: none; border: 0; cursor: pointer; color: #171717; padding: 0; }
        .tmpl-messages-top svg { width: 40px; height: 40px; }
        .tmpl-messages-top em { position: absolute; right: 0; top: -4px; background: #d71945; color: #fff; width: 24px; height: 24px; border-radius: 50%; font-style: normal; font-size: 13px; display: grid; place-items: center; font-weight: 700; }
        .tmpl-premium { height: 105px; background: #fff1f5; border-radius: 18px; display: flex; align-items: center; padding: 17px 22px; margin-bottom: 18px; }
        .tmpl-crown { width: 65px; height: 65px; background: #df164c; color: #ffd12a; border-radius: 50%; display: grid; place-items: center; font-size: 42px; margin-right: 18px; flex-shrink: 0; }
        .tmpl-premium-copy { flex: 1; }
        .tmpl-premium h3 { font-size: 21px; margin: 0 0 5px; color: #151515; }
        .tmpl-premium p { font-size: 16px; line-height: 23px; color: #555; margin: 0; }
        .tmpl-pink-btn { background: #d9164b; color: #fff; border-radius: 28px; padding: 15px 27px; font-size: 16px; border: 0; cursor: pointer; font-weight: 600; }
        .tmpl-quick-nav { display: grid; grid-template-columns: repeat(4, 1fr); gap: 25px; margin: 3px 10px 26px; }
        .tmpl-quick { position: relative; display: flex; flex-direction: column; align-items: center; color: #171717; background: none; border: 0; cursor: pointer; padding: 0; }
        .tmpl-round-photo { width: 111px; height: 111px; border: 4px solid #d30e42; border-radius: 50%; padding: 5px; display: block; position: relative; background: #fff; box-sizing: border-box; overflow: hidden; }
        .tmpl-round-photo.dashed { border-style: dashed; border-color: #ec6690; }
        .tmpl-round-photo img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block; }
        .tmpl-round-photo.location { display: grid; place-items: center; border-color: #c7a523; }
        .tmpl-round-photo.location svg { width: 57px; height: 57px; fill: #df164b; }
        .tmpl-quick label { font-size: 16px; font-weight: 500; margin-top: 10px; color: #171717; }
        .tmpl-badge, .tmpl-plus { position: absolute; right: 8px; top: 79px; background: #d9184b; color: #fff; border-radius: 50%; width: 32px; height: 32px; display: grid; place-items: center; font-size: 15px; font-weight: 700; z-index: 2; }
        .tmpl-plus { font-size: 25px; width: 31px; height: 31px; font-weight: 400; }
        .tmpl-section h2 { font-size: 20px; margin: 0 0 10px; font-weight: 700; color: #151515; }
        .tmpl-section h2 span { font-size: 19px; }
        .tmpl-stories { display: flex; gap: 7px; overflow-x: auto; padding-bottom: 4px; }
        .tmpl-story-card { height: 291px; flex: 1 0 152px; min-width: 0; border-radius: 15px; overflow: hidden; position: relative; background: #333; color: #fff; cursor: pointer; border: 0; padding: 0; display: block; text-decoration: none; }
        .tmpl-story-card > img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tmpl-shade { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,.28), transparent 45%, rgba(0,0,0,.65)); }
        .tmpl-story-user { position: absolute; left: 10px; top: 12px; display: flex; gap: 7px; align-items: flex-start; font-size: 13px; text-shadow: 0 1px 2px #000; }
        .tmpl-story-user span { width: 28px; height: 28px; border-radius: 50%; background: #222; border: 2px solid #fff; display: grid; place-items: center; font-size: 13px; }
        .tmpl-story-user small { display: block; font-size: 12px; margin-top: 3px; font-weight: 400; }
        .tmpl-story-card p { position: absolute; left: 12px; bottom: 0; font-size: 13px; margin: 0 0 11px; }
        .tmpl-love-banner { height: 125px; border-radius: 18px; background: #fff2f6; margin: 24px 0 13px; display: flex; align-items: center; padding: 18px 24px; gap: 20px; }
        .tmpl-hearts { font-size: 55px; line-height: 1; }
        .tmpl-love-banner h3 { font-size: 19px; margin: 0 0 7px; color: #151515; }
        .tmpl-love-banner p { font-size: 15px; line-height: 21px; color: #555; margin: 0; }
        .tmpl-outline-btn { margin-left: auto; border: 1px solid #f2c7d4; border-radius: 28px; padding: 16px 19px; color: #cc1747; background: #fff; white-space: nowrap; font-weight: 600; cursor: pointer; font-size: 14px; }
        .tmpl-active-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px 14px; }
        .tmpl-profile-card { height: 204px; border-radius: 14px; overflow: hidden; position: relative; color: #fff; background: #444; cursor: pointer; border: 0; padding: 0; }
        .tmpl-profile-card > img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tmpl-profile-card:after { content: ""; position: absolute; inset: 0; background: linear-gradient(transparent 50%, rgba(0,0,0,.55)); }
        .tmpl-profile-card div { position: absolute; left: 12px; bottom: 12px; z-index: 2; font-size: 14px; text-align: left; }
        .tmpl-profile-card small { display: block; font-size: 12px; margin-top: 3px; font-weight: 400; }
        .tmpl-profile-card i { position: absolute; right: 12px; top: 12px; width: 11px; height: 11px; background: #14e96d; border-radius: 50%; z-index: 3; }
        .tmpl-bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 710px; height: 101px; background: #fff; border-top: 1px solid #eee; display: grid; grid-template-columns: 1fr 1fr 1.1fr 1fr 1fr; align-items: end; padding: 8px 15px 13px; z-index: 10; box-sizing: border-box; }
        .tmpl-nav-item { height: 70px; color: #777; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; font-size: 13px; text-decoration: none; background: none; border: 0; padding: 0; cursor: pointer; }
        .tmpl-nav-item svg { width: 29px; height: 29px; stroke: currentColor; stroke-width: 2.2; fill: currentColor; }
        .tmpl-nav-item:not(.active) svg { fill: none; }
        .tmpl-nav-item.active { color: #d81043; }
        .tmpl-nav-icon-wrap { position: relative; display: grid; }
        .tmpl-nav-icon-wrap b { position: absolute; right: -7px; top: -7px; background: #d81043; color: #fff; border-radius: 50%; font-size: 11px; width: 20px; height: 20px; display: grid; place-items: center; font-weight: 700; }
        .tmpl-nav-center { width: 77px; height: 77px; border-radius: 50%; background: #d51040; color: #fff; justify-self: center; align-self: start; margin-top: -20px; box-shadow: 0 2px 7px #bbb; border: 5px solid #fff; font-size: 56px; line-height: 1; display: grid; place-items: center; text-decoration: none; box-sizing: border-box; }
        .tmpl-profile-tab svg { stroke-width: 1.8; }

        .tmpl-sidebar { position: fixed; left: 0; top: 0; width: 255px; height: 100vh; padding: 32px 24px; background: #fff; border-right: 1px solid #ececef; z-index: 30; font-family: Arial, Helvetica, sans-serif; color: #151515; box-sizing: border-box; }
        .tmpl-sidebar .tmpl-brand-mark { width: 48px; height: 48px; border-width: 5px; }
        .tmpl-sidebar .tmpl-brand-mark:before { width: 13px; height: 13px; border-width: 4px; }
        .tmpl-sidebar .tmpl-brand-mark i { width: 12px; height: 12px; border-width: 3px; }
        .tmpl-sidebar .tmpl-brand-name { font-size: 30px; line-height: 29px; }
        .tmpl-sidebar .tmpl-brand-sub { font-size: 9px; letter-spacing: 4px; margin-top: 5px; }
        .tmpl-sidebar .tmpl-menu { position: absolute; left: 31px; top: 155px; width: 190px; height: 52px; margin: 0; padding: 0 17px; border-radius: 14px; background: #fff0f4; color: #d51043; text-align: left; border: 0; cursor: pointer; font-weight: 700; font-size: 15px; display: flex; align-items: center; gap: 8px; }
        .tmpl-sidebar .tmpl-menu span { display: none; }
        .tmpl-sidebar .tmpl-messages-top { position: absolute; left: 31px; top: 225px; width: 190px; height: 52px; margin: 0; border-radius: 14px; text-align: left; padding-left: 17px; }
        .tmpl-sidebar .tmpl-messages-top svg { width: 25px; height: 25px; vertical-align: middle; }
        .tmpl-sidebar .tmpl-messages-top em { right: 18px; top: 13px; width: 21px; height: 21px; font-size: 11px; }
        .tmpl-sb-extra { position: absolute; left: 48px; top: 310px; display: flex; flex-direction: column; gap: 12px; }
        .tmpl-sb-extra button { background: none; border: 0; cursor: pointer; color: #65656a; font-size: 15px; text-align: left; padding: 0; }

        @media (max-width: 560px) {
          .tmpl-app { padding-left: 22px; padding-right: 22px; }
          .tmpl-brand-name { font-size: 34px; }
          .tmpl-brand-mark { width: 55px; height: 55px; }
          .tmpl-brand-sub { font-size: 10px; }
          .tmpl-quick-nav { gap: 12px; margin-left: 0; margin-right: 0; }
          .tmpl-round-photo { width: 82px; height: 82px; }
          .tmpl-badge, .tmpl-plus { top: 58px; width: 27px; height: 27px; }
          .tmpl-plus { font-size: 22px; }
          .tmpl-quick label { font-size: 13px; }
          .tmpl-stories { gap: 6px; }
          .tmpl-story-card { height: 290px; flex-basis: 132px; }
          .tmpl-love-banner { padding: 14px; gap: 10px; }
          .tmpl-love-banner p { font-size: 12px; }
          .tmpl-outline-btn { padding: 12px 13px; font-size: 12px; }
          .tmpl-active-grid { gap: 10px; }
          .tmpl-profile-card { height: 195px; }
        }
      `}</style>
      <style jsx>{`
        @media (min-width: 768px) {
          .tmpl-mobile-only { display: none !important; }
          .tmpl-desktop-only { display: block !important; }
          .tmpl-mobile-only .tmpl-topbar { display: none !important; }
        }
      `}</style>

      {/* Desktop sidebar */}
      <div className="tmpl-desktop-only" style={{ display: 'none' }}>
        <aside className="tmpl-sidebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '0 0 58px 7px' }}>
            <div className="tmpl-brand-mark"><i></i></div>
            <div>
              <div className="tmpl-brand-name">DOGWU</div>
              <div className="tmpl-brand-sub"><b>—</b> D A T <span>♥</span> I N G <b>—</b></div>
            </div>
          </div>
          <button className="tmpl-menu tmpl-icon-btn" onClick={() => go('/home')}><span></span><span></span><span></span>Home</button>
          <button className="tmpl-messages-top tmpl-icon-btn" onClick={() => go('/matches')}>
            <svg viewBox="0 0 48 48"><path d="M10 35l2-7a14 14 0 1 1 5 5l-7 2Z" fill="none" stroke="currentColor" strokeWidth="3"/><circle cx="20" cy="22" r="1.7"/><circle cx="26" cy="22" r="1.7"/><circle cx="32" cy="22" r="1.7"/></svg>
            <em>{messagesCount || 0}</em>
          </button>
          <div className="tmpl-sb-extra">
            <button onClick={() => go('/explore')}>Explore</button>
            <button onClick={() => go('/matches')}>♥&nbsp;&nbsp;Matches</button>
            <button onClick={() => go('/likes')}>♧&nbsp;&nbsp;Likes You</button>
            <button onClick={() => go('/discover')}>◎&nbsp;&nbsp;Nearby</button>
            <button onClick={() => go('/settings')}>⚙&nbsp;&nbsp;Settings</button>
          </div>
        </aside>
      </div>

      {/* Mobile / main app (desktop app area also rendered within right column) */}
      <div className="tmpl-mobile-only" style={{ display: 'block' }}>
        <main
          className="tmpl-app"
          style={
            !isMobile
              ? { maxWidth: '100%', width: '100%', minHeight: '100svh', paddingLeft: 295, paddingRight: 40, paddingTop: 34, paddingBottom: 45 }
              : undefined
          }
        >
          <header className="tmpl-topbar">
            <button className="tmpl-icon-btn tmpl-menu" aria-label="Menu" onClick={() => go('/settings')}>
              <span></span><span></span><span></span>
            </button>
            <div className="tmpl-brand">
              <div className="tmpl-brand-mark"><i></i></div>
              <div>
                <div className="tmpl-brand-name">DOGWU</div>
                <div className="tmpl-brand-sub"><b>—</b> D A T <span>♥</span> I N G <b>—</b></div>
              </div>
            </div>
            <button className="tmpl-messages-top tmpl-icon-btn" aria-label="Messages" onClick={() => go('/matches')}>
              <svg viewBox="0 0 48 48" aria-hidden="true">
                <path d="M10 35l2-7a14 14 0 1 1 5 5l-7 2Z" fill="none" stroke="currentColor" strokeWidth="3"/>
                <circle cx="20" cy="22" r="1.7" fill="currentColor"/>
                <circle cx="26" cy="22" r="1.7" fill="currentColor"/>
                <circle cx="32" cy="22" r="1.7" fill="currentColor"/>
              </svg>
              <em>{messagesCount || 0}</em>
            </button>
          </header>

          {!isPremium && (
            <section className="tmpl-premium">
              <div className="tmpl-crown">♛</div>
              <div className="tmpl-premium-copy">
                <h3>Upgrade to Premium</h3>
                <p>Unlock all features and<br />connect without limits</p>
              </div>
              <button className="tmpl-pink-btn" onClick={() => go('/premium')}>Upgrade</button>
            </section>
          )}

          <section className="tmpl-quick-nav">
            <button className="tmpl-quick" onClick={() => go('/edit-profile')}>
              <span className="tmpl-round-photo dashed" style={{ overflow: 'hidden' }}>
                <StoryAvatar photo={profilePhoto} name={initial} />
              </span>
              <b className="tmpl-plus">+</b><label>Your Story</label>
            </button>
            <button className="tmpl-quick" onClick={() => go('/likes')}>
              <span className="tmpl-round-photo" style={{ overflow: 'hidden' }}>
                <StoryAvatar photo={profilePhoto} name={initial} />
              </span>
              <b className="tmpl-badge">{likesCount}</b><label>Likes You</label>
            </button>
            <button className="tmpl-quick" onClick={() => go('/matches')}>
              <span className="tmpl-round-photo" style={{ overflow: 'hidden' }}>
                <StoryAvatar photo={profilePhoto} name={initial} />
              </span>
              <b className="tmpl-badge">{matchesCount}</b><label>Matches</label>
            </button>
            <button className="tmpl-quick" onClick={() => go('/discover')}>
              <span className="tmpl-round-photo location">
                <svg viewBox="0 0 64 64"><path d="M32 7c-12 0-21 9-21 21 0 15 21 29 21 29s21-14 21-29C53 16 44 7 32 7Zm0 29a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"/></svg>
              </span>
              <b className="tmpl-badge">{nearby.length}</b><label>Nearby</label>
            </button>
          </section>

          <section className="tmpl-section">
            <h2>Top Stories <span>🔥</span></h2>
            <div className="tmpl-stories">
              {stories.length === 0 && (
                <div style={{ color: '#999', fontSize: 14, padding: '20px 4px', flex: '1 0 100%' }}>
                  No stories yet. Follow the feed to see what&apos;s new!
                </div>
              )}
              {stories.map((s: any) => (
                <Link key={s.id} href={`/post/${s.id}`} className="tmpl-story-card">
                  {s.photo
                    ? <img src={s.photo} alt="" />
                    : <StoryAvatar photo="" name={s.name[0]} />}
                  <div className="tmpl-shade"></div>
                  <div className="tmpl-story-user"><span>◉</span><div>{s.name}<small>{s.ago}</small></div></div>
                  <p>{s.caption}</p>
                </Link>
              ))}
            </div>
          </section>

          {!profileComplete && (
            <section className="tmpl-love-banner">
              <div className="tmpl-hearts">💗</div>
              <div>
                <h3>Love is better together <span>💕</span></h3>
                <p>Complete your profile, increase your<br />visibility and find your perfect match.</p>
              </div>
              <button className="tmpl-outline-btn" onClick={() => go('/edit-profile')}>Complete Profile</button>
            </section>
          )}

          <section className="tmpl-section">
            <h2>Recently Active</h2>
            <div className="tmpl-active-grid">
              {nearby.length === 0 && (
                <div style={{ color: '#999', fontSize: 14, padding: '20px 4px', gridColumn: '1 / -1' }}>
                  No nearby members yet. Check back soon!
                </div>
              )}
              {nearby.map((p: any, idx: number) => {
                const photo = p.photos?.[0] ? storageService.getFilePreview(p.photos[0]) : '';
                const name = p.fullName || 'Member';
                return (
                  <button key={p.id || p.$id || idx} className="tmpl-profile-card" onClick={() => go('/discover')}>
                    <StoryAvatar photo={photo} name={name[0]} />
                    <i></i>
                    <div>{name}<small>{Math.max(1, idx + 1) * 2}m ago</small></div>
                  </button>
                );
              })}
            </div>
          </section>
        </main>
        <nav className="tmpl-bottom-nav" style={isMobile ? undefined : { display: 'none' }}>
          <Link href="/home" className="tmpl-nav-item active">
            <svg viewBox="0 0 48 48"><path d="M8 22 24 9l16 13v17H29V28H19v11H8Z"/></svg><span>Home</span>
          </Link>
          <Link href="/explore" className="tmpl-nav-item">
            <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="15" fill="none"/><path d="m19 29 4-10 9-4-4 9-9 5Z"/></svg><span>Explore</span>
          </Link>
          <Link href="/discover" className="tmpl-nav-center"><span>◔</span></Link>
          <Link href="/matches" className="tmpl-nav-item">
            <span className="tmpl-nav-icon-wrap"><svg viewBox="0 0 48 48"><path d="M9 34l2-7a14 14 0 1 1 5 5l-7 2Z" fill="none"/><circle cx="19" cy="22" r="2"/><circle cx="25" cy="22" r="2"/><circle cx="31" cy="22" r="2"/></svg><b>{messagesCount || 0}</b></span><span>Messages</span>
          </Link>
          <div role="button" tabIndex={0} onClick={() => go('/profile')} onKeyDown={(e) => e.key === 'Enter' && go('/profile')} className="tmpl-nav-item tmpl-profile-tab" style={{ cursor: 'pointer' }}>
            <svg viewBox="0 0 48 48"><circle cx="24" cy="17" r="7" fill="none"/><path d="M10 39c1-8 7-12 14-12s13 4 14 12" fill="none"/></svg><span>Profile</span>
          </div>
        </nav>
      </div>
    </>
  );
}
