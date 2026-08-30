'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronBackIcon } from '@/components/Icons';
import AppShell from '@/components/AppShell';
import PostCard from '@/components/PostCard';
import CommentSheet from '@/components/CommentSheet';
import { useAuth } from '@/store/AuthContext';
import { feedService } from '@/lib/cloudflare/services';
import { FeedPost } from '@/lib/types';

export default function SinglePostPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const postId = params?.id as string;

  const [post, setPost] = useState<FeedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [commentPost, setCommentPost] = useState<FeedPost | null>(null);

  useEffect(() => {
    if (!postId) return;
    (async () => {
      try {
        const data = await feedService.getPost(postId);
        if (data?.document) {
          setPost(data.document);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
      setLoading(false);
    })();
  }, [postId]);

  const handleLikeToggle = useCallback((postId: string, liked: boolean) => {
    setPost(prev => {
      if (!prev || prev.id !== postId) return prev;
      return {
        ...prev,
        likedByMe: liked,
        likesCount: prev.likesCount + (liked ? 1 : -1),
      };
    });
  }, []);

  const handleSaveToggle = useCallback((postId: string, saved: boolean) => {
    setPost(prev => {
      if (!prev || prev.id !== postId) return prev;
      return { ...prev, savedByMe: saved };
    });
  }, []);

  const handleCommentAdded = useCallback((postId: string) => {
    setPost(prev => {
      if (!prev || prev.id !== postId) return prev;
      return { ...prev, commentsCount: prev.commentsCount + 1 };
    });
  }, []);

  const handleDelete = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <AppShell>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', position: 'sticky', top: 0, zIndex: 20, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}>
          <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <ChevronBackIcon size={24} color="#151515" />
          </button>
          <span style={{ fontSize: 17, fontWeight: 700, color: '#151515' }}>Post</span>
        </div>

        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{ width: 32, height: 32, borderRadius: 12, border: '2px solid rgba(255,46,95,0.2)', borderTopColor: '#FF2E5F', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : error || !post ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: 12 }}>
              <span style={{ fontSize: 40 }}>Ã°Å¸â€œÂ­</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#151515' }}>Post not found</span>
              <span style={{ fontSize: 13, color: '#8A8A8F' }}>This post may have been deleted or is not available.</span>
              <button onClick={() => router.back()} style={{ marginTop: 8, padding: '10px 24px', background: 'linear-gradient(135deg, #FF2E5F, #FF4530)', border: 'none', borderRadius: 9999, color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Go Back
              </button>
            </div>
          ) : (
            <PostCard
              post={post}
              currentUserId={user?.$id || ''}
              onLikeToggle={handleLikeToggle}
              onSaveToggle={handleSaveToggle}
              onComment={(p) => setCommentPost(p)}
              onDelete={handleDelete}
            />
          )}
        </div>

        {commentPost && user?.$id && (
          <CommentSheet post={commentPost} currentUserId={user.$id} onClose={() => setCommentPost(null)} onCommentAdded={handleCommentAdded} />
        )}
      </div>
    </AppShell>
  );
}
