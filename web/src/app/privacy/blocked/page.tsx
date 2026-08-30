'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { blockService, storageService } from '@/lib/cloudflare/services';

export default function BlockedUsersPage() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState('');

  useEffect(() => {
    blockService.list()
      .then((docs: any[]) => {
        setBlocks(docs.map((d: any) => ({
          ...d,
          _photoUrl: d.blockedUser?.photos?.[0] ? storageService.getFilePreview(d.blockedUser.photos[0]) : '',
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUnblock = async (id: string) => {
    setUnblocking(id);
    try {
      await blockService.unblock(id);
      setBlocks(prev => prev.filter(b => b.blockedId !== id));
    } catch {}
    setUnblocking('');
  };

  return (
    <AppShell>
      <div>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#FF2E5F', fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: '8px 0', marginBottom: 8 }}>
          ← Back
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#151515', margin: '0 0 8px' }}>Blocked Users</h1>
        <p style={{ fontSize: 14, color: '#8A8A8F', margin: '0 0 24px' }}>
          Blocked people can&apos;t see your profile, like or message you.
        </p>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, border: '3px solid rgba(255,46,95,0.2)', borderTopColor: '#FF2E5F', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : blocks.length === 0 ? (
          <div style={{ backgroundColor: '#F6F6F9', padding: 24, borderRadius: 18, textAlign: 'center' }}>
            <p style={{ color: '#8A8A8F', fontSize: 14, margin: 0 }}>You haven&apos;t blocked anyone yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {blocks.map((b: any) => {
              const p = b.blockedUser || {};
              const name = p.fullName || 'User';
              const initial = (name[0] || 'U').toUpperCase();
              return (
                <div key={b.$id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, backgroundColor: '#F6F6F9', borderRadius: 16 }}>
                  {b._photoUrl ? (
                    <img src={b._photoUrl} alt={name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #FF2E5F, #B44CFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 20 }}>
                      {initial}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#151515', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                    <div style={{ fontSize: 12, color: '#8A8A8F' }}>
                      {p.age ? `${p.age} years` : 'Blocked user'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnblock(b.blockedId)}
                    disabled={unblocking === b.blockedId}
                    style={{
                      padding: '8px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                      fontSize: 13, fontWeight: 700, color: '#FF2E5F',
                      background: 'rgba(255,46,95,0.12)', flexShrink: 0,
                      opacity: unblocking === b.blockedId ? 0.6 : 1,
                    }}
                  >
                    {unblocking === b.blockedId ? 'Unblocking…' : 'Unblock'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
