'use client';
import React, { useState, useRef, useCallback } from 'react';
import { HeartIcon, CommentIcon, ShareIcon, BookmarkIcon, EllipsisIcon, CloseIcon, TrashIcon, GlobeIcon, PeopleIcon } from '@/components/Icons';
import { feedService, storageService } from '@/lib/cloudflare/services';
import { FeedPost } from '@/lib/types';

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

interface PostCardProps {
  post: FeedPost;
  currentUserId: string;
  onLikeToggle: (postId: string, liked: boolean) => void;
  onSaveToggle: (postId: string, saved: boolean) => void;
  onComment: (post: FeedPost) => void;
  onDelete?: (postId: string) => void;
}

export default function PostCard({ post, currentUserId, onLikeToggle, onSaveToggle, onComment, onDelete }: PostCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [liked, setLiked] = useState(post.likedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [saved, setSaved] = useState(post.savedByMe);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const isOwn = post.userId === currentUserId;
  const hasImages = post.images && post.images.length > 0;
  const imgSrc = hasImages ? storageService.getFilePreview(post.images[imageIndex]) : '';
  const totalImages = post.images?.length || 0;

  const handleLike = useCallback(async () => {
    if (post.userId === currentUserId) return;
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));
    onLikeToggle(post.id, newLiked);
    if (newLiked) {
      setLikeAnimating(true);
      setTimeout(() => setLikeAnimating(false), 800);
      try { await feedService.likePost(post.id); } catch { setLiked(false); setLikesCount(prev => Math.max(0, prev - 1)); }
    } else {
      try { await feedService.unlikePost(post.id); } catch { setLiked(true); setLikesCount(prev => prev + 1); }
    }
  }, [liked, post.id, post.userId, currentUserId, onLikeToggle]);

  const handleSave = useCallback(async () => {
    const newSaved = !saved;
    setSaved(newSaved);
    onSaveToggle(post.id, newSaved);
    if (newSaved) {
      try { await feedService.savePost(post.id); } catch { setSaved(false); }
    } else {
      try { await feedService.unsavePost(post.id); } catch { setSaved(true); }
    }
  }, [saved, post.id, onSaveToggle]);

  const handleDoubleTap = useCallback(() => {
    if (post.userId === currentUserId) return;
    if (!liked) handleLike();
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 800);
  }, [liked, handleLike, post.userId, currentUserId]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    if (Math.abs(dx) > 60) {
      if (dx < 0 && imageIndex < totalImages - 1) setImageIndex(prev => prev + 1);
      if (dx > 0 && imageIndex > 0) setImageIndex(prev => prev - 1);
    }
    touchStart.current = null;
  }, [imageIndex, totalImages]);

  const handleDelete = useCallback(async () => {
    setShowMenu(false);
    if (!onDelete) return;
    try {
      await feedService.deletePost(post.id);
      onDelete(post.id);
    } catch {}
  }, [post.id, onDelete]);

  return (
    <div className="animate-fade-up" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden', marginBottom: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 12 }}>
        <div className="grad-ring" style={{ flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #1A1A2E, #2A2A3E)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {post.userPhoto ? (
              <img src={storageService.getFilePreview(post.userPhoto)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              <span style={{ fontSize: 16, fontWeight: 700, color: '#FF375F' }}>{post.userName?.charAt(0)?.toUpperCase() || '?'}</span>
            )}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.userName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
            <span style={{ fontSize: 12, color: '#6B6B6B' }}>{timeAgo(post.createdAt)}</span>
            <span style={{ fontSize: 10, color: '#6B6B6B', display: 'flex', alignItems: 'center', gap: 3 }}>
              {post.visibility === 'public' ? <GlobeIcon size={10} color="#6B6B6B" /> : <PeopleIcon size={10} color="#6B6B6B" />}
              {post.visibility}
            </span>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <EllipsisIcon size={18} color="#6B6B6B" />
          </button>
          {showMenu && (
            <div className="glass-strong animate-pop" style={{ position: 'absolute', top: 36, right: 0, width: 160, borderRadius: 14, overflow: 'hidden', zIndex: 20 }}>
              {isOwn && (
                <button
                  onClick={handleDelete}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: '#FF4458', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                >
                  <TrashIcon size={16} color="#FF4458" /> Delete post
                </button>
              )}
              <button
                onClick={() => setShowMenu(false)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: '#ABABAB', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
              >
                <CloseIcon size={16} color="#ABABAB" /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image carousel */}
      {hasImages && (
        <div
          ref={carouselRef}
          onDoubleClick={handleDoubleTap}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', background: '#111', overflow: 'hidden', cursor: 'grab' }}
        >
          <img
            src={imgSrc}
            alt=""
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease', userSelect: 'none' }}
          />

          {/* Double-tap heart animation */}
          {likeAnimating && (
            <div className="feed-heart-pop" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 10 }}>
              <HeartIcon size={80} color="#FF375F" filled />
            </div>
          )}

          {/* Image dots */}
          {totalImages > 1 && (
            <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
              {post.images.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 6, height: 6, borderRadius: 9999,
                    background: i === imageIndex ? '#FF375F' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.2s ease',
                    boxShadow: i === imageIndex ? '0 0 6px rgba(255,55,95,0.6)' : 'none',
                  }}
                />
              ))}
            </div>
          )}

          {/* Image counter badge */}
          {totalImages > 1 && (
            <div style={{ position: 'absolute', top: 12, right: 12, padding: '4px 10px', borderRadius: 9999, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', fontSize: 11, fontWeight: 700, color: 'white' }}>
              {imageIndex + 1}/{totalImages}
            </div>
          )}

          {/* Nav arrows (desktop) */}
          {totalImages > 1 && (
            <>
              {imageIndex > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setImageIndex(prev => prev - 1); }}
                  style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
              )}
              {imageIndex < totalImages - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setImageIndex(prev => prev + 1); }}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Action bar */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={handleLike} disabled={isOwn} style={{ background: 'none', border: 'none', cursor: isOwn ? 'default' : 'pointer', padding: 4, display: 'flex', transition: 'transform 0.2s', opacity: isOwn ? 0.3 : 1 }} className={likeAnimating ? 'feed-like-btn' : ''}>
            <HeartIcon size={24} color={liked ? '#FF375F' : 'white'} filled={liked} />
          </button>
          <button onClick={() => onComment(post)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <CommentIcon size={24} color="white" />
          </button>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <ShareIcon size={22} color="white" />
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={handleSave} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <BookmarkIcon size={24} color={saved ? '#FFD700' : 'white'} filled={saved} />
          </button>
        </div>
      </div>

      {/* Likes */}
      <div style={{ padding: '8px 16px 0' }}>
        {likesCount > 0 && (
          <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>
            {likesCount.toLocaleString()} {likesCount === 1 ? 'like' : 'likes'}
          </div>
        )}
      </div>

      {/* Caption */}
      {post.caption && (
        <div style={{ padding: '6px 16px 0' }}>
          <span style={{ fontSize: 14, color: 'white', lineHeight: 1.4 }}>
            <span style={{ fontWeight: 700, marginRight: 6 }}>{post.userName}</span>
            {post.caption.length > 120 ? (
              <>
                {post.caption.slice(0, 120)}...
                <button style={{ background: 'none', border: 'none', color: '#6B6B6B', fontSize: 14, cursor: 'pointer', padding: 0, marginLeft: 4 }}>more</button>
              </>
            ) : (
              post.caption
            )}
          </span>
        </div>
      )}

      {/* View comments */}
      {post.commentsCount > 0 && (
        <button
          onClick={() => onComment(post)}
          style={{ background: 'none', border: 'none', padding: '6px 16px', cursor: 'pointer', fontSize: 14, color: '#6B6B6B', textAlign: 'left' }}
        >
          View all {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
        </button>
      )}

      {/* Inline comment input */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px 14px', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #1A1A2E, #2A2A3E)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#FF375F' }}>Y</span>
        </div>
        <button
          onClick={() => onComment(post)}
          style={{ flex: 1, background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 9999, padding: '9px 14px', color: '#6B6B6B', fontSize: 13, cursor: 'pointer', textAlign: 'left' }}
        >
          Add a comment...
        </button>
      </div>
    </div>
  );
}
