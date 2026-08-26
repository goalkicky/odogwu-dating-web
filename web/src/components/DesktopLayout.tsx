'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { HeartIcon, EyeIcon, DiamondIcon, PersonIcon, CompassIcon } from '@/components/Icons';
import PremiumPopup from '@/components/PremiumPopup';

const NAV_ITEMS = [
  { label: 'Discover', icon: <img src="https://kamsirmdlabs.com/img/logo.png" alt="" style={{ width: 22, height: 22, borderRadius: 6, objectFit: 'cover' }} />, href: '/discover' },
  { label: 'Explore', icon: <CompassIcon size={22} color="white" />, href: '/explore' },
  { label: 'Matches', icon: <HeartIcon size={22} color="white" />, href: '/matches' },
  { label: 'Likes', icon: <EyeIcon size={22} color="white" />, href: '/likes' },
  { label: 'Profile', icon: <PersonIcon size={22} color="white" />, href: '/profile' },
];

export default function DesktopLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <>
      {/* Mobile fallback — renders children as-is on small screens */}
      <div className="desktop-layout-mobile">
        {children}
      </div>

      {/* Desktop layout — hidden on mobile */}
      <div className="desktop-layout-desktop">
        <div style={{
          maxWidth: 1400, margin: '0 auto', minHeight: '100svh',
          display: 'flex', background: 'linear-gradient(180deg, #08080C, #0D0D0D)',
        }}>
          {/* Sidebar */}
          <aside className="sidebar" style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', paddingTop: 40, gap: 4, position: 'sticky', top: 0, height: '100svh', alignSelf: 'flex-start' }}>
            {/* Logo */}
            <div style={{ padding: '0 24px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="grad-ring" style={{ display: 'flex' }}>
                  <img src="https://kamsirmdlabs.com/img/logo.png" alt="Odogwu Dating" style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover' }} />
                </div>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: 1 }}>
                  ODO<span className="neon-text">GWU</span> DATING
                </span>
              </div>
            </div>

            {/* Nav items */}
            {NAV_ITEMS.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div style={{ flex: 1 }} />

            <div className="glass" style={{ margin: '0 16px 24px', padding: 16, borderRadius: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #FFD700, #FF375F)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DiamondIcon size={18} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Go Premium</div>
                  <div style={{ fontSize: 11, color: '#6B6B6B' }}>Unlock full power</div>
                </div>
              </div>
              <button
                onClick={() => router.push('/premium')}
                style={{
                  marginTop: 12, width: '100%', padding: '10px 0', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #FF375F, #FF3B30)', color: 'white',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(255,55,95,0.35)',
                }}
              >
                Upgrade
              </button>
            </div>
          </aside>

          {/* Main content */}
          <main style={{
            flex: 1, display: 'flex', justifyContent: 'center',
            padding: '32px 40px',
          }}>
            <div style={{ width: '100%', maxWidth: 900 }}>
              {children}
            </div>
          </main>
        </div>
      </div>

      <style jsx>{`
        .desktop-layout-mobile { display: block; }
        .desktop-layout-desktop { display: none; }

        @media (min-width: 768px) {
          .desktop-layout-mobile { display: none; }
          .desktop-layout-desktop { display: block; }
        }
      `}</style>

      <PremiumPopup />
    </>
  );
}
