'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/store/AuthContext';
import { matchService, storageService, userService } from '@/lib/cloudflare/services';
import { account } from '@/lib/cloudflare/config';
import { LIKES_TEMPLATE_CSS } from '@/lib/likesTemplateStyles';
import { profileCompletion } from '@/lib/profileCompletion';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name-az', label: 'Name A–Z' },
  { value: 'name-za', label: 'Name Z–A' },
  { value: 'age-young', label: 'Youngest first' },
  { value: 'age-old', label: 'Oldest first' },
];

export default function LikesPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [likers, setLikers] = useState<any[]>([]);
  const [matchesCount, setMatchesCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);
  const [likePhoto, setLikePhoto] = useState('');
  const [matchPhoto, setMatchPhoto] = useState('');
  const [nearbyCount, setNearbyCount] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [sortMenu, setSortMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [likingId, setLikingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const uid = (profile as any)?.$id || (profile as any)?.id;
  const profilePhoto = profile?.photos?.[0] ? storageService.getFilePreview(profile.photos[0]) : '';
  const fullName = (profile as any)?.fullName || (profile as any)?.displayName || 'Odogwu';
  const initial = (fullName[0] || 'O').toUpperCase();
  const completion = profileCompletion(profile);

  useEffect(() => {
    if (!uid) return;
    matchService.getWhoLikedMe(uid)
      .then(docs => {
        const withPhotos = docs.map((d: any) => {
          const mp = d.matchedUser;
          if (!mp) return d;
          return {
            ...d,
            matchedUser: {
              ...mp,
              _photoUrl: mp.photos?.[0] ? storageService.getFilePreview(mp.photos[0]) : '',
            },
          };
        });
        setLikers(withPhotos);
        const first = docs[0]?.matchedUser;
        if (first?.photos?.[0]) setLikePhoto(storageService.getFilePreview(first.photos[0]));
        setLoading(false);
      })
      .catch(() => setLoading(false));
    matchService.getUserMatches(uid)
      .then((res: any) => {
        const docs = Array.isArray(res) ? res : (res?.documents || []);
        const newMatches = docs.filter((d: any) => !d.hasConversation);
        setMatchesCount(newMatches.length);
        setMessagesCount(docs.reduce((s: number, d: any) => s + Number(d.unreadCount || 0), 0));
        const firstNew = newMatches[0]?.matchedUser;
        if (firstNew?.photos?.[0]) setMatchPhoto(storageService.getFilePreview(firstNew.photos[0]));
      })
      .catch(() => {});
    if (profile?.interestedIn) {
      let savedLat: number | undefined;
      let savedLng: number | undefined;
      try {
        const raw = localStorage.getItem('dogwu_location');
        if (raw) {
          const loc = JSON.parse(raw);
          if (typeof loc.lat === 'number' && typeof loc.lon === 'number') {
            savedLat = loc.lat;
            savedLng = loc.lon;
          }
        }
      } catch {}
      userService.getDiscoverUsers(uid, {
        gender: profile.interestedIn === 'both' ? 'male' : profile.interestedIn,
        minAge: 18, maxAge: 60, maxDistance: 25,
        ...(savedLat !== undefined && savedLng !== undefined ? { lat: savedLat, lng: savedLng } : {}),
      }).then((docs: any[]) => setNearbyCount((Array.isArray(docs) ? docs : []).length)).catch(() => {});
    }
  }, [uid, profile]);

  const showToast = (msg: string) => {
    setToast(msg);
    setToastVisible(true);
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToastVisible(false), 1400);
  };

  const sortedLikers = useMemo(() => {
    const arr = [...likers];
    const getTime = (d: any) => new Date(d?.matched_at || 0).getTime();
    switch (sortBy) {
      case 'oldest': return arr.sort((a, b) => getTime(a) - getTime(b));
      case 'name-az': return arr.sort((a, b) => (a?.matchedUser?.fullName || '').localeCompare(b?.matchedUser?.fullName || ''));
      case 'name-za': return arr.sort((a, b) => (b?.matchedUser?.fullName || '').localeCompare(a?.matchedUser?.fullName || ''));
      case 'age-young': return arr.sort((a, b) => (a?.matchedUser?.age || 0) - (b?.matchedUser?.age || 0));
      case 'age-old': return arr.sort((a, b) => (b?.matchedUser?.age || 0) - (a?.matchedUser?.age || 0));
      default: return arr;
    }
  }, [likers, sortBy]);

  useEffect(() => {
    if (!sortMenu) return;
    const onDown = () => setSortMenu(false);
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [sortMenu]);

  const scrollToCards = () => {
    document.getElementById('lk-people')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLikeBack = async (likerId: string) => {
    if (!account || !profile) return;
    setLikingId(likerId);
    try {
      const res = await userService.likeUser(uid, likerId);
      setLikers(prev => prev.filter(d => {
        const otherId = d.matchedUser?.$id || d.matchedUser?.id || d.userId;
        return otherId !== likerId;
      }));
      if (res?.mutual && res.match?.$id) {
        router.push(`/match/${res.match.$id}`);
      }
      showToast('Liked');
    } catch {}
    setLikingId(null);
  };

  const handleReject = (userId: string) => {
    setLikers(prev => prev.filter(d => {
      const otherId = d.matchedUser?.$id || d.matchedUser?.id || d.userId;
      return otherId !== userId;
    }));
    showToast('Passed');
  };

  const handleSave = (userId: string) => {
    const isSaved = savedIds.has(userId);
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
    showToast(isSaved ? 'Removed' : 'Saved');
  };

  return (
    <AppShell header={<></>}>
      <style jsx global>{LIKES_TEMPLATE_CSS}</style>

      <div className="lk app">
        <header className="lk topbar">
          <button className="lk menu" aria-label="Menu" onClick={() => router.push('/settings')}>
            <span></span><span></span><span></span>
          </button>
          <img className="lk brand-logo" src="/o-logo.png" alt="Odogwu" width={44} height={44} decoding="async" />
          <button className="lk messages" aria-label="Messages" onClick={() => router.push('/matches')}>
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <path d="M10 35l2-7a14 14 0 1 1 5 5l-7 2Z" fill="none" stroke="currentColor" strokeWidth="3"/>
              <circle cx="20" cy="22" r="1.7" fill="currentColor"/>
              <circle cx="26" cy="22" r="1.7" fill="currentColor"/>
              <circle cx="32" cy="22" r="1.7" fill="currentColor"/>
            </svg>
            <em>{messagesCount || 0}</em>
          </button>
        </header>

        <section className="lk quick-nav">
          <button className="lk quick" onClick={() => router.push('/edit-profile')}>
            <span className="lk round-photo story" style={{ ['--pct' as any]: completion }}>
              {profilePhoto ? (
                <img src={profilePhoto} alt="" loading="lazy" decoding="async" />
              ) : (
                <div className="lk initial">{initial}</div>
              )}
              <b className="lk plus">+</b>
            </span>
            <label>Your Story</label>
          </button>
          <button className="lk quick active" onClick={scrollToCards}>
            <span className="lk round-photo">
              {likePhoto ? (
                <img src={likePhoto} alt="" />
              ) : (
                <span className="lk fallback">
                  <svg viewBox="0 0 48 48">
                    <path d="M24 40S9 30 9 19c0-6 4-10 10-10 4 0 6 2 5 6 1-4 3-6 5-6 6 0 10 4 10 10 0 11-15 21-15 21Z"/>
                  </svg>
                </span>
              )}
              <b className="lk badge-count">{likers.length}</b>
            </span>
            <label>Likes You</label>
          </button>
          <button className="lk quick" onClick={() => router.push('/my-matches')}>
            <span className="lk round-photo">
              {matchPhoto ? (
                <img src={matchPhoto} alt="" loading="lazy" decoding="async" />
              ) : (
                <span className="lk fallback">
                  <svg viewBox="0 0 48 48">
                    <path d="M24 40S9 30 9 19c0-6 4-10 10-10 4 0 6 2 5 6 1-4 3-6 5-6 6 0 10 4 10 10 0 11-15 21-15 21Z"/>
                  </svg>
                </span>
              )}
              <b className="lk badge-count">{matchesCount}</b>
            </span>
            <label>Matches</label>
          </button>
          <button className="lk quick" onClick={() => router.push('/discover')}>
            <span className="lk round-photo location">
              <svg viewBox="0 0 64 64">
                <path d="M32 7c-12 0-21 9-21 21 0 15 21 29 21 29s21-14 21-29C53 16 44 7 32 7Zm0 29a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"/>
              </svg>
              <b className="lk badge-count">{nearbyCount}</b>
            </span>
            <label>Nearby</label>
          </button>
        </section>

        <section id="lk-people">
          <div className="lk section-head">
            <h1 className="lk section-title">
              People who like you <span>{likers.length}</span>
            </h1>
            <div className="lk sort-wrap" onMouseDown={(e) => e.stopPropagation()}>
              <button className="lk sort" onClick={() => setSortMenu(v => !v)}>
                {sortBy === 'newest' ? 'Sort' : SORT_OPTIONS.find(o => o.value === sortBy)?.label.split(' ')[0]}
                <svg viewBox="0 0 30 30">
                  <path d="M7 8h16M7 15h10M7 22h5"/>
                  <circle cx="23" cy="8" r="2"/>
                  <circle cx="19" cy="15" r="2"/>
                  <circle cx="14" cy="22" r="2"/>
                </svg>
              </button>
              {sortMenu && (
                <div className="lk sort-menu">
                  {SORT_OPTIONS.map(o => (
                    <button
                      key={o.value}
                      className={`lk sort-item${sortBy === o.value ? ' active' : ''}`}
                      onClick={() => { setSortBy(o.value); setSortMenu(false); }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="lk state">
              <div className="lk spinner" />
              <span style={{ color: '#8A8A8F', fontSize: 15 }}>Loading...</span>
            </div>
          ) : likers.length === 0 ? (
            <div className="lk state">
              <span className="lk state-title">No likes yet</span>
              <span className="lk state-sub">Keep swiping on Discover to get more likes!</span>
              <button
                onClick={() => router.push('/discover')}
                style={{ marginTop: 6, padding: '12px 28px', borderRadius: 9999, background: 'var(--red)', color: 'white', fontSize: 14, fontWeight: 700, boxShadow: '0 6px 24px rgba(231,25,67,0.4)' }}
              >
                Start Swiping
              </button>
            </div>
          ) : (
            <main className="lk grid">
              {sortedLikers.map((item: any) => {
                const mp = item.matchedUser || {};
                const photoUrl = mp._photoUrl || '';
                const name = mp.fullName || 'User';
                const age = mp.age || '';
                const occupation = mp.occupation || '';
                const city = mp.city || '';
                const isVerified = !!mp.verified;
                const otherId = mp.$id || mp.id || item.userId;
                return (
                  <article className="lk card" key={item.$id || otherId}>
                    {photoUrl ? (
                      <img className="lk card-photo" src={photoUrl} alt={name} loading="lazy" decoding="async" />
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#3a3a3f' }}>
                        <span style={{ color: '#fff', fontSize: 58, fontWeight: 700 }}>{name[0]}</span>
                      </div>
                    )}
                    <button className="lk heart-outline" aria-label="Save" onClick={() => handleSave(otherId)}>
                      <svg viewBox="0 0 40 40">
                        <path d="M20 34S5 25 5 15c0-5 3-8 8-8 3 0 6 2 7 5 1-3 4-5 7-5 5 0 8 3 8 8 0 10-15 19-15 19Z"/>
                      </svg>
                    </button>
                    <div className="lk card-info">
                      <div className="lk name">
                        {name}{age ? `, ${age}` : ''}
                        {isVerified && <span className="lk verified">✓</span>}
                      </div>
                      {occupation && <div className="lk meta">▣ &nbsp;{occupation}</div>}
                      {city && <div className="lk meta">⌖ &nbsp;{city}</div>}
                    </div>
                    <div className="lk card-actions">
                      <button className="lk card-btn" aria-label="Pass" onClick={() => handleReject(otherId)}>✕</button>
                      <button
                        className="lk card-btn like"
                        aria-label="Like back"
                        onClick={() => handleLikeBack(otherId)}
                        disabled={likingId === otherId}
                      >
                        ♥
                      </button>
                    </div>
                  </article>
                );
              })}
            </main>
          )}
        </section>
      </div>

      <div className={`lk toast${toastVisible ? '' : ''}`} style={{ opacity: toastVisible ? 1 : 0, transform: `translateX(-50%) translateY(${toastVisible ? 0 : 20}px)` }}>{toast}</div>
    </AppShell>
  );
}