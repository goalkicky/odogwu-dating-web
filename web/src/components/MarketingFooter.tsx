import React from 'react';
import Link from 'next/link';
import { FlameIcon } from './Icons';

export default function MarketingFooter() {
  return (
    <footer style={{
      background: '#0D0D0D', borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '80px 24px 40px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #FF375F, #6C63FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FlameIcon size={20} color="white" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: 1 }}>ODOGWU</span>
          </div>
          <p style={{ color: '#6B6B6B', fontSize: 14, lineHeight: '22px', maxWidth: 280 }}>
            Find your perfect match with Odogwu. Smart matching, verified profiles, real-time connections.
          </p>
        </div>

        {[
          { title: 'Company', links: [{ label: 'About', href: '/about' }, { label: 'Features', href: '/features' }, { label: 'Plans', href: '/plans' }, { label: 'FAQ', href: '/faq' }] },
          { title: 'Support', links: [{ label: 'Help Center', href: '#' }, { label: 'Safety Tips', href: '#' }, { label: 'Community', href: '#' }, { label: 'Contact', href: '#' }] },
          { title: 'Legal', links: [{ label: 'Privacy Policy', href: '#' }, { label: 'Terms of Service', href: '#' }, { label: 'Cookie Policy', href: '#' }, { label: 'Guidelines', href: '#' }] },
        ].map(section => (
          <div key={section.title}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 16, letterSpacing: 1, textTransform: 'uppercase' }}>{section.title}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {section.links.map(l => (
                <Link key={l.label} href={l.href} style={{ fontSize: 14, color: '#6B6B6B', textDecoration: 'none', transition: 'color 0.2s' }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: '1200px', margin: '60px auto 0', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <p style={{ color: '#6B6B6B', fontSize: 13 }}>&copy; {new Date().getFullYear()} Odogwu Dating. All rights reserved.</p>
        <div style={{ display: 'flex', gap: 16 }}>
          {['twitter', 'instagram', 'tiktok', 'facebook'].map(s => (
            <a key={s} href="#" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ABABAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {s === 'twitter' && <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.4-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>}
                {s === 'instagram' && <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></>}
                {s === 'tiktok' && <path d="M9 12a4 4 0 1 0 4 4V4h5"/>}
                {s === 'facebook' && <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>}
              </svg>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
