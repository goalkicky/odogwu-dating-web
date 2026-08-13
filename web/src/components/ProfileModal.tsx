'use client';
import React, { useState } from 'react';
import { CloseIcon, LocationIcon, ChevronBackIcon, ChevronForwardIcon } from '@/components/Icons';
import { INTEREST_CATEGORIES } from '@/lib/interests';

export interface ProfileModalUser {
  id?: string;
  fullName: string;
  age?: number;
  photos: string[];
  city?: string;
  distanceKm?: number;
  gender?: string;
  bio?: string;
  interests?: string[];
}

export default function ProfileModal({ user, onClose }: { user: ProfileModalUser; onClose: () => void }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos: string[] = user.photos || [];
  const currentPhoto = photos[photoIndex] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400';

  const grouped = INTEREST_CATEGORIES
    .map(cat => ({ cat, items: cat.items.filter((it) => (user.interests || []).includes(it)) }))
    .filter(g => g.items.length > 0);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#000', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      {/* Photo carousel */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', maxHeight: '70dvh', overflow: 'hidden', background: '#16161C' }}>
        <img src={currentPhoto} alt={user.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 90, background: 'linear-gradient(rgba(0,0,0,0.5), transparent)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 170, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))' }} />

        {photos.length > 0 && (
          <div style={{ position: 'absolute', top: 14, left: 12, right: 12, display: 'flex', gap: 5 }}>
            {photos.map((_, i) => (
              <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i === photoIndex ? 'white' : 'rgba(255,255,255,0.35)', transition: 'all 0.2s ease' }} />
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          aria-label="Close profile"
          style={{ position: 'absolute', top: 14, right: 14, width: 40, height: 40, borderRadius: 9999, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}
        >
          <CloseIcon size={18} color="white" />
        </button>

        {photos.length > 1 && (
          <>
            <button
              onClick={() => setPhotoIndex((photoIndex - 1 + photos.length) % photos.length)}
              aria-label="Previous photo"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: 9999, background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}
            >
              <ChevronBackIcon size={20} color="white" />
            </button>
            <button
              onClick={() => setPhotoIndex((photoIndex + 1) % photos.length)}
              aria-label="Next photo"
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: 9999, background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}
            >
              <ChevronForwardIcon size={20} color="white" />
            </button>
          </>
        )}

        <div style={{ position: 'absolute', left: 20, right: 20, bottom: 20, zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 30, fontWeight: 800, color: 'white', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>{user.fullName}</span>
            {user.age ? <span style={{ fontSize: 26, fontWeight: 400, color: 'rgba(255,255,255,0.95)', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>{user.age}</span> : null}
          </div>
          {user.city && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
              <LocationIcon size={14} color="rgba(255,255,255,0.85)" />
              <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>{user.city}</span>
              {typeof user.distanceKm === 'number' && (
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>· {user.distanceKm} km</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '20px 20px 90px' }}>
        {user.bio && (
          <section style={{ marginBottom: 26 }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase', color: '#8A8A8A', margin: '0 0 10px' }}>About</h3>
            <p style={{ fontSize: 15, color: '#D6D6D6', lineHeight: '24px', margin: 0, whiteSpace: 'pre-wrap' }}>{user.bio}</p>
          </section>
        )}

        {(user.gender || user.age || user.city) && (
          <section style={{ marginBottom: 26 }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase', color: '#8A8A8A', margin: '0 0 10px' }}>Details</h3>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
              {user.gender && <DetailRow label="Gender" value={user.gender} capitalize />}
              {user.age ? <DetailRow label="Age" value={String(user.age)} /> : null}
              {user.city && <DetailRow label="Location" value={user.city} />}
            </div>
          </section>
        )}

        {grouped.length > 0 && (
          <section>
            <h3 style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.4, textTransform: 'uppercase', color: '#8A8A8A', margin: '0 0 14px' }}>Interests</h3>
            <div>
              {grouped.map(({ cat, items }) => (
                <div key={cat.label} style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#6B6B6B', marginBottom: 10 }}>{cat.label}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {items.map((it) => (
                      <span key={it} style={{
                        padding: '8px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 600, color: 'white',
                        background: 'linear-gradient(135deg, rgba(255,55,95,0.18), rgba(108,99,255,0.16))',
                        border: '1px solid rgba(255,55,95,0.35)',
                      }}>
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', minHeight: 52, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ width: 108, fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#6B6B6B', flexShrink: 0 }}>{label}</span>
      <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: 'white', textTransform: capitalize ? 'capitalize' : 'none' }}>{value}</span>
    </div>
  );
}
