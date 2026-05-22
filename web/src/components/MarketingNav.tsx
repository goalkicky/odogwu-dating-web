'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FlameIcon } from './Icons';

const links = [
  { href: '/', label: 'Home' },
  { href: '/features', label: 'Features' },
  { href: '/plans', label: 'Plans' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
];

const linkStyle = (active: boolean): React.CSSProperties => ({
  fontSize: 14, fontWeight: 500, textDecoration: 'none',
  color: active ? '#FF375F' : '#ABABAB',
  transition: 'color 0.2s',
  position: 'relative',
});

const activeIndicator: React.CSSProperties = {
  position: 'absolute', bottom: -4, left: 0, right: 0, height: 2,
  background: '#FF375F', borderRadius: 1,
};

export default function MarketingNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(13,13,13,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '70px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #FF375F, #6C63FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FlameIcon size={20} color="white" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: 1 }}>ODOGWU</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} style={linkStyle(pathname === l.href)}>
              {l.label}
              {pathname === l.href && <span style={activeIndicator} />}
            </Link>
          ))}
          <Link href="/login" style={{
            padding: '10px 24px', borderRadius: 9999, fontSize: 14, fontWeight: 600,
            background: 'linear-gradient(135deg, #FF375F, #6C63FF)',
            color: 'white', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(255,55,95,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Get Started
          </Link>
          <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'none' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
