'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FlameIcon, ChatIcon, DiamondIcon, PersonIcon } from './Icons';

export default function TabBar() {
  const pathname = usePathname();

  const tabs = [
    { href: '/discover', icon: <FlameIcon size={22} />, label: 'Discover' },
    { href: '/matches', icon: <ChatIcon size={22} />, label: 'Matches' },
    { href: '/premium', icon: <DiamondIcon size={22} />, label: 'Premium' },
    { href: '/profile', icon: <PersonIcon size={22} />, label: 'Profile' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#0D0D0D',
        borderTop: '1px solid #2A2A2A',
        height: '85px',
        paddingBottom: '28px',
        paddingTop: '8px',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
      }}
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href + '/');
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              textDecoration: 'none',
              color: active ? '#FF375F' : '#6B6B6B',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            {active ? (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #FF375F, #6C63FF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {React.cloneElement(tab.icon, { color: 'white' })}
              </div>
            ) : (
              <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {tab.icon}
              </div>
            )}
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
