'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { CloseIcon, SendIcon, CopyIcon, CheckmarkIcon } from '@/components/Icons';
import { matchService, storageService } from '@/lib/cloudflare/services';

interface ShareSheetProps {
  postId: string;
  postCaption?: string;
  currentUserId: string;
  onClose: () => void;
}

export default function ShareSheet({ postId, postCaption, currentUserId, onClose }: ShareSheetProps) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await matchService.getUserMatches(currentUserId);
        const docs = (data?.documents || []) as any[];
        // Only show users you've actually chatted with, sorted by most recent message
        const chatted = docs
          .filter((m: any) => m.hasConversation)
          .sort((a: any, b: any) => {
            const aTime = a.lastMessage?.createdAt || '';
            const bTime = b.lastMessage?.createdAt || '';
            return bTime.localeCompare(aTime);
          });
        setMatches(chatted);
      } catch {}
      setLoading(false);
    })();
  }, [currentUserId]);

  const handleCopyLink = useCallback(async () => {
    const url = `${window.location.origin}/post/${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [postId]);

  const handleShareNative = useCallback(async () => {
    const url = `${window.location.origin}/post/${postId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Check out this post', text: postCaption || '', url });
      } catch {}
    }
  }, [postId, postCaption]);

  const handleForward = useCallback(async (matchId: string) => {
    setSentTo(prev => new Set(prev).add(matchId));
  }, []);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} className="feed-sheet-up" style={{ width: '100%', maxWidth: 520, maxHeight: '65vh', background: 'rgba(16,16,22,0.97)', borderTopLeftRadius: 24, borderTopRightRadius: 24, display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: 0 }}>Share</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <CloseIcon size={20} color="#6B6B6B" />
          </button>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: 16, padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <button onClick={handleCopyLink} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '14px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, cursor: 'pointer' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {copied ? <CheckmarkIcon size={20} color="#34C759" /> : <CopyIcon size={20} color="white" />}
            </div>
            <span style={{ fontSize: 11, color: '#ABABAB', fontWeight: 600 }}>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
          {typeof navigator !== 'undefined' && typeof (navigator as any).share === 'function' && (
            <button onClick={handleShareNative} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '14px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, cursor: 'pointer' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(255,55,95,0.2), rgba(124,77,255,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SendIcon size={20} color="#FF6B8A" />
              </div>
              <span style={{ fontSize: 11, color: '#ABABAB', fontWeight: 600 }}>Share</span>
            </button>
          )}
        </div>

        {/* Matches list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          <div style={{ padding: '8px 20px 6px' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: 1 }}>Send to</span>
          </div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}>
              <div style={{ width: 24, height: 24, borderRadius: 8, border: '2px solid rgba(255,55,95,0.2)', borderTopColor: '#FF375F', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : matches.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: 13, color: '#6B6B6B' }}>No matches yet</span>
            </div>
          ) : (
            matches.map((m: any) => {
              const mp = m.matchedUser || {};
              const name = mp.fullName || 'User';
              const photo = mp._photoUrl || '';
              const isSent = sentTo.has(m.$id);
              return (
                <button
                  key={m.$id}
                  onClick={() => handleForward(m.$id)}
                  disabled={isSent}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 20px', background: 'none', border: 'none', cursor: isSent ? 'default' : 'pointer', opacity: isSent ? 0.5 : 1, textAlign: 'left' }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #1A1A2E, #2A2A3E)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {photo ? (
                      <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#FF375F' }}>{name.charAt(0)}</span>
                    )}
                  </div>
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                  {isSent ? (
                    <span style={{ fontSize: 12, color: '#34C759', fontWeight: 700 }}>Sent</span>
                  ) : (
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #FF375F, #FF6B8A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <SendIcon size={12} color="white" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
