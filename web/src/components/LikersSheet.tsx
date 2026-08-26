'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { CloseIcon } from '@/components/Icons';
import { feedService, storageService } from '@/lib/cloudflare/services';

interface LikersSheetProps {
  postId: string;
  onClose: () => void;
}

export default function LikersSheet({ postId, onClose }: LikersSheetProps) {
  const [likers, setLikers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    feedService.getLikers(postId).then((data: any) => {
      setLikers(data?.documents || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [postId]);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} className="feed-sheet-up" style={{ width: '100%', maxWidth: 520, maxHeight: '60vh', background: 'rgba(16,16,22,0.97)', borderTopLeftRadius: 24, borderTopRightRadius: 24, display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: 0 }}>Likes</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <CloseIcon size={20} color="#6B6B6B" />
          </button>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div style={{ width: 28, height: 28, borderRadius: 10, border: '2px solid rgba(255,55,95,0.2)', borderTopColor: '#FF375F', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : likers.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <span style={{ fontSize: 14, color: '#6B6B6B' }}>No likes yet</span>
            </div>
          ) : (
            likers.map((user: any) => (
              <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #FF375F, #7C4DFF)', padding: 2, flexShrink: 0 }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#111', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {user.userPhoto ? (
                      <img src={storageService.getFilePreview(user.userPhoto)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#FF375F' }}>{(user.fullName || '?').charAt(0)}</span>
                    )}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.fullName || 'User'}</div>
                  {user.city && <div style={{ fontSize: 12, color: '#6B6B6B', marginTop: 1 }}>{user.city}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
