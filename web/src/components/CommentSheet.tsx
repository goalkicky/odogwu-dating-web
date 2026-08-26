'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CloseIcon, SendIcon, TrashIcon } from '@/components/Icons';
import { feedService, storageService } from '@/lib/cloudflare/services';
import { FeedPost, FeedComment } from '@/lib/types';
import FeedProfileModal from '@/components/FeedProfileModal';

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
  const [replyTo, setReplyTo] = useState<FeedComment | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [profileUser, setProfileUser] = useState<{ userId: string; userName: string; userPhoto: string } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadComments = useCallback(async () => {
    try {
      const data = await feedService.getComments(post.id);
      const docs = (data?.documents || []) as FeedComment[];
      setComments(docs);
    } catch {}
    setLoading(false);
  }, [post.id]);

  useEffect(() => { loadComments(); }, [loadComments]);
  useEffect(() => { inputRef.current?.focus(); }, [replyTo]);

  const handleSend = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      const newComment = await feedService.addComment(post.id, trimmed, replyTo?.id) as FeedComment;
      if (replyTo) {
        // Add as a reply under the parent
        setComments(prev => prev.map(c => {
          if (c.id === replyTo.id) {
            return { ...c, replies: [...(c.replies || []), newComment], replyCount: (c.replyCount || 0) + 1 };
          }
          return c;
        }));
        setExpandedReplies(prev => new Set(prev).add(replyTo.id));
      } else {
        setComments(prev => [...prev, { ...newComment, replies: [], replyCount: 0 }]);
      }
      setText('');
      setReplyTo(null);
      onCommentAdded(post.id);
      setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }), 100);
    } catch {}
    setSending(false);
  }, [text, sending, post.id, replyTo, onCommentAdded]);

  const handleDelete = useCallback(async (commentId: string) => {
    try {
      await feedService.deleteComment(commentId);
      setComments(prev => {
        // Check if it's a top-level comment
        const filtered = prev.filter(c => c.id !== commentId);
        if (filtered.length !== prev.length) return filtered;
        // It's a reply — remove from parent's replies
        return prev.map(c => ({
          ...c,
          replies: (c.replies || []).filter(r => r.id !== commentId),
          replyCount: Math.max(0, (c.replyCount || 0) - 1),
        }));
      });
    } catch {}
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const toggleReplies = useCallback((commentId: string) => {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });
  }, []);

  const cancelReply = useCallback(() => setReplyTo(null), []);

  const CommentRow = ({ comment, isReply = false }: { comment: FeedComment; isReply?: boolean }) => (
    <div className="animate-fade-up" style={{ display: 'flex', gap: 10, padding: isReply ? '8px 0' : '10px 0', paddingLeft: isReply ? 0 : 0, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      <button
        onClick={() => comment.userId !== currentUserId && setProfileUser({ userId: comment.userId, userName: comment.userName, userPhoto: comment.userPhoto })}
        style={{ width: isReply ? 28 : 32, height: isReply ? 28 : 32, borderRadius: '50%', background: 'linear-gradient(135deg, #1A1A2E, #2A2A3E)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: 'none', cursor: comment.userId === currentUserId ? 'default' : 'pointer', padding: 0 }}
      >
        {comment.userPhoto ? (
          <img src={storageService.getFilePreview(comment.userPhoto)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        ) : (
          <span style={{ fontSize: isReply ? 11 : 12, fontWeight: 700, color: '#FF375F' }}>{comment.userName?.charAt(0)?.toUpperCase()}</span>
        )}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'white', marginRight: 6 }}>{comment.userName}</span>
          <span style={{ fontSize: 13, color: '#D0D0D0', lineHeight: 1.4 }}>{comment.text}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4 }}>
          <span style={{ fontSize: 11, color: '#6B6B6B' }}>{timeAgo(comment.createdAt)}</span>
          {!isReply && (
            <button
              onClick={() => setReplyTo(comment)}
              style={{ background: 'none', border: 'none', fontSize: 12, fontWeight: 700, color: '#6B6B6B', cursor: 'pointer', padding: 0 }}
            >
              Reply
            </button>
          )}
          {comment.userId === currentUserId && (
            <button
              onClick={() => handleDelete(comment.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', opacity: 0.5 }}
            >
              <TrashIcon size={12} color="#6B6B6B" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div onClick={(e) => e.stopPropagation()} className="feed-sheet-up" style={{ width: '100%', maxWidth: 520, maxHeight: '75vh', background: 'rgba(16,16,22,0.97)', borderTopLeftRadius: 24, borderTopRightRadius: 24, display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: 0 }}>Comments</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, display: 'flex' }}>
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
        <div ref={listRef} style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '8px 20px', minHeight: 200, maxHeight: 'calc(75dvh - 180px)' }}>
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
              {comments.map((comment) => {
                const isExpanded = expandedReplies.has(comment.id);
                const replies = comment.replies || [];
                const replyCount = comment.replyCount || replies.length;
                return (
                  <div key={comment.id}>
                    <CommentRow comment={comment} />
                    {/* View replies / collapse */}
                    {replyCount > 0 && (
                      <button
                        onClick={() => toggleReplies(comment.id)}
                        style={{
                          background: 'none', border: 'none', padding: '4px 0 4px 42px',
                          fontSize: 12, fontWeight: 700, color: '#6B6B6B', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 8,
                        }}
                      >
                        <span style={{ width: 24, height: 1, background: '#6B6B6B', display: 'inline-block' }} />
                        {isExpanded
                          ? `Hide replies`
                          : `View ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`
                        }
                      </button>
                    )}
                    {/* Replies (indented) */}
                    {isExpanded && replies.length > 0 && (
                      <div style={{ paddingLeft: 20, borderLeft: '2px solid rgba(255,255,255,0.06)', marginLeft: 15 }}>
                        {replies.map(reply => (
                          <CommentRow key={reply.id} comment={reply} isReply />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Reply indicator */}
        {replyTo && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
            <span style={{ fontSize: 12, color: '#ABABAB' }}>
              Replying to <span style={{ fontWeight: 700, color: '#FF6B8A' }}>{replyTo.userName}</span>
            </span>
            <button onClick={cancelReply} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex' }}>
              <CloseIcon size={14} color="#6B6B6B" />
            </button>
          </div>
        )}

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
            placeholder={replyTo ? `Reply to ${replyTo.userName}...` : 'Add a comment...'}
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
              border: 'none', borderRadius: 9999, width: 40, height: 40, cursor: text.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
              opacity: text.trim() ? 1 : 0.4,
            }}
          >
            <SendIcon size={16} color="white" />
          </button>
        </div>
      </div>
    </div>

      {/* Profile modal */}
      {profileUser && (
        <FeedProfileModal
          userId={profileUser.userId}
          userName={profileUser.userName}
          userPhoto={profileUser.userPhoto}
          currentUserId={currentUserId}
          onClose={() => setProfileUser(null)}
        />
      )}
    </>
  );
}
