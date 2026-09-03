'use client';
import React, { useState, useEffect, CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { useMobile } from '@/lib/useMediaQuery';
import { matchService, userService, storageService, feedService } from '@/lib/cloudflare/services';

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
  if (photo) return <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />;
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
  const [stories, setStories] = useState<any[]>([]);
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
    ]).then(([likesRes, matchesRes]) => {
      if (likesRes.status === 'fulfilled') setLikesCount(Array.isArray(likesRes.value) ? likesRes.value.length : (likesRes.value?.total || 0));
      if (matchesRes.status === 'fulfilled') {
        const docs = Array.isArray(matchesRes.value) ? matchesRes.value : (matchesRes.value?.documents || []);
        setMatchesCount(docs.length);
        setMessagesCount(docs.filter((d: any) => d.hasConversation).length);
      }
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
        .tmpl-premium { min-height: 105px; height: auto; background: #fff1f5; border-radius: 18px; display: flex; align-items: center; padding: 10px 22px; margin-bottom: 18px; }
        .tmpl-crown { width: 52px; height: 52px; background: #df164c; color: #ffd12a; border-radius: 50%; display: grid; place-items: center; font-size: 32px; margin-right: 15px; flex-shrink: 0; }
        .tmpl-premium-copy { flex: 1; }
        .tmpl-premium h3 { font-size: 16px; margin: 0 0 5px; color: #151515; font-weight: 800; }
        .tmpl-premium p { font-size: 13px; line-height: 19px; color: #555; margin: 0; font-weight: 700; }
        .tmpl-pink-btn { background: #FF1747; color: #fff; border-radius: 28px; padding: 15px 27px; font-size: 16px; border: 0; cursor: pointer; font-weight: 600; }
        .tmpl-quick-nav { display: grid; grid-template-columns: repeat(4, 1fr); gap: 25px; margin: 3px 0 26px; }
        .tmpl-quick { position: relative; display: flex; flex-direction: column; align-items: center; color: #171717; background: none; border: 0; cursor: pointer; padding: 0; min-width: 0; }
        .tmpl-round-photo { width: 111px; max-width: 100%; height: auto; aspect-ratio: 1/1; border: 4px solid #d30e42; border-radius: 50%; padding: 5px; display: block; position: relative; background: #fff; box-sizing: border-box; overflow: hidden; }
        .tmpl-round-photo.dashed { border-style: dashed; border-color: #ec6690; }
        .tmpl-round-photo > img, .tmpl-round-photo > div { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; }
        .tmpl-round-photo.location { display: grid; place-items: center; border-color: #c7a523; }
        .tmpl-round-photo.location svg { width: 57px; height: 57px; fill: #df164b; }
        .tmpl-quick label { font-size: 16px; font-weight: 500; margin-top: 10px; color: #171717; text-align: center; line-height: 1.2; }
        .tmpl-badge, .tmpl-plus { position: absolute; right: 0; top: 78%; background: #d9184b; color: #fff; border-radius: 50%; width: 34px; height: 34px; display: grid; place-items: center; font-size: 15px; font-weight: 700; z-index: 3; transform: translate(15%, -15%); }
        .tmpl-plus { font-size: 25px; font-weight: 400; }
        .tmpl-section h2 { font-size: 20px; margin: 0 0 10px; font-weight: 700; color: #151515; }
        .tmpl-section h2 span { font-size: 19px; }
        .tmpl-stories { display: flex; gap: 7px; overflow-x: auto; padding-bottom: 4px; }
        .tmpl-story-card { height: 260px; flex: 1 0 152px; min-width: 0; border-radius: 15px; overflow: hidden; position: relative; background: #333; color: #fff; cursor: pointer; border: 0; padding: 0; display: block; text-decoration: none; }
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
        .tmpl-profile-card { aspect-ratio: 3 / 4; border-radius: 14px; overflow: hidden; position: relative; color: #fff; background: #444; cursor: pointer; border: 0; padding: 0; width: 100%; }
        .tmpl-profile-card > img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .tmpl-profile-card:after { content: ""; position: absolute; inset: 0; background: linear-gradient(transparent 50%, rgba(0,0,0,.55)); }
        .tmpl-profile-card div { position: absolute; left: 12px; bottom: 12px; z-index: 2; font-size: 12px; font-weight: 700; text-align: left; }
        .tmpl-profile-card small { display: block; font-size: 10px; margin-top: 0; font-weight: 700; line-height: 1; }
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
          .tmpl-app { padding-left: 18px; padding-right: 18px; }
          .tmpl-brand-name { font-size: 30px; line-height: 28px; }
          .tmpl-brand-mark { width: 48px; height: 48px; border-width: 5px; }
          .tmpl-brand-mark:before { width: 13px; height: 13px; border-width: 4px; left: -4px; top: -4px; }
          .tmpl-brand-mark i { width: 12px; height: 12px; border-width: 3px; right: 6px; top: 3px; }
          .tmpl-brand-sub { font-size: 8px; letter-spacing: 3px; margin-top: 6px; }
          .tmpl-topbar { height: 92px; }
          .tmpl-menu { margin-top: 24px; }
          .tmpl-menu span { width: 28px; }
          .tmpl-messages-top { width: 44px; height: 44px; margin-top: 24px; }
          .tmpl-messages-top svg { width: 34px; height: 34px; }
          .tmpl-messages-top em { width: 21px; height: 21px; font-size: 12px; right: -2px; }
          .tmpl-quick-nav { gap: 10px; margin-left: 0; margin-right: 0; }
          .tmpl-round-photo { width: 100%; border-width: 3px; padding: 3px; }
          .tmpl-round-photo.location svg { width: 50%; height: 50%; }
          .tmpl-pink-btn { margin-left: 12px; flex-shrink: 0; }
          .tmpl-badge, .tmpl-plus { width: 29px; height: 29px; font-size: 13px; }
          .tmpl-plus { font-size: 21px; }
          .tmpl-quick label { font-size: 12px; margin-top: 7px; }
          .tmpl-section h2 { font-size: 18px; }
          .tmpl-section h2 span { font-size: 17px; }
          .tmpl-stories { gap: 6px; }
          .tmpl-story-card { height: 215px; }
          .tmpl-story-user { font-size: 11px; left: 6px; top: 6px; gap: 4px; }
          .tmpl-story-user span { width: 20px; height: 20px; }
          .tmpl-story-user small { font-size: 9px; margin-top: 1px; white-space: nowrap; }
          .tmpl-story-card p { font-size: 11px; left: 8px; }
          .tmpl-love-banner { height: auto; min-height: 90px; padding: 12px; gap: 8px; }
          .tmpl-love-banner .tmpl-hearts { font-size: 34px; flex-shrink: 0; }
          .tmpl-love-banner > div:nth-child(2) { flex: 1; min-width: 0; }
          .tmpl-love-banner h3 { font-size: 13px; margin: 0 0 2px; white-space: nowrap; }
          .tmpl-love-banner p { font-size: 11px; line-height: 14px; }
          .tmpl-outline-btn { margin-left: 8px; padding: 11px 12px; font-size: 11px; flex-shrink: 0; }
          .tmpl-active-grid { grid-template-columns: repeat(3, 1fr); gap: 9px; }
          .tmpl-profile-card div { font-size: 11px; font-weight: 700; left: 9px; bottom: 9px; }
          .tmpl-profile-card i { width: 10px; height: 10px; right: 9px; top: 9px; }
          .tmpl-bottom-nav { height: 88px; padding: 6px 10px 10px; }
          .tmpl-nav-item { height: 62px; font-size: 12px; gap: 4px; }
          .tmpl-nav-item svg { width: 26px; height: 26px; }
          .tmpl-nav-center { width: 66px; height: 66px; font-size: 48px; }
          .tmpl-nav-icon-wrap b { width: 18px; height: 18px; font-size: 10px; }
        }

        @media (max-width: 400px) {
          .tmpl-app { padding-left: 14px; padding-right: 14px; padding-bottom: 96px; }
          .tmpl-brand-name { font-size: 26px; }
          .tmpl-brand-mark { width: 42px; height: 42px; }
          .tmpl-brand-sub { font-size: 7px; letter-spacing: 2px; }
          .tmpl-topbar { height: 80px; }
          .tmpl-menu { margin-top: 20px; }
          .tmpl-menu span { width: 24px; }
          .tmpl-messages-top { width: 38px; height: 38px; margin-top: 20px; }
          .tmpl-messages-top svg { width: 30px; height: 30px; }
          .tmpl-premium { padding: 5px 12px; }
          .tmpl-crown { width: 44px; height: 44px; font-size: 27px; margin-right: 11px; }
          .tmpl-premium h3 { font-size: 15px; font-weight: 800; }
          .tmpl-premium p { font-size: 12px; line-height: 17px; font-weight: 700; }
          .tmpl-pink-btn { padding: 11px 15px; font-size: 13px; margin-left: 10px; }
          .tmpl-quick-nav { gap: 6px; }
          .tmpl-badge, .tmpl-plus { width: 27px; height: 27px; font-size: 12px; }
          .tmpl-plus { font-size: 19px; }
          .tmpl-quick label { font-size: 11px; }
          .tmpl-story-card { height: 180px; }
          .tmpl-love-banner { gap: 6px; align-items: center; }
          .tmpl-love-banner .tmpl-hearts { font-size: 28px; }
          .tmpl-love-banner h3 { font-size: 12px; }
          .tmpl-love-banner p { font-size: 10px; line-height: 13px; }
          .tmpl-outline-btn { margin-left: 6px; padding: 10px 9px; font-size: 10px; }
          .tmpl-active-grid { grid-template-columns: repeat(3, 1fr); }
        }

        @media (max-width: 767px) {
          .tmpl-stories { gap: 6px; }
          .tmpl-story-card { flex: 1 1 0; min-width: calc((100% - 24px) / 5); }
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
          .tmpl-quick-nav {
            grid-template-columns: repeat(4, 105px);
            gap: 45px;
            margin: 8px auto 40px;
          }
          .tmpl-round-photo { width: 105px; border-width: 4px; padding: 5px; }
          .tmpl-round-photo.location svg { width: 57px; height: 57px; }
          .tmpl-section h2 { font-size: 21px; margin-bottom: 14px; }
          .tmpl-stories { gap: 15px; }
          .tmpl-story-card { height: 310px; flex: 1 1 0; flex-basis: auto; }
          .tmpl-love-banner { height: 130px; margin-top: 32px; padding: 20px 30px; }
          .tmpl-active-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
          .tmpl-profile-card { aspect-ratio: 3 / 4; }
          .tmpl-bottom-nav { display: none; }
        }

        @media (min-width: 1300px) {
          .tmpl-premium, .tmpl-section, .tmpl-love-banner { max-width: 1320px; }
          .tmpl-quick-nav { max-width: 1320px; }
          .tmpl-story-card { height: 335px; }
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

          <section className="tmpl-premium">
            <div className="tmpl-crown">♛</div>
            <div className="tmpl-premium-copy">
              <h3>Upgrade to Premium</h3>
              <p>Unlock all features and<br />connect without limits</p>
            </div>
            <button className="tmpl-pink-btn" onClick={() => go('/premium')}>Upgrade</button>
          </section>

          <section className="tmpl-quick-nav">
            <button className="tmpl-quick" onClick={() => go('/edit-profile')}>
              <span className="tmpl-round-photo dashed">
                <StoryAvatar photo={profilePhoto} name={initial} />
                <b className="tmpl-plus">+</b>
              </span>
              <label>Your Story</label>
            </button>
            <button className="tmpl-quick" onClick={() => go('/likes')}>
              <span className="tmpl-round-photo">
                <StoryAvatar photo={profilePhoto} name={initial} />
                <b className="tmpl-badge">{likesCount}</b>
              </span>
              <label>Likes You</label>
            </button>
            <button className="tmpl-quick" onClick={() => go('/matches')}>
              <span className="tmpl-round-photo">
                <StoryAvatar photo={profilePhoto} name={initial} />
                <b className="tmpl-badge">{matchesCount}</b>
              </span>
              <label>Matches</label>
            </button>
            <button className="tmpl-quick" onClick={() => go('/discover')}>
              <span className="tmpl-round-photo location">
                <svg viewBox="0 0 64 64"><path d="M32 7c-12 0-21 9-21 21 0 15 21 29 21 29s21-14 21-29C53 16 44 7 32 7Zm0 29a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"/></svg>
                <b className="tmpl-badge">{nearby.length}</b>
              </span>
              <label>Nearby</label>
            </button>
          </section>

          <section className="tmpl-section">
            <h2>Top Stories <span>🔥</span></h2>
            <div className="tmpl-stories">
              {stories.length === 0
                ? MOCK_STORIES.map(s => <MockStoryCard key={s.id} s={s} />)
                : stories.map((s: any) => (
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

          <section className="tmpl-love-banner">
            <div className="tmpl-hearts">💗</div>
            <div>
              <h3>Love is better together <span>💕</span></h3>
              <p>Complete your profile, increase your<br />visibility and find your perfect match.</p>
            </div>
            <button className="tmpl-outline-btn" onClick={() => go('/edit-profile')}>Complete Profile</button>
          </section>

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
