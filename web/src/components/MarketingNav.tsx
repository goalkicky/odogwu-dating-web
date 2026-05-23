'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMobile } from '@/lib/useMediaQuery';
import { FlameIcon } from './Icons';

const links = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/plans', label: 'Plans' },
  { href: '/faq', label: 'FAQ' },
];

export default function MarketingNav() {
  const pathname = usePathname();
  const isMobile = useMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkColor = (href: string) => pathname === href ? '#FF375F' : '#ABABAB';

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(13,13,13,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '0 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #FF375F, #FF3B30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FlameIcon size={18} color="white" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'white', letterSpacing: 1 }}>ODOGWU</span>
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {!isMobile && links.map(l => (
            <Link key={l.href} href={l.href} style={{
              fontSize: 14, fontWeight: 500, textDecoration: 'none',
              color: linkColor(l.href), transition: 'color 0.2s',
              position: 'relative',
            }}>
              {l.label}
              {pathname === l.href && (
                <span style={{
                  position: 'absolute', bottom: -4, left: 0, right: 0,
                  height: 2, background: '#FF375F', borderRadius: 1,
                }} />
              )}
            </Link>
          ))}
          <Link href="/login" style={{
            padding: '8px 20px', borderRadius: 9999, fontSize: 13, fontWeight: 600,
            background: 'linear-gradient(135deg, #FF375F, #FF3B30)',
            color: 'white', textDecoration: 'none',
            transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Get Started
          </Link>
          {isMobile && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                {menuOpen ? (
                  <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                ) : (
                  <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div style={{
          padding: '12px 20px 20px',
          background: '#0D0D0D',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{
              padding: '12px 16px', borderRadius: 12,
              fontSize: 15, fontWeight: 500, textDecoration: 'none',
              color: linkColor(l.href),
              background: pathname === l.href ? 'rgba(255,55,95,0.08)' : 'transparent',
            }}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
