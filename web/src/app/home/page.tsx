'use client';
import React, { useState, useEffect, CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { useMobile } from '@/lib/useMediaQuery';
import { matchService, userService, storageService, feedService } from '@/lib/cloudflare/services';
import { profileCompletion } from '@/lib/profileCompletion';

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
  fontSize: 44, fontWeight: 800, color: '#fff', background: 'linear-gradient(135deg, #FF2E5F, #FF1747)',
};

function StoryAvatar({ photo, name }: { photo: string; name: string }) {
  if (photo) return <img src={photo} alt="" loading="lazy" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />;
  return <div style={{ position: 'absolute', inset: 0, ...GRAD_PLACEHOLDER, background: 'linear-gradient(135deg, #FF2E5F, #B44CFF)' }}>{name[0]}</div>;
}

const MOCK_STORIES: { id: string; name: string; ago: string; caption: string; bg: string }[] = [
  { id: 'mock-1', name: 'Nnenna', ago: '2h ago', caption: 'Sunset vibes 😍', bg: 'linear-gradient(150deg, #ff9a9e, #fad0c4 60%, #fbc2eb)' },
  { id: 'mock-2', name: 'Amaka', ago: '3h ago', caption: 'Beach day 🏖️', bg: 'linear-gradient(150deg, #a1c4fd, #c2e9fb 70%, #96e6a1)' },
  { id: 'mock-3', name: 'Kelechi', ago: '4h ago', caption: 'New week ⚡', bg: 'linear-gradient(150deg, #f6d365, #fda085 70%, #ff8177)' },
  { id: 'mock-4', name: 'Chioma', ago: '5h ago', caption: 'Good morning 💗', bg: 'linear-gradient(150deg, #d299c2, #fef9d7 60%, #f7cde4)' },
  { id: 'mock-5', name: 'Tobi', ago: '6h ago', caption: 'Grateful 🙏', bg: 'linear-gradient(150deg, #84fab0, #8fd3f4 70%, #a6c1ee)' },
  { id: 'mock-6', name: 'Adaeze', ago: '7h ago', caption: 'City lights ✨', bg: 'linear-gradient(150deg, #667eea, #764ba2 70%, #f093fb)' },
];

function MockStoryCard({ s }: { s: (typeof MOCK_STORIES)[number] }) {
  return (
    <button
      className="tmpl-story-card"
      onClick={() => undefined}
      aria-label={`${s.name} story`}
    >
      <span aria-hidden="true" style={{ position: 'absolute', inset: 0, display: 'block', background: s.bg }} />
      <div className="tmpl-shade"></div>
      <div className="tmpl-story-user"><span>◉</span><div>{s.name}<small>{s.ago}</small></div></div>
      <p>{s.caption}</p>
    </button>
  );
}

