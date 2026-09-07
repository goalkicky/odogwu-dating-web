'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { matchService } from '@/lib/cloudflare/services';

function Brand() {
  return (
    <div className="uv-brand">
      <div className="uv-brand-mark"><i></i></div>
      <div>
        <div className="uv-brand-name">DOGWU</div>
        <div className="uv-brand-sub"><b>—</b> D A T <span>♥</span> I N G <b>—</b></div>
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading, isAuthenticated } = useAuth();
  const [messagesCount, setMessagesCount] = useState(0);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const uid = (profile as any)?.$id || (profile as any)?.id;

  useEffect(() => {
    if (loading || !isAuthenticated || !profile || !uid) return;
    matchService.getUserMatches(uid)
      .then((matchesRes: any) => {
        const docs = Array.isArray(matchesRes) ? matchesRes : (matchesRes?.documents || []);
        setMessagesCount(docs.filter((d: any) => d.hasConversation).length);
      })
      .catch(() => {});
  }, [loading, isAuthenticated, profile, uid]);

  const header = (
    <header className="uv-topbar">
      <button className="uv-icon-btn uv-menu" aria-label="Menu" onClick={() => router.push('/settings')}>
        <span></span><span></span><span></span>
      </button>
      <div className="uv-brand">
        <div className="uv-brand-mark"><i></i></div>
        <div>
          <div className="uv-brand-name">DOGWU</div>
          <div className="uv-brand-sub"><b>—</b> D A T <span>♥</span> I N G <b>—</b></div>
        </div>
      </div>
      <button className="uv-messages-top uv-icon-btn" aria-label="Messages" onClick={() => router.push('/matches')}>
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path d="M10 35l2-7a14 14 0 1 1 5 5l-7 2Z" fill="none" stroke="currentColor" strokeWidth="3"/>
          <circle cx="20" cy="22" r="1.7" fill="currentColor"/>
          <circle cx="26" cy="22" r="1.7" fill="currentColor"/>
          <circle cx="32" cy="22" r="1.7" fill="currentColor"/>
        </svg>
        <em>{messagesCount || 0}</em>
      </button>
    </header>
  );

  const desktopNav = [
    { href: '/home', label: 'Home', icon: <svg viewBox="0 0 48 48" className="uv-nav-svg"><path d="M8 22 24 9l16 13v17H29V28H19v11H8Z"/></svg> },
    { href: '/discover', label: 'Discover', icon: <svg viewBox="0 0 48 48" className="uv-nav-svg"><path d="M10 35l2-7a14 14 0 1 1 5 5l-7 2Z" fill="none"/></svg> },
    { href: '/explore', label: 'Explore', icon: <svg viewBox="0 0 48 48" className="uv-nav-svg"><circle cx="20" cy="22" r="2"/><circle cx="26" cy="22" r="2"/><circle cx="32" cy="22" r="2"/></svg> },
    { href: '/matches', label: 'Matches', icon: <svg viewBox="0 0 48 48" className="uv-nav-svg"><path d="M24 40s-14-9-14-20a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 11-14 20-14 20Z" fill="none" strokeWidth="2.4"/></svg> },
    { href: '/likes', label: 'Likes You', icon: <svg viewBox="0 0 48 48" className="uv-nav-svg"><circle cx="24" cy="17" r="7" fill="none" strokeWidth="2.6"/><path d="M10 39c1-8 7-12 14-12s13 4 14 12" fill="none" strokeWidth="2.6"/></svg> },
    { href: '/profile', label: 'Profile', icon: <svg viewBox="0 0 48 48" className="uv-nav-svg"><circle cx="24" cy="17" r="7" fill="none" strokeWidth="2.6"/><path d="M10 39c1-8 7-12 14-12s13 4 14 12" fill="none" strokeWidth="2.6"/></svg> },
    { href: '/settings', label: 'Settings', icon: <svg viewBox="0 0 48 48" className="uv-nav-svg"><circle cx="24" cy="24" r="10" fill="none" strokeWidth="2.6"/><path d="M24 6v6M24 36v6M6 24h6M36 24h6" strokeWidth="2.6"/></svg> },
  ];

  return (
    <div className="uv-shell">
      <style jsx global>{`
        .uv-shell { background: #ececec; min-height: 100svh; color: #151515; font-family: Arial, Helvetica, sans-serif; }
        .uv-shell a { text-decoration: none; }

        .uv-brand { display: flex; align-items: center; gap: 9px; }
        .uv-brand-mark { width: 66px; height: 66px; border: 7px solid #cf0a13; border-radius: 50%; position: relative; flex-shrink: 0; box-sizing: border-box; }
        .uv-brand-mark:before { content: ""; position: absolute; width: 18px; height: 18px; border: 6px solid #fff; border-radius: 50%; background: #cf0a13; left: -5px; top: -5px; box-sizing: border-box; }
        .uv-brand-mark i { position: absolute; width: 16px; height: 16px; border: 4px solid #fff; border-top-color: transparent; border-radius: 50%; right: 7px; top: 4px; box-sizing: border-box; }
        .uv-brand-name { font-size: 42px; line-height: 39px; font-weight: 800; letter-spacing: -2px; color: #bd0d17; }
        .uv-brand-sub { text-align: center; font-size: 13px; font-weight: 700; letter-spacing: 6px; margin-top: 8px; }
        .uv-brand-sub b { color: #d20a19; letter-spacing: 0; }
        .uv-brand-sub span { color: #d20a19; }

        .uv-topbar { display: flex; align-items: center; justify-content: space-between; position: relative; padding: 0 0 4px; }
        .uv-icon-btn { color: #171717; background: none; border: 0; cursor: pointer; padding: 0; }
        .uv-menu { width: 38px; padding: 0; }
        .uv-menu span { display: block; width: 34px; height: 3px; background: #222; margin: 8px 0; border-radius: 2px; }
        .uv-messages-top { position: relative; width: 50px; height: 50px; background: none; border: 0; cursor: pointer; color: #171717; padding: 0; }
        .uv-messages-top svg { width: 40px; height: 40px; }
        .uv-messages-top em { position: absolute; right: 0; top: -4px; background: #d71945; color: #fff; width: 24px; height: 24px; border-radius: 50%; font-style: normal; font-size: 13px; display: grid; place-items: center; font-weight: 700; }

        .uv-sidebar {
          position: fixed; left: 0; top: 0; width: 255px; height: 100vh;
          padding: 32px 24px; background: #fff; border-right: 1px solid #ececef;
          z-index: 30; box-sizing: border-box; display: flex; flex-direction: column;
        }
        .uv-sidebar .uv-brand { margin: 0 0 42px 7px; }
        .uv-sidebar .uv-brand-mark { width: 48px; height: 48px; border-width: 5px; }
        .uv-sidebar .uv-brand-mark:before { width: 13px; height: 13px; border-width: 4px; }
        .uv-sidebar .uv-brand-mark i { width: 12px; height: 12px; border-width: 3px; }
        .uv-sidebar .uv-brand-name { font-size: 30px; line-height: 29px; }
        .uv-sidebar .uv-brand-sub { font-size: 9px; letter-spacing: 4px; margin-top: 5px; }
        .uv-desktop-nav { display: flex; flex-direction: column; gap: 4px; }
        .uv-desktop-link {
          display: flex; align-items: center; gap: 13px; padding: 12px 16px;
          border-radius: 14px; color: #65656a; font-size: 15px; font-weight: 600;
        }
        .uv-desktop-link:hover { background: #fff0f4; color: #d20a19; }
        .uv-desktop-link.active { background: #fff0f4; color: #d20a19; font-weight: 700; }
        .uv-nav-svg { width: 24px; height: 24px; stroke: currentColor; stroke-width: 2; fill: currentColor; flex-shrink: 0; }
        .uv-desktop-link:not(.active) .uv-nav-svg { fill: none; }
        .uv-sidebar-bottom { margin-top: auto; padding: 14px 16px; border-radius: 16px; background: #fff0f4; }
        .uv-sidebar-bottom a { color: #d20a19; font-weight: 700; font-size: 13px; display: block; }

        .uv-content {
          min-height: 100svh; box-sizing: border-box; background: #fff;
        }
        .uv-content-inner { max-width: 1040px; margin: 0 auto; padding: 0 24px 60px; }
        .uv-content-inner > .uv-topbar { max-width: 710px; margin: 0 auto; }

        .uv-bottom-nav {
          position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 100%; max-width: 710px; z-index: 40;
          height: 88px; background: #fff; border-top: 1px solid #eee;
          display: grid; grid-template-columns: 1fr 1fr 1.1fr 1fr 1fr;
          align-items: end; padding: 6px 10px 10px; box-sizing: border-box;
        }
        .uv-nav-bl { width: 26px; height: 26px; stroke: currentColor; stroke-width: 2.2; fill: currentColor; }
        .uv-bottom-link {
          height: 62px; color: #777; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 4px; font-size: 12px;
        }
        .uv-bottom-link:not(.active) .uv-nav-bl { fill: none; }
        .uv-bottom-link.active { color: #d81043; }
        .uv-bottom-center {
          height: 62px; display: flex; align-items: center; justify-content: center;
          text-decoration: none; cursor: pointer;
        }
        .uv-bottom-center img { width: 58px; height: 58px; object-fit: cover; border-radius: 50%; }

        @media (min-width: 768px) {
          .uv-bottom-nav { display: none; }
        }
        @media (max-width: 767px) {
          .uv-desktop-only { display: none !important; }
          .uv-content-inner { padding: 22px 16px 96px; }
        }
        @media (max-width: 560px) {
          .uv-brand-name { font-size: 30px; line-height: 28px; }
          .uv-brand-mark { width: 48px; height: 48px; border-width: 5px; }
          .uv-brand-mark:before { width: 13px; height: 13px; border-width: 4px; left: -4px; top: -4px; }
          .uv-brand-mark i { width: 12px; height: 12px; border-width: 3px; right: 6px; top: 3px; }
          .uv-brand-sub { font-size: 8px; letter-spacing: 3px; margin-top: 6px; }
          .uv-menu span { width: 28px; }
          .uv-messages-top { width: 44px; height: 44px; }
          .uv-messages-top svg { width: 34px; height: 34px; }
          .uv-messages-top em { width: 21px; height: 21px; font-size: 12px; right: -2px; }
        }
      `}</style>

      {/* Desktop sidebar */}
      <aside className="uv-sidebar uv-desktop-only">
        <Brand />
        <nav className="uv-desktop-nav">
          {desktopNav.map(item => (
            <Link key={item.href} href={item.href} className={`uv-desktop-link ${isActive(item.href) ? 'active' : ''}`}>
              {item.icon}<span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="uv-sidebar-bottom">
          <a href="/premium">♛&nbsp;&nbsp;Go Premium</a>
        </div>
      </aside>

      {/* Main content */}
      <main className="uv-content uv-desktop-only" style={{ paddingLeft: 255 }}>
        <div className="uv-content-inner">{header}{children}</div>
      </main>

      {/* Mobile content + bottom nav */}
      <aside className="uv-mobile" style={{ display: 'none' }}>
        <main style={{ minHeight: '100svh', background: '#fff', padding: '0 16px 96px', boxSizing: 'border-box' }}>
          {header}
          {children}
        </main>
        <nav className="uv-bottom-nav">
          <Link href="/home" className={`uv-bottom-link ${isActive('/home') ? 'active' : ''}`}>
            <svg viewBox="0 0 48 48" className="uv-nav-bl"><path d="M8 22 24 9l16 13v17H29V28H19v11H8Z"/></svg><span>Home</span>
          </Link>
          <Link href="/explore" className={`uv-bottom-link ${isActive('/explore') ? 'active' : ''}`}>
            <svg viewBox="0 0 48 48" className="uv-nav-bl"><circle cx="24" cy="24" r="15" fill="none"/><path d="m19 29 4-10 9-4-4 9-9 5Z"/></svg><span>Explore</span>
          </Link>
          <Link href="/discover" className="uv-bottom-center"><img src="/logo-icon.png?v=2" alt="Discover" /></Link>
          <Link href="/matches" className={`uv-bottom-link ${isActive('/matches') ? 'active' : ''}`}>
            <svg viewBox="0 0 48 48" className="uv-nav-bl"><path d="M9 34l2-7a14 14 0 1 1 5 5l-7 2Z" fill="none"/><circle cx="19" cy="22" r="2"/><circle cx="25" cy="22" r="2"/><circle cx="31" cy="22" r="2"/></svg><span>Messages</span>
          </Link>
          <Link href="/profile" className={`uv-bottom-link ${isActive('/profile') ? 'active' : ''}`}>
            <svg viewBox="0 0 48 48" className="uv-nav-bl"><circle cx="24" cy="17" r="7" fill="none" strokeWidth="2.6"/><path d="M10 39c1-8 7-12 14-12s13 4 14 12" fill="none" strokeWidth="2.6"/></svg><span>Profile</span>
          </Link>
        </nav>
      </aside>

      <style jsx>{`
        @media (min-width: 768px) {
          .uv-mobile { display: none !important; }
        }
        @media (max-width: 767px) {
          .uv-content { display: none !important; }
          .uv-sidebar { display: none !important; }
          .uv-mobile { display: block !important; }
        }
      `}</style>
    </div>
  );
}
