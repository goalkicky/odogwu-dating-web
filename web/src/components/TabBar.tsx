'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChatIcon, DiamondIcon, PersonIcon, EyeIcon } from './Icons';

export default function TabBar() {
  const pathname = usePathname();

  const tabs = [
    { href: '/discover', icon: <img src="https://kamsirmdlabs.com/img/logo.png" alt="" style={{ width: 20, height: 20, borderRadius: 6, objectFit: 'cover' }} />, label: 'Discover' },
    { href: '/matches', icon: <ChatIcon size={20} />, label: 'Matches' },
    { href: '/likes', icon: <EyeIcon size={20} />, label: 'Likes' },
    { href: '/premium', icon: <DiamondIcon size={20} />, label: 'Premium' },
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
