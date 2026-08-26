'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { HeartIcon, CommentIcon, ShareIcon, BookmarkIcon, EllipsisIcon, CloseIcon, TrashIcon, GlobeIcon, PeopleIcon } from '@/components/Icons';
import { feedService, storageService } from '@/lib/cloudflare/services';
import { FeedPost, FeedComment } from '@/lib/types';
import ShareSheet from '@/components/ShareSheet';
import LikersSheet from '@/components/LikersSheet';

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
  onProfileClick?: (userId: string, userName: string, userPhoto: string) => void;
}

export default function PostCard({ post, currentUserId, onLikeToggle, onSaveToggle, onComment, onDelete, onProfileClick }: PostCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [liked, setLiked] = useState(post.likedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [saved, setSaved] = useState(post.savedByMe);
  const [showShare, setShowShare] = useState(false);
  const [showLikers, setShowLikers] = useState(false);
  const [previewComments, setPreviewComments] = useState<FeedComment[]>([]);
  const [expanded, setExpanded] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const isOwn = post.userId === currentUserId;
  const hasImages = post.images && post.images.length > 0;
  const imgSrc = hasImages ? storageService.getFilePreview(post.images[imageIndex]) : '';
  const totalImages = post.images?.length || 0;

  // Fetch 2 most recent comments for inline preview
  useEffect(() => {
    if (post.commentsCount > 0) {
      feedService.getComments(post.id, undefined, 2).then((data: any) => {
        const docs = (data?.documents || []) as FeedComment[];
        setPreviewComments(docs.slice(-2));
      }).catch(() => {});
    }
  }, [post.id, post.commentsCount]);

  const handleLike = useCallback(async () => {
    if (isOwn) return;
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
  }, [liked, post.id, isOwn, onLikeToggle]);

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
    if (isOwn) return;
    if (!liked) handleLike();
    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 800);
  }, [liked, handleLike, isOwn]);

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
    <div className="animate-fade-up" style={{ background: '#000', marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', gap: 10 }}>
        <div
          style={{ flexShrink: 0, cursor: onProfileClick ? 'pointer' : 'default' }}
          onClick={onProfileClick ? () => onProfileClick(post.userId, post.userName, post.userPhoto) : undefined}
        >
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #FF375F, #7C4DFF)', padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#000', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {post.userPhoto ? (
                <img src={storageService.getFilePreview(post.userPhoto)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 13, fontWeight: 700, color: '#FF375F' }}>{post.userName?.charAt(0)?.toUpperCase() || '?'}</span>
              )}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{ fontSize: 13, fontWeight: 600, color: 'white', cursor: onProfileClick ? 'pointer' : 'default' }}
              onClick={onProfileClick ? () => onProfileClick(post.userId, post.userName, post.userPhoto) : undefined}
            >
              {post.userName}
            </span>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <EllipsisIcon size={16} color="#A0A0A0" />
          </button>
          {showMenu && (
            <div className="glass-strong animate-pop" style={{ position: 'absolute', top: 30, right: 0, width: 160, borderRadius: 14, overflow: 'hidden', zIndex: 20 }}>
              {isOwn && (
                <button
                  onClick={handleDelete}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: '#FF4458', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
                >
                  <TrashIcon size={16} color="#FF4458" /> Delete
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
          style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', background: '#0A0A0A', overflow: 'hidden', cursor: 'grab' }}
        >
          <img
            src={imgSrc}
            alt=""
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', userSelect: 'none' }}
          />

          {/* Double-tap heart animation */}
          {likeAnimating && (
            <div className="feed-heart-pop" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', zIndex: 10 }}>
              <HeartIcon size={80} color="white" filled />
            </div>
          )}

          {/* Image dots */}
          {totalImages > 1 && (
            <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4 }}>
              {post.images.slice(0, 7).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 6, height: 6, borderRadius: 9999,
                    background: i === imageIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
              {totalImages > 7 && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10 }}>+{totalImages - 7}</span>}
            </div>
          )}

          {/* Nav arrows (desktop) */}
          {totalImages > 1 && (
            <>
              {imageIndex > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setImageIndex(prev => prev - 1); }}
                  style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
              )}
              {imageIndex < totalImages - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); setImageIndex(prev => prev + 1); }}
                  style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Action bar — Instagram-exact: icon + count inline */}
      <div style={{ padding: '10px 14px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Heart + count */}
          <button
            onClick={() => { if (!isOwn) setShowLikers(true); }}
            disabled={isOwn}
            style={{
              background: 'none', border: 'none', cursor: isOwn ? 'default' : 'pointer',
              padding: '4px 12px 4px 0', display: 'flex', alignItems: 'center', gap: 5,
              opacity: isOwn ? 0.3 : 1,
            }}
          >
            <div onClick={(e) => { if (!isOwn) { e.stopPropagation(); handleLike(); } }} style={{ display: 'flex', alignItems: 'center' }}>
              <HeartIcon size={26} color={liked ? '#FF3040' : 'white'} filled={liked} className={likeAnimating ? 'feed-like-btn' : ''} />
            </div>
            {likesCount > 0 && <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{likesCount.toLocaleString()}</span>}
          </button>
          {/* Comment + count */}
          <button
            onClick={() => onComment(post)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <CommentIcon size={26} color="white" />
            {post.commentsCount > 0 && <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{post.commentsCount.toLocaleString()}</span>}
          </button>
          {/* Share + count */}
          <button
            onClick={() => setShowShare(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <ShareIcon size={24} color="white" />
            {(post.sharesCount || 0) > 0 && <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{(post.sharesCount || 0).toLocaleString()}</span>}
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={handleSave}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0 4px 12px', display: 'flex', alignItems: 'center' }}
          >
            <BookmarkIcon size={26} color={saved ? '#FFD700' : 'white'} filled={saved} />
          </button>
        </div>
      </div>

      {/* Caption */}
      {post.caption && (
        <div style={{ padding: '4px 14px 0' }}>
          <div style={{ fontSize: 14, color: 'white', lineHeight: 1.5 }}>
            <span style={{ fontWeight: 600, marginRight: 5 }}>{post.userName}</span>
            {expanded || post.caption.length <= 140 ? (
              <span>{post.caption}</span>
            ) : (
              <>
                <span>{post.caption.slice(0, 140)}...</span>
                <button
                  onClick={() => setExpanded(true)}
                  style={{ background: 'none', border: 'none', color: '#A0A0A0', fontSize: 14, cursor: 'pointer', padding: 0, marginLeft: 4, fontWeight: 400 }}
                >
                  more
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* View all comments */}
      {post.commentsCount > 2 && (
        <button
          onClick={() => onComment(post)}
          style={{ background: 'none', border: 'none', padding: '4px 14px', cursor: 'pointer', fontSize: 14, color: '#A0A0A0', textAlign: 'left' }}
        >
          View all {post.commentsCount.toLocaleString()} {post.commentsCount === 1 ? 'comment' : 'comments'}
        </button>
      )}

      {/* Inline comment previews — Instagram-style */}
      {previewComments.length > 0 && (
        <div style={{ padding: '2px 14px 0' }}>
          {previewComments.map(c => (
            <div key={c.id} style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 2 }}>
              <span style={{ fontWeight: 600, marginRight: 5 }}>{c.userName}</span>
              <span style={{ color: '#E0E0E0' }}>{c.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Timestamp */}
      <div style={{ padding: '6px 14px 0' }}>
        <span style={{ fontSize: 11, color: '#A0A0A0', textTransform: 'uppercase', letterSpacing: 0.3 }}>
          {timeAgo(post.createdAt)}
        </span>
      </div>

      {/* Add a comment — Instagram-style */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px 12px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #1A1A2E, #2A2A3E)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#FF375F' }}>Y</span>
        </div>
        <button
          onClick={() => onComment(post)}
          style={{ flex: 1, background: 'none', border: 'none', padding: '6px 0', color: '#A0A0A0', fontSize: 14, cursor: 'pointer', textAlign: 'left' }}
        >
          Add a comment...
        </button>
      </div>

      {/* Share sheet */}
      {showShare && (
        <ShareSheet postId={post.id} postCaption={post.caption} currentUserId={currentUserId} onClose={() => setShowShare(false)} />
      )}

      {/* Likers sheet */}
      {showLikers && (
        <LikersSheet postId={post.id} onClose={() => setShowLikers(false)} />
      )}
    </div>
  );
}
