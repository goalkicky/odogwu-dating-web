'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FlameIcon, HeartIcon, EyeIcon, DiamondIcon, PersonIcon } from '@/components/Icons';

const NAV_ITEMS = [
  { label: 'Discover', icon: <FlameIcon size={22} color="white" />, href: '/discover' },
  { label: 'Matches', icon: <HeartIcon size={22} color="white" />, href: '/matches' },
  { label: 'Likes', icon: <EyeIcon size={22} color="white" />, href: '/likes' },
  { label: 'Premium', icon: <DiamondIcon size={22} color="white" />, href: '/premium' },
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
          maxWidth: 1400, margin: '0 auto', minHeight: '100vh',
          display: 'flex', background: 'linear-gradient(135deg, #1A0000, #2D0000)',
        }}>
          {/* Sidebar */}
          <aside style={{
            width: 240, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', flexDirection: 'column', paddingTop: 40, gap: 4,
          }}>
            {/* Logo */}
            <div style={{ padding: '0 24px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #FF375F, #FF3B30)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FlameIcon size={20} color="white" />
                </div>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: 1 }}>ODOGWU</span>
              </div>
            </div>

            {/* Nav items */}
            {NAV_ITEMS.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px',
                    border: 'none', background: isActive ? 'rgba(255,55,95,0.12)' : 'transparent',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    borderLeft: isActive ? '3px solid #FF375F' : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  {item.icon}
                  <span style={{ fontSize: 15, fontWeight: isActive ? 700 : 500, color: isActive ? 'white' : '#ABABAB' }}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </aside>

          {/* Main content */}
          <main style={{
            flex: 1, display: 'flex', justifyContent: 'center',
            padding: '32px 40px', overflowY: 'auto', minHeight: '100vh',
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
    </>
  );
}
