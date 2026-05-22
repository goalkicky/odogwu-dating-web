'use client';
import React from 'react';
import Link from 'next/link';
import { FlameIcon, FilterIcon, CheckmarkCircleIcon } from '@/components/Icons';
import GradientBackground from '@/components/GradientBackground';
import TabBar from '@/components/TabBar';

const MOCK_MATCHES = [
  { id: '1', name: 'Sarah Johnson', age: 26, photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', lastMessage: 'Hey! How are you?', timestamp: '2m ago', online: true },
  { id: '2', name: 'Michael Chen', age: 28, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', lastMessage: 'That sounds great!', timestamp: '1h ago', online: false },
  { id: '3', name: 'Emily Davis', age: 24, photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', lastMessage: 'Would love to meet up!', timestamp: '3h ago', online: true },
];

export default function MatchesPage() {
  return (
    <GradientBackground style={{ minHeight: '100vh', paddingBottom: '85px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '60px 20px 12px' }}>
        <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, #FF375F, #6C63FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FlameIcon size={22} color="white" />
        </div>
        <span style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>Matches</span>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <FilterIcon size={24} color="#ABABAB" />
        </button>
      </div>

      <div style={{ paddingLeft: 20, marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 14 }}>New Matches</h2>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingRight: 20, paddingBottom: 4 }}>
          {MOCK_MATCHES.map((item) => (
            <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 80 }}>
              <div style={{ width: 76, height: 76, borderRadius: '50%', padding: 3, background: 'linear-gradient(135deg, #FF375F, #6C63FF)' }}>
                <img src={item.photo} alt={item.name} style={{ width: 70, height: 70, borderRadius: '50%', objectFit: 'cover' }} />
              </div>
              <span style={{ color: '#ABABAB', fontSize: 12, fontWeight: 500, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: 76 }}>{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 20px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 14 }}>Messages</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {MOCK_MATCHES.map((item) => (
            <Link
              key={item.id}
              href={`/chat/${item.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 12,
                borderRadius: 16,
                gap: 14,
                backgroundColor: 'rgba(255,255,255,0.08)',
                marginBottom: 8,
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{ position: 'relative' }}>
                <img src={item.photo} alt={item.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
                {item.online && (
                  <div style={{ position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: '50%', backgroundColor: '#34C759', border: '2px solid #0D0D0D' }} />
                )}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>{item.name}</span>
                  <span style={{ fontSize: 14, color: '#6B6B6B' }}>{item.age}</span>
                </div>
                <span style={{ fontSize: 14, color: '#ABABAB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.lastMessage}
                </span>
              </div>
              <span style={{ fontSize: 11, color: '#6B6B6B' }}>{item.timestamp}</span>
            </Link>
          ))}
        </div>
      </div>

      <TabBar />
    </GradientBackground>
  );
}
