'use client';
import React, { useState, useRef, useCallback } from 'react';
import { CloseIcon, CameraIcon, ImagesIcon } from '@/components/Icons';
import { feedService, storageService } from '@/lib/cloudflare/services';

interface CreatePostModalProps {
  currentUserId: string;
  interest: string;
  onClose: () => void;
  onPostCreated: () => void;
}

export default function CreatePostModal({ currentUserId, interest, onClose, onPostCreated }: CreatePostModalProps) {
  const [images, setImages] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activePreview, setActivePreview] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePickImages = useCallback(async () => {
    fileRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const remaining = 10 - images.length;
    const toUpload = files.slice(0, remaining);
    if (toUpload.length === 0) return;

    const placeholders = toUpload.map(() => '');
    const newPreviews = toUpload.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...placeholders]);
    setPreviews(prev => [...prev, ...newPreviews]);
    setUploading(true);
    if (fileRef.current) fileRef.current.value = '';

    for (let i = 0; i < toUpload.length; i++) {
      try {
        const data = await storageService.uploadFile(toUpload[i]);
        const idx = images.length + i;
        setImages(prev => prev.map((k, j) => j === idx ? data.key : k));
      } catch {}
    }

    setUploading(false);
  }, [images.length]);

  const removeImage = useCallback((index: number) => {
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setImages(prev => prev.filter((_, i) => i !== index));
    setActivePreview(prev => Math.max(0, Math.min(prev, previews.length - 2)));
  }, [previews.length]);

  const handlePost = useCallback(async () => {
    if (images.length === 0 || posting) return;
    setPosting(true);
    try {
      await feedService.createPost(images, caption.trim(), interest);
      onPostCreated();
    } catch {}
    setPosting(false);
  }, [images, caption, interest, posting, onPostCreated]);

  const canPost = images.length > 0 && !posting && !uploading;

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} className="feed-sheet-up" style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', background: 'rgba(16,16,22,0.97)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
            <CloseIcon size={22} color="#6B6B6B" />
          </button>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: 0 }}>New Post</h3>
          <button
            onClick={handlePost}
            disabled={!canPost}
            style={{
              background: canPost ? 'linear-gradient(135deg, #FF375F, #FF3B30)' : 'rgba(255,255,255,0.06)',
              border: 'none', borderRadius: 9999, padding: '8px 20px', color: 'white',
              fontSize: 14, fontWeight: 700, cursor: canPost ? 'pointer' : 'default',
              opacity: canPost ? 1 : 0.4, transition: 'all 0.2s',
            }}
          >
            {posting ? 'Posting...' : 'Share'}
          </button>
        </div>

        {/* Image preview area */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', background: '#0A0A0E' }}>
          {previews.length > 0 ? (
            <>
              <img
                src={previews[activePreview]}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Image count */}
              {previews.length > 1 && (
                <div style={{ position: 'absolute', top: 12, right: 12, padding: '4px 10px', borderRadius: 9999, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', fontSize: 11, fontWeight: 700, color: 'white' }}>
                  {activePreview + 1}/{previews.length}
                </div>
              )}
              {/* Remove button */}
              <button
                onClick={() => removeImage(activePreview)}
                style={{ position: 'absolute', top: 12, left: 12, width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}
              >
                <CloseIcon size={14} color="white" />
              </button>
              {/* Dot indicators */}
              {previews.length > 1 && (
                <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
                  {previews.map((_, i) => (
                    <div
                      key={i}
                      onClick={() => setActivePreview(i)}
                      style={{
                        width: 7, height: 7, borderRadius: 9999, cursor: 'pointer',
                        background: i === activePreview ? '#FF375F' : 'rgba(255,255,255,0.4)',
                        transition: 'all 0.2s', boxShadow: i === activePreview ? '0 0 6px rgba(255,55,95,0.6)' : 'none',
                      }}
                    />
                  ))}
                </div>
              )}
              {/* Add more button */}
              {previews.length < 10 && (
                <button
                  onClick={handlePickImages}
                  style={{ position: 'absolute', bottom: 12, right: 12, width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}
                >
                  <ImagesIcon size={16} color="white" />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handlePickImages}
              style={{ width: '100%', height: '100%', background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}
            >
              {uploading ? (
                <div style={{ width: 40, height: 40, borderRadius: 14, border: '3px solid rgba(255,55,95,0.2)', borderTopColor: '#FF375F', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <CameraIcon size={48} color="#6B6B6B" />
              )}
              <span style={{ fontSize: 14, fontWeight: 600, color: '#6B6B6B' }}>
                {uploading ? 'Uploading...' : 'Tap to add photos'}
              </span>
              <span style={{ fontSize: 12, color: '#4A4A4A' }}>Up to 10 images</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Caption */}
        <div style={{ padding: '16px 20px 0' }}>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            maxLength={2200}
            rows={3}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '12px 14px', color: 'white', fontSize: 14, outline: 'none',
              resize: 'none', fontFamily: 'inherit', lineHeight: 1.4,
            }}
          />
          <div style={{ textAlign: 'right', marginTop: 4 }}>
            <span style={{ fontSize: 11, color: '#4A4A4A' }}>{caption.length}/2200</span>
          </div>
        </div>

        {/* Interest tag */}
        <div style={{ padding: '12px 20px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6B6B6B', marginBottom: 8 }}>Posting to</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 9999, background: 'rgba(255,55,95,0.12)', border: '1px solid rgba(255,55,95,0.3)' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#FF375F' }}>{interest}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