export default function HomePage() {
  const { profile, isAuthenticated, loading } = useAuth();
  const isMobile = useMobile();
  const router = useRouter();

  const [likesCount, setLikesCount] = useState(0);
  const [matchesCount, setMatchesCount] = useState(0);
  const [nearby, setNearby] = useState<any[]>([]);
  const [nearbyCount, setNearbyCount] = useState(0);
  const [activeMembers, setActiveMembers] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [messagesCount, setMessagesCount] = useState(0);
  const [likePhoto, setLikePhoto] = useState('');
  const [matchPhoto, setMatchPhoto] = useState('');

  const uid = (profile as any)?.$id || (profile as any)?.id;
  const profilePhoto = profile?.photos?.[0] ? storageService.getFilePreview(profile.photos[0]) : '';
  const fullName = (profile as any)?.fullName || (profile as any)?.displayName || 'Your';
  const completion = profileCompletion(profile);
  const initial = (fullName[0] || 'O').toUpperCase();

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    if (!profile || !uid) return;

    Promise.allSettled([
      matchService.getWhoLikedMe(uid),
      matchService.getUserMatches(uid),
    ]).then(([likesRes, matchesRes]) => {
      if (likesRes.status === 'fulfilled') {
        const likes = Array.isArray(likesRes.value) ? likesRes.value : (likesRes.value?.documents || []);
        setLikesCount(likes.length);
        const first = likes[0]?.matchedUser;
        if (first?.photos?.[0]) setLikePhoto(storageService.getFilePreview(first.photos[0]));
      }
      if (matchesRes.status === 'fulfilled') {
        const docs = Array.isArray(matchesRes.value) ? matchesRes.value : (matchesRes.value?.documents || []);
        const newMatches = docs.filter((d: any) => !d.hasConversation);
        setMatchesCount(newMatches.length);
        setMessagesCount(docs.reduce((s: number, d: any) => s + Number(d.unreadCount || 0), 0));
        const firstNew = newMatches[0]?.matchedUser;
        if (firstNew?.photos?.[0]) setMatchPhoto(storageService.getFilePreview(firstNew.photos[0]));
      }
    });

    if (profile?.interestedIn) {
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
      userService.getDiscoverUsers(uid, {
        gender: profile.interestedIn === 'both' ? 'male' : profile.interestedIn,
        minAge: 18, maxAge: 60, maxDistance: 25,
        ...(savedLat !== undefined && savedLng !== undefined ? { lat: savedLat, lng: savedLng } : {}),
      }).then((docs: any[]) => {
        const all = Array.isArray(docs) ? docs : [];
        setNearbyCount(all.length);
        setNearby(all.slice(0, 12));
        setActiveMembers(
          [...all]
            .sort((a: any, b: any) => {
              const ta = a.lastActive ? new Date(a.lastActive).getTime() : 0;
              const tb = b.lastActive ? new Date(b.lastActive).getTime() : 0;
              return tb - ta;
            })
            .slice(0, 6)
        );
      }).catch(() => {});
    }

    feedService.getFeed(profile?.interests || []).then((d: any) => {
      const posts = d?.documents || d?.posts || (Array.isArray(d) ? d : []);
      const grouped = new Map<string, any>();
      for (const p of posts) {
        const uid = p.userId || p.user || p.$id;
        if (!uid) continue;
        const imgs = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
        if (imgs.length === 0) continue;
        if (!grouped.has(uid)) {
          grouped.set(uid, {
            id: uid,
            name: p.userName || 'Odogwu',
            avatar: p.userPhoto ? storageService.getFilePreview(p.userPhoto) : '',
            last: p.createdAt || '',
            slides: [],
          });
        }
        const g = grouped.get(uid);
        const ago = formatAgo(p.createdAt);
        for (const im of imgs) {
          g.slides.push({ postId: p.id || p.$id, img: storageService.getFilePreview(im), ago, caption: p.caption || '' });
        }
      }
      setStories(
        [...grouped.values()]
          .sort((a, b) => ((b.last || '') < (a.last || '') ? -1 : 1))
          .slice(0, 6)
      );
    }).catch(() => {});
  }, [loading, isAuthenticated, profile, uid]);

  const go = (href: string) => router.push(href);

  return (
    <>
      <style jsx global>{`
        .tmpl-app {
          width: 100%; max-width: 710px; margin: 0 auto; background: #FEFEFE;
          min-height: 100svh; position: relative; padding: 0 12px 108px;
          color: #111; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', Arial, Helvetica, sans-serif;
          box-sizing: border-box; -webkit-font-smoothing: antialiased;
        }
        .tmpl-topbar { display: flex; align-items: center; justify-content: space-between; position: relative; height: 64px; padding: 0 0 4px; }
        .tmpl-icon-btn { color: #111; background: none; border: 0; cursor: pointer; padding: 0; display: grid; place-items: center; }
        .tmpl-menu { width: 20px; }
        .tmpl-menu span { display: block; width: 20px; height: 2px; background: #111; margin: 6px 0; border-radius: 2px; }
        .tmpl-wordmark { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); text-align: center; }
        .tmpl-wordmark-name { font-size: 27px; font-weight: 800; line-height: 30px; letter-spacing: -0.5px; color: #D90540; }
        .tmpl-wordmark-sub { font-size: 10px; font-weight: 500; letter-spacing: 4.2px; color: #1A1A1A; line-height: 12px; text-align: center; margin-top: 2px; }
        .tmpl-wordmark-sub b { color: #D90540; font-weight: 400; letter-spacing: 0; margin: 0 4px; }
        .tmpl-wordmark-sub span { color: #D90540; }
        .tmpl-brand { display: flex; align-items: center; gap: 9px; }
        .tmpl-brand-mark { width: 66px; height: 66px; border: 7px solid #cf0a13; border-radius: 50%; position: relative; flex-shrink: 0; box-sizing: border-box; object-fit: cover; display: block; }
        .tmpl-brand-mark:before { content: ""; position: absolute; width: 18px; height: 18px; border: 6px solid #fff; border-radius: 50%; background: #cf0a13; left: -5px; top: -5px; box-sizing: border-box; }
        .tmpl-brand-mark i { position: absolute; width: 16px; height: 16px; border: 4px solid #fff; border-top-color: transparent; border-radius: 50%; right: 7px; top: 4px; box-sizing: border-box; }
        .tmpl-brand-name { font-size: 42px; line-height: 39px; font-weight: 800; letter-spacing: -2px; color: #bd0d17; }
        .tmpl-brand-sub { text-align: center; font-size: 13px; font-weight: 700; letter-spacing: 6px; margin-top: 8px; }
        .tmpl-brand-sub b { color: #d20a19; letter-spacing: 0; }
        .tmpl-brand-sub span { color: #d20a19; }
        .tmpl-messages-top { position: relative; width: 27px; height: 27px; background: none; border: 0; cursor: pointer; color: #111; padding: 0; }
        .tmpl-messages-top svg { width: 27px; height: 27px; }
        .tmpl-messages-top em { position: absolute; right: -9px; top: -5px; background: #D90540; color: #fff; min-width: 18px; height: 18px; border-radius: 50%; font-style: normal; font-size: 10px; font-weight: 600; line-height: 18px; display: grid; place-items: center; padding: 0 3px; box-sizing: border-box; }
        .tmpl-premium { height: 57px; background: #FCF1F3; border-radius: 15px; display: flex; align-items: center; padding: 8px 15px; margin-bottom: 20px; box-sizing: border-box; }
        .tmpl-crown { width: 38px; height: 38px; background: #D90540; color: #FFD21D; border-radius: 50%; display: grid; place-items: center; margin-right: 12px; flex-shrink: 0; }
        .tmpl-crown svg { width: 23px; height: 20px; display: block; }
        .tmpl-premium-copy { flex: 1; min-width: 0; }
        .tmpl-premium h3 { font-size: 12.75px; margin: 0 0 3px; color: #111; font-weight: 700; letter-spacing: -0.2px; line-height: 21px; }
        .tmpl-premium p { font-size: 10.5px; line-height: 19px; color: #586273; margin: 0; font-weight: 400; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tmpl-pink-btn { background: #D90540; color: #fff; border: 0; border-radius: 18px; width: 67px; height: 28px; padding: 0; font-size: 10.5px; font-weight: 600; line-height: 17px; text-align: center; display: grid; place-items: center; cursor: pointer; white-space: nowrap; margin-left: 10px; flex-shrink: 0; box-sizing: border-box; }
        .tmpl-quick-nav { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin: 4px 0 24px; }
        .tmpl-quick { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; color: #111; background: none; border: 0; cursor: pointer; padding: 0; min-width: 0; }
        .tmpl-round-photo { width: 59px; height: 59px; border-radius: 50%; padding: 3px; box-sizing: border-box; display: block; position: relative; background: #fff; }
        .tmpl-round-photo:not(.location):not(.story) { background: conic-gradient(#E67A00 0 50%, #D90540 50% 100%); }
        .tmpl-quick:nth-child(3) .tmpl-round-photo:not(.location):not(.story) { background: conic-gradient(#D90540 0 55%, #FF5A3C 55% 100%); }
        .tmpl-round-photo.story { border: 2px dashed #E77A99; background: conic-gradient(#D90540 0 calc(var(--pct, 0) * 1%), transparent 0); }
        .tmpl-round-photo > img, .tmpl-round-photo > div { inset: 3px !important; width: calc(100% - 6px) !important; height: calc(100% - 6px) !important; border-radius: 50%; object-fit: cover; display: block; }
        .tmpl-round-photo.location { display: block; background: conic-gradient(#D90540 0 180deg, #B9CE1A 180deg 360deg); }
        .tmpl-round-photo.location svg { position: absolute; inset: 3px; width: calc(100% - 6px); height: calc(100% - 6px); background: #F1F0EE; border-radius: 50%; padding: 17%; box-sizing: border-box; fill: #D90540; }
        .tmpl-quick label { font-size: 14px; font-weight: 500; margin-top: 7px; color: #111; text-align: center; line-height: 18px; }
        .tmpl-badge, .tmpl-plus { position: absolute; right: -3px; bottom: -3px; background: #D90540; color: #fff; border-radius: 50%; width: 19px; height: 19px; display: grid; place-items: center; font-size: 10px; font-weight: 600; z-index: 3; border: 2px solid #fff; line-height: 1; padding: 0; box-sizing: border-box; }
        .tmpl-plus { font-size: 15px; font-weight: 500; }
.tmpl-section h2 { font-size: 20px; margin: 0 0 12px; font-weight: 700; color: #111; letter-spacing: -0.25px; line-height: 24px; }
.tmpl-section h2 span { font-size: 19px; }
.tmpl-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.tmpl-section-head h2 { margin-bottom: 0; }
.tmpl-see-more { background: none; border: none; padding: 0; font-size: 14px; font-weight: 600; color: #D90540; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
        .tmpl-stories { display: flex; gap: 5px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
        .tmpl-stories::-webkit-scrollbar { display: none; }
        .tmpl-story-card { height: 157px; flex: 0 0 68px; min-width: 0; border-radius: 14px; overflow: hidden; position: relative; background: #E8E8E8; color: #fff; cursor: pointer; border: 0; padding: 0; display: block; text-decoration: none; }
        .tmpl-story-card > img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tmpl-shade { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,.12), rgba(0,0,0,0) 45%, rgba(0,0,0,.67)); }
        .tmpl-story-user { position: absolute; left: 7px; top: 8px; display: flex; gap: 6px; align-items: center; font-size: 11px; text-shadow: 0 1px 2px rgba(0,0,0,.7); }
        .tmpl-story-user span { width: 22px; height: 22px; border-radius: 50%; background: #222; border: 1.5px solid #fff; display: grid; place-items: center; font-size: 10px; flex-shrink: 0; }
        .tmpl-story-user img { width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid #fff; object-fit: cover; display: block; flex-shrink: 0; }
        .tmpl-story-user div { font-size: 11px; font-weight: 600; line-height: 14px; }
        .tmpl-story-user small { display: block; font-size: 10px; font-weight: 400; line-height: 13px; margin-top: 1px; }
        .tmpl-story-card p { position: absolute; left: 7px; bottom: 7px; font-size: 11px; font-weight: 400; line-height: 14px; margin: 0; max-width: calc(100% - 14px); overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
        .tmpl-love-banner { height: 68px; border-radius: 16px; background: #FCF1F3; margin: 24px 0 20px; display: flex; align-items: center; padding: 10px 12px; gap: 12px; box-sizing: border-box; }
        .tmpl-hearts { width: 62px; height: 49px; flex-shrink: 0; display: grid; place-items: center; }
        .tmpl-hearts svg { width: 100%; height: 100%; display: block; }
        .tmpl-love-banner h3 { font-size: 17px; margin: 0 0 2px; color: #111; font-weight: 700; letter-spacing: -0.2px; line-height: 21px; white-space: nowrap; }
        .tmpl-love-banner p { font-size: 13px; line-height: 18px; color: #586273; margin: 0; }
        .tmpl-outline-btn { margin-left: auto; border: 1px solid #EBCBD2; border-radius: 18px; padding: 0 14px; height: 31px; color: #C91645; background: #FFF9FA; white-space: nowrap; font-weight: 600; cursor: pointer; font-size: 12px; line-height: 16px; flex-shrink: 0; display: grid; place-items: center; }
        .tmpl-active-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .tmpl-profile-card { aspect-ratio: 1.04 / 1; border-radius: 12px; overflow: hidden; position: relative; color: #fff; background: #E8E8E8; cursor: pointer; border: 0; padding: 0; width: 100%; }
        .tmpl-profile-card > img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tmpl-profile-card:after { content: ""; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,.62)); }
        .tmpl-profile-card div { position: absolute; left: 8px; right: 8px; bottom: 6px; z-index: 2; font-size: 13px; font-weight: 600; line-height: 17px; text-align: left; }
        .tmpl-profile-card small { display: block; font-size: 11px; font-weight: 400; line-height: 14px; margin-top: 0; }
        .tmpl-profile-card i { position: absolute; right: 8px; top: 8px; width: 8px; height: 8px; background: #16E86D; border-radius: 50%; z-index: 3; }
        .tmpl-bottom-nav { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: calc(100% - 16px); max-width: 377px; height: 75px; background: #fff; border: 0; border-top-left-radius: 24px; border-top-right-radius: 24px; box-shadow: 0 -2px 12px rgba(0,0,0,.035); display: grid; grid-template-columns: repeat(5, 1fr); align-items: end; padding: 8px 12px 12px; z-index: 10; box-sizing: border-box; }
        .tmpl-nav-item { height: 60px; color: #89919E; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; font-size: 12px; font-weight: 500; line-height: 16px; text-decoration: none; background: none; border: 0; padding: 0; cursor: pointer; }
        .tmpl-nav-item svg { width: 24px; height: 24px; stroke: currentColor; stroke-width: 1.8; fill: currentColor; }
        .tmpl-nav-item:not(.active) svg { fill: none; }
        .tmpl-nav-item.active { color: #D90540; font-weight: 600; }
        .tmpl-nav-icon-wrap { position: relative; display: grid; }
        .tmpl-nav-icon-wrap b { position: absolute; right: -8px; top: -7px; background: #D90540; color: #fff; border-radius: 50%; min-width: 18px; height: 18px; font-size: 10px; font-weight: 600; line-height: 18px; text-align: center; padding: 0 3px; box-sizing: border-box; }
        .tmpl-nav-center { width: 56px; height: 56px; border-radius: 50%; background: #D90540; position: relative; top: -14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(217,5,64,.35); justify-self: center; text-decoration: none; cursor: pointer; }
        .tmpl-nav-center img { width: 30px; height: 30px; object-fit: contain; filter: brightness(0) invert(1); }
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

        @media (max-width: 359px) {
          .tmpl-premium { padding: 8px 10px; }
          .tmpl-premium p { font-size: 12px; }
          .tmpl-pink-btn { padding: 0 10px; font-size: 13px; }
          .tmpl-round-photo { width: 53px; height: 53px; }
          .tmpl-story-card { height: 150px; flex-basis: 64px; }
          .tmpl-hearts { width: 52px; height: 42px; }
        }

        @media (min-width: 768px) {
          html, body { background: #ececec; }
          .tmpl-app {
            max-width: none;
            padding: 34px 40px 45px 295px;
            background: #fff;
          }
          .tmpl-app > .tmpl-topbar { display: none; }
          .tmpl-premium,
          .tmpl-quick-nav,
          .tmpl-section,
          .tmpl-love-banner {
            max-width: 1240px;
            margin-left: auto;
            margin-right: auto;
            width: 100%;
          }
          .tmpl-premium { margin-top: 20px; height: 118px; padding: 20px 28px; }
          .tmpl-premium h3 { font-size: 24px; margin-bottom: 4px; }
          .tmpl-premium p { font-size: 17px; white-space: normal; }
          .tmpl-pink-btn { height: 46px; line-height: 46px; width: auto; padding: 0 26px; font-size: 17px; border-radius: 23px; }
          .tmpl-quick-nav {
            grid-template-columns: repeat(4, 105px);
            gap: 45px;
            margin: 8px auto 40px;
          }
          .tmpl-round-photo { width: 105px; height: 105px; }
          .tmpl-round-photo.location svg { padding: 12%; }
          .tmpl-quick label { font-size: 16px; }
          .tmpl-section h2 { font-size: 21px; margin-bottom: 14px; }
          .tmpl-stories { gap: 15px; }
          .tmpl-story-card { height: 270px; flex: 1 1 0; min-width: 0; }
          .tmpl-story-user span, .tmpl-story-user img { width: 34px; height: 34px; }
          .tmpl-story-user div { font-size: 14px; line-height: 17px; }
          .tmpl-story-user small { font-size: 12px; line-height: 15px; }
          .tmpl-story-card p { font-size: 14px; line-height: 17px; }
          .tmpl-love-banner { height: 130px; margin-top: 32px; padding: 20px 30px; }
          .tmpl-hearts { width: 90px; height: 70px; }
          .tmpl-love-banner h3 { font-size: 20px; }
          .tmpl-love-banner p { font-size: 16px; line-height: 22px; }
          .tmpl-outline-btn { height: 46px; padding: 0 22px; font-size: 14px; border-radius: 23px; }
          .tmpl-active-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
          .tmpl-profile-card { aspect-ratio: 3 / 4; }
          .tmpl-bottom-nav { display: none; }
        }

        @media (min-width: 1300px) {
          .tmpl-premium, .tmpl-section, .tmpl-love-banner { max-width: 1320px; }
          .tmpl-quick-nav { max-width: 1320px; }
          .tmpl-story-card { height: 295px; }
          .tmpl-profile-card { aspect-ratio: 3 / 4; }
        }
      `}</style>
      <style jsx>{`
        @media (min-width: 768px) {
          .tmpl-desktop-only { display: block !important; }
          .tmpl-mobile-only .tmpl-topbar { display: none !important; }
        }
      `}</style>

      {/* Desktop sidebar */}
      <div className="tmpl-desktop-only" style={{ display: 'none' }}>
        <aside className="tmpl-sidebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '0 0 58px 7px' }}>
            <img className="tmpl-brand-mark" src="/o-logo.png" alt="Odogwu" width={48} height={48} decoding="async" />
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
            <button onClick={() => go('/my-matches')}>♥&nbsp;&nbsp;Matches</button>
            <button onClick={() => go('/likes')}>♧&nbsp;&nbsp;Likes You</button>
            <button onClick={() => go('/nearby')}>◎&nbsp;&nbsp;Nearby</button>
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
              ? { maxWidth: '100%', width: '100%', minHeight: '100svh', paddingLeft: 295, paddingRight: 40, paddingTop: 0, paddingBottom: 45 }
              : undefined
          }
        >
          <header className="tmpl-topbar">
            <button className="tmpl-icon-btn tmpl-menu" aria-label="Menu" onClick={() => go('/settings')}>
              <span></span><span></span><span></span>
            </button>
            <div className="tmpl-wordmark">
              <div className="tmpl-wordmark-name">DOGWU</div>
              <div className="tmpl-wordmark-sub"><b>—</b> D A T <span>♥</span> I N G <b>—</b></div>
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

          <section className="tmpl-premium">
            <div className="tmpl-crown">
              <svg viewBox="0 0 24 18" aria-hidden="true"><path d="M2 14.5 5 6l4 4 3-6 3 6 4-4 3 8.5Z" fill="#FFD21D"/><rect x="2" y="15.5" width="20" height="2.5" rx="1.25" fill="#FFD21D"/></svg>
            </div>
            <div className="tmpl-premium-copy">
              <h3>Upgrade to Premium</h3>
              <p>Unlock all features &amp; more</p>
            </div>
            <button className="tmpl-pink-btn" onClick={() => go('/premium')}>Upgrade</button>
          </section>

          <section className="tmpl-quick-nav">
            <button className="tmpl-quick" onClick={() => go('/edit-profile')}>
              <span className="tmpl-round-photo story" style={{ ['--pct' as any]: completion }}>
                <StoryAvatar photo={profilePhoto} name={initial} />
                <b className="tmpl-plus">+</b>
              </span>
              <label>Your Story</label>
            </button>
            <button className="tmpl-quick" onClick={() => go('/likes')}>
              <span className="tmpl-round-photo">
                {likePhoto ? (
                  <StoryAvatar photo={likePhoto} name="L" />
                ) : (
                  <div style={{ position: 'absolute', inset: 2, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 48 48" style={{ width: 26, height: 26, fill: '#FF2E5F', display: 'block' }}>
                      <path d="M24 40s-14-9-14-20a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 11-14 20-14 20Z"/>
                    </svg>
                  </div>
                )}
                <b className="tmpl-badge">{likesCount}</b>
              </span>
              <label>Likes You</label>
            </button>
            <button className="tmpl-quick" onClick={() => go('/my-matches')}>
              <span className="tmpl-round-photo">
                {matchPhoto ? (
                  <StoryAvatar photo={matchPhoto} name="M" />
                ) : (
                  <div style={{ position: 'absolute', inset: 2, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 48 48" style={{ width: 26, height: 26, fill: '#FF2E5F', display: 'block' }}>
                      <path d="M24 40s-14-9-14-20a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 11-14 20-14 20Z"/>
                    </svg>
                  </div>
                )}
                <b className="tmpl-badge">{matchesCount}</b>
              </span>
              <label>Matches</label>
            </button>
            <button className="tmpl-quick" onClick={() => go('/nearby')}>
              <span className="tmpl-round-photo location">
                <svg viewBox="0 0 64 64"><path d="M32 7c-12 0-21 9-21 21 0 15 21 29 21 29s21-14 21-29C53 16 44 7 32 7Zm0 29a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"/></svg>
                <b className="tmpl-badge">{nearbyCount}</b>
              </span>
              <label>Nearby</label>
            </button>
          </section>

          <section className="tmpl-section">
            <h2>Top Stories <span>🔥</span></h2>
            <div className="tmpl-stories">
{stories.length === 0
                ? MOCK_STORIES.map(s => <MockStoryCard key={s.id} s={s} />)
                : stories.map((s: any, i: number) => {
                    const first = (s.slides && s.slides[0]) || {};
                    return (
                      <Link
                        key={s.id}
                        href={`/story/${s.id}?key=home-stories&idx=${i}`}
                        onClick={() => {
                          try { sessionStorage.setItem('home-stories', JSON.stringify(stories)); } catch {}
                        }}
                        className="tmpl-story-card"
                      >
                        {first.img
                          ? <img src={first.img} alt="" loading="lazy" decoding="async" />
                          : <StoryAvatar photo="" name={s.name[0]} />}
                        <div className="tmpl-shade"></div>
                        <div className="tmpl-story-user">{s.avatar ? <img src={s.avatar} alt="" loading="lazy" decoding="async" /> : <span>◉</span>}<div>{s.name}<small>{first.ago}</small></div></div>
                        <p>{first.caption}</p>
                      </Link>
                    );
                  })}
            </div>
          </section>

          <section className="tmpl-love-banner">
            <div className="tmpl-hearts">
              <svg viewBox="0 0 62 49" aria-hidden="true">
                <path d="M31 44C31 44 12 32 7 21 3.5 13.5 9 5 17 5c5 0 10 3 14 8.5C35 8 40 5 45 5c8 0 13.5 8.5 10 16-5 11-24 23-24 23Z" fill="#D90540"/>
                <path d="M31 40C31 40 16 30 12 21 9 14.5 13.5 8 20 8c4 0 7.5 2.5 11 7.5C34.5 10.5 38 8 42 8c6.5 0 11 6.5 8 13-4 9-19 19-19 19Z" fill="#E82C61"/>
                <path d="M31 35C31 35 19.5 28 16.5 21 14.4 16.5 17.5 11.5 22.5 11.5c3 0 5.5 2 8.5 6 3-4 5.5-6 8.5-6 5 0 8.1 5 6 9.5C40.5 28 31 35 31 35Z" fill="#F8B5C5"/>
                <path d="M44.5 6.5a1.6 1.6 0 0 1 2.9-1.4 1.6 1.6 0 0 1-2.9 1.4Z" fill="#FFD5DE"/>
                <path d="M50 15.5a1.1 1.1 0 0 1 2-1 1.1 1.1 0 0 1-2 1Z" fill="#FFD5DE"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3>Love is better together <span>💕</span></h3>
              <p>Complete your profile, increase your visibility and find your perfect match.</p>
            </div>
            <button className="tmpl-outline-btn" onClick={() => go('/edit-profile')}>Complete Profile</button>
          </section>

          <section className="tmpl-section">
            <div className="tmpl-section-head">
              <h2>Recently Active</h2>
              <button className="tmpl-see-more" onClick={() => go('/active')}>See all</button>
            </div>
            <div className="tmpl-active-grid">
              {activeMembers.length === 0 && (
                <div style={{ color: '#999', fontSize: 14, padding: '20px 4px', gridColumn: '1 / -1' }}>
                  No recently active members yet. Check back soon!
                </div>
              )}
              {activeMembers.map((p: any, idx: number) => {
                const mid = p.id || p.$id || '';
                const photo = p.photos?.[0] ? storageService.getFilePreview(p.photos[0]) : '';
                const name = p.fullName || 'Member';
                const online = !!p.lastActive && (Date.now() - new Date(p.lastActive).getTime()) < 120000;
                const ago = p.lastActive ? formatAgo(p.lastActive) : 'Recently';
                return (
                  <button key={mid || idx} className="tmpl-profile-card" onClick={() => mid && go(`/my-profile/${mid}`)}>
                    <StoryAvatar photo={photo} name={name[0]} />
                    {online && <i></i>}
                    <div>{name}<small>{online ? 'Online' : ago}</small></div>
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
          <Link href="/discover" className="tmpl-nav-center"><img src="/logo-icon.png?v=2" alt="Discover" width={44} height={44} decoding="async" /></Link>
          <Link href="/matches" className="tmpl-nav-item">
            <span className="tmpl-nav-icon-wrap"><svg viewBox="0 0 48 48"><path d="M9 34l2-7a14 14 0 1 1 5 5l-7 2Z" fill="none"/><circle cx="19" cy="22" r="2"/><circle cx="25" cy="22" r="2"/><circle cx="31" cy="22" r="2"/></svg><b>{messagesCount || 0}</b></span><span>Messages</span>
          </Link>
          <div role="button" tabIndex={0} onClick={() => go('/edit-profile')} onKeyDown={(e) => e.key === 'Enter' && go('/edit-profile')} className="tmpl-nav-item tmpl-profile-tab" style={{ cursor: 'pointer' }}>
            <svg viewBox="0 0 48 48"><circle cx="24" cy="17" r="7" fill="none"/><path d="M10 39c1-8 7-12 14-12s13 4 14 12" fill="none"/></svg><span>Profile</span>
          </div>
        </nav>
      </div>
    </>
  );
}
