'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CloseIcon, SendIcon, TrashIcon } from '@/components/Icons';
import { feedService, storageService } from '@/lib/cloudflare/services';
import { FeedPost, FeedComment } from '@/lib/types';

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface CommentSheetProps {
  post: FeedPost;
  currentUserId: string;
  onClose: () => void;
  onCommentAdded: (postId: string) => void;
}

export default function CommentSheet({ post, currentUserId, onClose, onCommentAdded }: CommentSheetProps) {
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadComments = useCallback(async (c?: string) => {
    try {
      const data = await feedService.getComments(post.id, c || undefined);
      const docs = (data?.documents || []) as FeedComment[];
      if (c) {
        setComments(prev => [...prev, ...docs]);
      } else {
        setComments(docs);
      }
      setCursor(data?.cursor || null);
      setHasMore(docs.length > 0);
    } catch {}
    setLoading(false);
  }, [post.id]);

  useEffect(() => { loadComments(); }, [loadComments]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const loadMore = useCallback(() => {
    if (cursor && hasMore && !loading) {
      loadComments(cursor);
    }
  }, [cursor, hasMore, loading, loadComments]);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      const newComment = await feedService.addComment(post.id, trimmed) as FeedComment;
      setComments(prev => [...prev, newComment]);
      setText('');
      onCommentAdded(post.id);
      setTimeout(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch {}
    setSending(false);
  }, [text, sending, post.id, onCommentAdded]);

  const handleDelete = useCallback(async (commentId: string) => {
    try {
      await feedService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch {}
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div onClick={(e) => e.stopPropagation()} className="feed-sheet-up" style={{ width: '100%', maxWidth: 520, maxHeight: '75vh', background: 'rgba(16,16,22,0.97)', borderTopLeftRadius: 24, borderTopRightRadius: 24, display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: 0 }}>Comments</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <CloseIcon size={20} color="#6B6B6B" />
          </button>
        </div>

        {/* Post preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #1A1A2E, #2A2A3E)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {post.userPhoto ? (
              <img src={storageService.getFilePreview(post.userPhoto)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              <span style={{ fontSize: 13, fontWeight: 700, color: '#FF375F' }}>{post.userName?.charAt(0)?.toUpperCase()}</span>
            )}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{post.userName}</span>
            {post.caption && (
              <span style={{ fontSize: 13, color: '#ABABAB', marginLeft: 6 }}>{post.caption.length > 60 ? post.caption.slice(0, 60) + '...' : post.caption}</span>
            )}
          </div>
        </div>

        {/* Comments list */}
        <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 20px', minHeight: 200, maxHeight: 'calc(75vh - 180px)' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div style={{ width: 28, height: 28, borderRadius: 10, border: '2px solid rgba(255,55,95,0.2)', borderTopColor: '#FF375F', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : comments.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: 8 }}>
              <span style={{ fontSize: 32 }}>💬</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#6B6B6B' }}>No comments yet</span>
              <span style={{ fontSize: 12, color: '#4A4A4A' }}>Start the conversation.</span>
            </div>
          ) : (
            <>
              {comments.map((comment) => (
                <div key={comment.id} className="animate-fade-up" style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #1A1A2E, #2A2A3E)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {comment.userPhoto ? (
                      <img src={storageService.getFilePreview(comment.userPhoto)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#FF375F' }}>{comment.userName?.charAt(0)?.toUpperCase()}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'white', marginRight: 6 }}>{comment.userName}</span>
                      <span style={{ fontSize: 13, color: '#D0D0D0', lineHeight: 1.4 }}>{comment.text}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: '#6B6B6B' }}>{timeAgo(comment.createdAt)}</span>
                    </div>
                  </div>
                  {comment.userId === currentUserId && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignSelf: 'center', opacity: 0.5 }}
                    >
                      <TrashIcon size={14} color="#6B6B6B" />
                    </button>
                  )}
                </div>
              ))}
              {hasMore && !loading && (
                <button onClick={loadMore} style={{ background: 'none', border: 'none', padding: '12px 0', width: '100%', textAlign: 'center', color: '#6B6B6B', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Load more comments
                </button>
              )}
            </>
          )}
        </div>

        {/* Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #1A1A2E, #2A2A3E)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#FF375F' }}>Y</span>
          </div>
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment..."
            style={{
              flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 9999, padding: '10px 14px', color: 'white', fontSize: 13, outline: 'none',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            style={{
              background: text.trim() ? 'linear-gradient(135deg, #FF375F, #FF3B30)' : 'rgba(255,255,255,0.06)',
              border: 'none', borderRadius: 9999, width: 36, height: 36, cursor: text.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
              opacity: text.trim() ? 1 : 0.4,
            }}
          >
            <SendIcon size={16} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}
