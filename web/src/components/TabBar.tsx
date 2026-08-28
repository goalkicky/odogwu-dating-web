'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChatIcon, PersonIcon, EyeIcon, CompassIcon } from './Icons';

const HOME_ICON = () => (
  <svg viewBox="0 0 48 48" style={{ width: 20, height: 20 }} fill="currentColor"><path d="M8 22 24 9l16 13v17H29V28H19v11H8Z"/></svg>
);

export default function TabBar() {
  const pathname = usePathname();

  const tabs = [
    { href: '/home', icon: <HOME_ICON />, label: 'Home' },
    { href: '/explore', icon: <CompassIcon size={20} />, label: 'Explore' },
    { href: '/matches', icon: <ChatIcon size={20} />, label: 'Matches' },
    { href: '/likes', icon: <EyeIcon size={20} />, label: 'Likes' },
    { href: '/profile', icon: <PersonIcon size={20} />, label: 'Profile' },
  ];

  return (
    <nav className="tabbar">
      <div className="tabbar-inner">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(tab.href + '/');
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`tabbar-link ${active ? 'active' : ''}`}
            >
              {React.cloneElement(tab.icon, { color: active ? 'white' : '#6B6B6B' })}
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
