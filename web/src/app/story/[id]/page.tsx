'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { feedService, storageService } from '@/lib/cloudflare/services';
import CommentSheet from '@/components/CommentSheet';
import { useAuth } from '@/store/AuthContext';

const DURATION = 5000;

export default function StoryPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useAuth();

  const postId = (params?.id as string) || '';
  const keyParam = searchParams.get('key') || 'home-stories';
  const idxParam = Number(searchParams.get('idx') || '0') || 0;
  const currentUserId = (profile as any)?.$id || (profile as any)?.id || '';

  const [stories, setStories] = useState<any[]>([]);
  const [ui, setUi] = useState(0);
  const [si, setSi] = useState(0);
  const [likedSet, setLikedSet] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const toastTimerRef = useRef<any>(null);

  const current = stories[ui] || null;
  const slide = current?.slides?.[si] || null;

  useEffect(() => {
    let parsed: any[] | null = null;
    try {
      const raw = sessionStorage.getItem(keyParam);
      if (raw) parsed = JSON.parse(raw);
    } catch {}
    if (Array.isArray(parsed) && parsed.length > 0) {
      setStories(parsed);
      const start = Math.min(Math.max(Math.floor(idxParam), 0), parsed.length - 1);
      setUi(start);
      setSi(0);
      return;
    }
    if (postId) {
      feedService
        .getPost(postId)
        .then((data: any) => {
          const doc = data?.document || data;
          if (!doc) return;
          const slides = (Array.isArray(doc.images) ? doc.images.filter(Boolean) : []);
          if (slides.length === 0) return;
          setStories([{
            id: doc.userId || postId,
            name: doc.userName || 'Odogwu',
            avatar: doc.userPhoto ? storageService.getFilePreview(doc.userPhoto) : '',
            slides: slides.map((im: string) => ({
              postId: doc.id || postId,
              img: storageService.getFilePreview(im),
              ago: '',
              caption: doc.caption || '',
            })),
          }]);
          setUi(0);
          setSi(0);
        })
        .catch(() => {
          setStories([{ id: postId, name: 'Odogwu', avatar: '', slides: [{ img: '', ago: '', caption: '' }] }]);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const advance = useCallback(() => {
    setSi(prevSi => {
      const cur = stories[ui];
      if (!cur) return prevSi;
      if (prevSi + 1 < cur.slides.length) return prevSi + 1;
      setUi(prevUi => {
        if (prevUi + 1 < stories.length) {
          setSi(0);
          return prevUi + 1;
        }
        router.replace('/home');
        return prevUi;
      });
      return prevSi;
    });
  }, [stories, ui, router]);

  useEffect(() => {
    if (!current || !slide) return;
    if (commentsOpen) return;
    const t = setTimeout(advance, DURATION);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, slide, ui, si, commentsOpen]);

  const showToast = (message: string) => {
    setToast(message);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(''), 1600);
  };

  const handleLike = async () => {
    if (!slide?.postId) return;
    const id = slide.postId;
    if (likedSet.has(id)) {
      try { await feedService.unlikePost(id); } catch {}
      setLikedSet(prev => { const n = new Set(prev); n.delete(id); return n; });
      showToast('Removed like');
    } else {
      try { await feedService.likePost(id); } catch {}
      setLikedSet(prev => new Set(prev).add(id));
      showToast('Liked ❤️');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${current?.name || 'Odogwu'} — Story`,
      text: slide?.caption || '',
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      try { await navigator.clipboard.writeText(window.location.href); } catch {}
      showToast('Share link copied');
    }
  };

  const handleCopyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); } catch {}
    showToast('Link copied');
    setModalOpen(false);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const liked = slide ? likedSet.has(slide.postId) : false;
  const slideCount = current?.slides?.length || 1;

  return (
    <div className="story-app">
      <style jsx global>{`
        html, body {
          background: #000;
          overflow: hidden;
          overscroll-behavior: none;
        }
        .story-app {
          position: fixed; inset: 0;
          width: 100%; height: 100svh;
          background: #000; overflow: hidden;
          display: grid; place-items: center;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        .story-frame {
          position: relative;
          width: min(100vw, calc(100svh * 710 / 1536));
          height: min(100svh, calc(100vw * 1536 / 710));
          aspect-ratio: 710 / 1536;
          overflow: hidden; background: #000; isolation: isolate;
        }
        .story-media {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; display: block; user-select: none; -webkit-user-drag: none;
        }
        .story-shade {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(to bottom, rgba(0,0,0,.4) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 72%, rgba(0,0,0,.4) 100%);
        }
        .story-progress {
          position: absolute; top: 0; left: 0; right: 0; z-index: 6;
          display: flex; gap: 3px; padding: 8px 9px 0; box-sizing: border-box;
        }
        .story-progress span {
          flex: 1; height: 3px; border-radius: 2px; background: rgba(255,255,255,.32);
          overflow: hidden; position: relative;
        }
        .story-progress span i {
          position: absolute; inset: 0; border-radius: 2px; background: #fff;
        }
        .story-progress span.fill i { transform: scaleX(1); }
        .story-progress span.cur i {
          transform-origin: left;
          animation: storyfill var(--dur, 5s) linear forwards;
        }
        @keyframes storyfill { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .story-author {
          position: absolute; top: 22px; left: 16px; right: 72px; z-index: 6;
          display: flex; align-items: center; gap: 10px;
        }
        .story-author img {
          width: 40px; height: 40px; border-radius: 50%;
          border: 2px solid #fff; object-fit: cover; flex-shrink: 0; background: #333;
        }
        .story-author > span {
          width: 40px; height: 40px; border-radius: 50%;
          border: 2px solid #fff; background: #333; color: #fff;
          display: grid; place-items: center; font-size: 17px; font-weight: 800; flex-shrink: 0;
        }
        .story-author b {
          display: block; font-size: 15px; color: #fff; font-weight: 700;
          text-shadow: 0 1px 3px rgba(0,0,0,.6); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .story-author small { display: block; font-size: 12px; color: rgba(255,255,255,.9); margin-top: 2px; text-shadow: 0 1px 2px rgba(0,0,0,.6); }
        .story-close {
          position: absolute; z-index: 6; right: 8px; top: 18px;
          width: 42px; height: 42px; border: 0; padding: 0; background: transparent;
          color: #fff; cursor: pointer; font-size: 30px; line-height: 1;
          display: grid; place-items: center; text-shadow: 0 1px 3px rgba(0,0,0,.5);
        }
        .story-rail {
          position: absolute; z-index: 6; right: 12px; top: 48%; transform: translateY(-50%);
          display: flex; flex-direction: column; gap: 34px; align-items: center;
        }
        .story-btn {
          background: none; border: 0; padding: 0; cursor: pointer; color: #fff;
          display: flex; flex-direction: column; align-items: center; gap: 2px;
          text-shadow: 0 1px 3px rgba(0,0,0,.5);
        }
        .story-btn svg { width: 30px; height: 30px; display: block; filter: drop-shadow(0 1px 3px rgba(0,0,0,.5)); }
        .story-btn small { font-size: 11px; font-weight: 600; }
        .story-btn.liked svg { fill: #ff2e5f; stroke: #ff2e5f; }
        .story-caption {
          position: absolute; z-index: 6; left: 16px; right: 68px; bottom: 30px;
          color: #fff; font-size: 14px; line-height: 1.45; font-weight: 600;
          text-shadow: 0 1px 3px rgba(0,0,0,.8);
          display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
          word-break: break-word;
        }
        .story-caption::before {
          content: ""; position: absolute; inset: -10px -14px; z-index: -1; border-radius: 12px;
          background: linear-gradient(to top, rgba(0,0,0,.45), rgba(0,0,0,0));
        }
        .story-toast {
          position: absolute; z-index: 20; left: 50%; bottom: 5%;
          transform: translate(-50%, 20px); padding: 10px 16px; border-radius: 999px;
          color: #fff; background: rgba(0,0,0,.78); font-size: clamp(12px, 1.8vw, 15px);
          white-space: nowrap; opacity: 0; pointer-events: none;
          transition: opacity .2s ease, transform .2s ease;
        }
        .story-toast.show { opacity: 1; transform: translate(-50%, 0); }
        .story-modal {
          position: absolute; inset: 0; z-index: 30; display: grid; place-items: end center;
          padding: 18px; background: rgba(0,0,0,.45);
          opacity: 0; visibility: hidden; pointer-events: none; transition: opacity .2s ease, visibility .2s ease;
        }
        .story-modal.open { opacity: 1; visibility: visible; pointer-events: auto; }
        .story-modal-card {
          position: relative; width: min(100%, 360px); padding: 22px; border-radius: 22px;
          background: rgba(25,25,25,.96); color: #fff; box-shadow: 0 18px 50px rgba(0,0,0,.5);
        }
        .story-modal-card h2 { margin: 0 0 14px; font-size: 20px; }
        .story-modal-close {
          position: absolute; top: 10px; right: 12px; width: 34px; height: 34px;
          border: 0; border-radius: 50%; background: #333; color: #fff; font-size: 24px; cursor: pointer;
        }
        .story-option { width: 100%; margin-top: 9px; padding: 13px 15px; border: 0; border-radius: 12px; background: #333; color: #fff; text-align: left; font-size: 15px; cursor: pointer; }
        .story-option:hover { background: #444; }
        @media (min-width: 900px) {
          .story-app { padding: 12px; }
          .story-frame { box-shadow: 0 0 0 1px #111, 0 22px 70px rgba(0,0,0,.75); border-radius: 2px; }
        }
        @media (orientation: landscape) and (max-height: 650px) {
          .story-frame { height: 100svh; width: calc(100svh * 710 / 1536); }
        }
      `}</style>

      <div className="story-frame">
        {slide?.img
          ? <img className="story-media" src={slide.img} alt={`${current?.name || 'Story'} story`} fetchPriority="high" decoding="async" />
          : <div className="story-media" style={{ display: 'grid', placeItems: 'center', color: '#777' }}>{stories.length ? '' : 'Loading story…'}</div>}
        <div className="story-shade"></div>

        <div className="story-progress">
          {Array.from({ length: slideCount }).map((_, i) => (
            <span key={`${current?.id}-${i}`} className={i < si ? 'fill' : i === si ? 'cur' : ''}>
              {i === si ? <i key={`${ui}-${si}`} style={{ ['--dur' as any]: `${DURATION}ms` }}></i> : null}
              {i < si ? <i style={{ transform: 'scaleX(1)' }}></i> : null}
            </span>
          ))}
        </div>

        <button className="story-close" aria-label="Close story" onClick={() => router.back()}>✕</button>

        <div className="story-author">
          {current?.avatar ? <img src={current.avatar} alt="" decoding="async" /> : <span>{((current?.name || 'O')[0] || 'O').toUpperCase()}</span>}
          <div style={{ minWidth: 0 }}>
            <b>{current?.name || 'Odogwu'}</b>
            <small>{slide?.ago || ''}</small>
          </div>
        </div>

        <div className="story-rail">
          <button className={`story-btn ${liked ? 'liked' : ''}`} aria-label="Like story" onClick={handleLike}>
            <svg viewBox="0 0 48 48" fill="none" stroke="#fff" strokeWidth="2.6"><path d="M24 40s-14-9-14-20a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 11-14 20-14 20Z"/></svg>
            <small>{liked ? 'Liked' : 'Like'}</small>
          </button>
          <button className="story-btn" aria-label="Comment" onClick={() => setCommentsOpen(true)}>
            <svg viewBox="0 0 48 48" fill="none" stroke="#fff" strokeWidth="2.6"><path d="M12 35l2-7a14 14 0 1 1 5 5l-7 2Z"/><circle cx="20" cy="22" r="1.8" fill="#fff"/><circle cx="26" cy="22" r="1.8" fill="#fff"/><circle cx="32" cy="22" r="1.8" fill="#fff"/></svg>
            <small>Comment</small>
          </button>
          <button className="story-btn" aria-label="Share story" onClick={handleShare}>
            <svg viewBox="0 0 48 48" fill="none" stroke="#fff" strokeWidth="2.6"><path d="M24 29V8M17 15l7-7 7 7"/><path d="M12 19H9a3 3 0 0 0-3 3v17a3 3 0 0 0 3 3h30a3 3 0 0 0 3-3V22a3 3 0 0 0-3-3h-3"/></svg>
            <small>Share</small>
          </button>
          <button className="story-btn" aria-label="More options" onClick={() => setModalOpen(true)}>
            <svg viewBox="0 0 48 48" fill="#fff"><circle cx="24" cy="11" r="3.4"/><circle cx="24" cy="24" r="3.4"/><circle cx="24" cy="37" r="3.4"/></svg>
          </button>
        </div>

        <div className={`story-toast${toast ? ' show' : ''}`} role="status" aria-live="polite">{toast}</div>

        {slide?.caption ? (
          <div className="story-caption">{slide.caption}</div>
        ) : null}

        <div className={`story-modal${modalOpen ? ' open' : ''}`} aria-hidden={!modalOpen} onClick={() => setModalOpen(false)}>
          <div className="story-modal-card" onClick={e => e.stopPropagation()}>
            <button className="story-modal-close" aria-label="Close" onClick={() => setModalOpen(false)}>×</button>
            <h2>Story options</h2>
            <button className="story-option" onClick={() => { showToast('Report selected'); setModalOpen(false); }}>Report</button>
            <button className="story-option" onClick={() => { showToast(`Mute ${current?.name || 'user'} — selected`); setModalOpen(false); }}>Mute {current?.name || 'user'}</button>
            <button className="story-option" onClick={handleCopyLink}>Copy link</button>
          </div>
        </div>

        {commentsOpen && slide?.postId ? (
          <CommentSheet
            post={{ id: slide.postId, userName: current?.name || '', userPhoto: '', caption: slide.caption || '' } as any}
            currentUserId={currentUserId}
            onClose={() => setCommentsOpen(false)}
            onCommentAdded={() => {}}
          />
        ) : null}
      </div>
    </div>
  );
}