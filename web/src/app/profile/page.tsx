'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  DiamondIcon, SettingsIcon, BellIcon, ShieldIcon, HelpIcon,
  ChevronForwardIcon, ChevronBackIcon, EyeIcon, CallIcon, PencilIcon, CheckmarkIcon,
  CameraIcon, PlusIcon, LocationIcon, CoinsIcon, InfiniteIcon, StarIcon, CheckmarkCircleIcon, HeartIcon,
} from '@/components/Icons';
import GradientBackground from '@/components/GradientBackground';
import Button from '@/components/Button';
import TabBar from '@/components/TabBar';
import DesktopLayout from '@/components/DesktopLayout';
import { useAuth } from '@/store/AuthContext';
import { storageService, superlikeService, likeService } from '@/lib/cloudflare/services';
import { INTEREST_CATEGORIES } from '@/lib/interests';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, user, logout } = useAuth();

  const photos = profile?.photos || [];
  const photoUrls = photos.map((id: string) => storageService.getFilePreview(id));
  const [photoIndex, setPhotoIndex] = useState(0);
  const [superlikes, setSuperlikes] = useState<any>({ remaining: 0, dailyLimit: 0, refillsAt: '', isPremium: false });
  const [likes, setLikes] = useState<any>({ remaining: 0, used: 0, dailyLimit: 0, refillsAt: '', isPremium: false });

  useEffect(() => {
    superlikeService.getStatus().then(setSuperlikes).catch(() => {});
    likeService.getStatus().then(setLikes).catch(() => {});
  }, []);

  const name = profile?.fullName || user?.name || 'User';
  const age = profile?.age;
  const displayName = age ? `${name}, ${age}` : name;

  const PLAN_NAMES: Record<string, string> = { premium: 'Odogwu Premium', surplus: 'Odogwu Surplus', platinum: 'Odogwu Platinum' };
  const premiumPlanName = profile?.premiumPlan ? PLAN_NAMES[profile.premiumPlan] || profile.premiumPlan : 'Odogwu Premium';
  const premiumExpiry = profile?.premiumExpiresAt
    ? new Date(profile.premiumExpiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  const nextPhoto = () => setPhotoIndex((p) => (p + 1) % photoUrls.length);
  const prevPhoto = () => setPhotoIndex((p) => (p - 1 + photoUrls.length) % photoUrls.length);

  const completionFields = [
    Boolean(profile?.photos?.length),
    Boolean(profile?.bio),
    Boolean(profile?.age || profile?.dateOfBirth),
    Boolean(profile?.gender),
    Boolean(profile?.interestedIn),
    Boolean(profile?.city),
    Boolean(profile?.interests?.length),
  ];
  const completionPct = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      router.push('/login');
    }
  };

  const detailsRows = [
    { label: 'Gender', value: profile?.gender || '-', capitalize: true },
    { label: 'Interested In', value: profile?.interestedIn || '-', capitalize: true },
    { label: 'Age', value: profile?.age ? String(profile.age) : '-' },
    { label: 'Location', value: profile?.city || '-' },
  ];

  const menuItems = [
    { icon: <PencilIcon size={20} color="#FF6B8A" />, label: 'Edit Profile', onClick: () => router.push('/edit-profile') },
    { icon: <EyeIcon size={20} color="#4FC3F7" />, label: 'Who Likes You', onClick: () => router.push('/likes') },
    { icon: <CallIcon size={20} color="#34C759" />, label: 'Call Log', onClick: () => router.push('/call-logs') },
    { icon: <CoinsIcon size={20} color="#FFD700" />, label: 'Wallet', onClick: () => router.push('/wallet') },
    { icon: <SettingsIcon size={20} color="#D0D0D0" />, label: 'Settings', onClick: () => router.push('/settings') },
    { icon: <BellIcon size={20} color="#FFD700" />, label: 'Notifications', onClick: () => router.push('/notifications') },
    { icon: <ShieldIcon size={20} color="#7C4DFF" />, label: 'Privacy', onClick: () => router.push('/privacy') },
    { icon: <HelpIcon size={20} color="#ABABAB" />, label: 'Help & Support', onClick: () => router.push('/faq') },
  ];

  return (
    <DesktopLayout>
      <GradientBackground style={{ minHeight: '100vh', padding: '24px 16px 110px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Photo box — sized exactly to the current photo */}
          <div
            className="glass animate-fade-up"
            style={{ position: 'relative', borderRadius: 26, overflow: 'hidden' }}
          >
            {photoUrls.length > 0 ? (
              <img
                key={photoIndex}
                src={photoUrls[photoIndex]}
                alt=""
                className="animate-fade-up"
                style={{ width: '100%', height: 'auto', display: 'block' }}
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
              />
            ) : (
              <button onClick={() => router.push('/edit-profile')} style={{ width: '100%', height: 420, background: 'linear-gradient(160deg, rgba(255,55,95,0.14), rgba(108,99,255,0.1)), rgba(255,255,255,0.02)', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#ABABAB' }}>
                <div style={{ width: 64, height: 64, borderRadius: 9999, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PlusIcon size={30} color="white" />
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{name}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Add your photos</span>
              </button>
            )}

            {photoUrls.length > 0 && (
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 34%, rgba(0,0,0,0.82) 100%)' }} />
            )}

            {/* Name + city */}
            {photoUrls.length > 0 && (
              <div style={{ position: 'absolute', left: 22, right: 22, bottom: 26, zIndex: 3 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <h1 style={{ fontSize: 34, fontWeight: 800, color: 'white', margin: 0, letterSpacing: 0.3, textShadow: '0 2px 14px rgba(0,0,0,0.5)' }}>{displayName}</h1>
                  {profile?.verified && (
                    <div style={{ width: 24, height: 24, borderRadius: 9999, background: 'linear-gradient(135deg, #4FC3F7, #0288D1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(79,195,247,0.7)', flexShrink: 0 }}>
                      <CheckmarkIcon size={14} color="white" />
                    </div>
                  )}
                </div>
                {profile?.city && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                    <LocationIcon size={14} color="rgba(255,255,255,0.85)" />
                    <span style={{ fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.92)', textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>{profile.city}</span>
                  </div>
                )}
              </div>
            )}

            {/* Page dots */}
            {photoUrls.length > 1 && (
              <div style={{ position: 'absolute', top: 18, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6, zIndex: 3 }}>
                {photoUrls.map((_, i) => (
                  <span
                    key={i}
                    onClick={() => setPhotoIndex(i)}
                    style={{ width: photoIndex === i ? 20 : 7, height: 7, borderRadius: 9999, background: photoIndex === i ? 'white' : 'rgba(255,255,255,0.4)', transition: 'all 0.25s ease', cursor: 'pointer' }}
                  />
                ))}
              </div>
            )}

            {/* Prev / next arrows */}
            {photoUrls.length > 1 && (
              <>
                <button onClick={prevPhoto} aria-label="Previous photo" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: 9999, background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4, backdropFilter: 'blur(6px)' }}>
                  <ChevronBackIcon size={20} color="white" />
                </button>
                <button onClick={nextPhoto} aria-label="Next photo" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: 9999, background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4, backdropFilter: 'blur(6px)' }}>
                  <ChevronForwardIcon size={20} color="white" />
                </button>
              </>
            )}

            {/* Top controls */}
            <button onClick={() => router.push('/settings')} aria-label="Settings" style={{ position: 'absolute', top: 14, left: 14, width: 40, height: 40, borderRadius: 9999, background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4, backdropFilter: 'blur(6px)' }}>
              <SettingsIcon size={20} color="white" />
            </button>
            <button onClick={() => router.push('/edit-profile')} aria-label="Edit photos" style={{ position: 'absolute', top: 14, right: 14, width: 40, height: 40, borderRadius: 9999, background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4, backdropFilter: 'blur(6px)' }}>
              <CameraIcon size={19} color="white" />
            </button>
          </div>

          {/* About */}
          <div className="glass animate-fade-up" style={{ borderRadius: 20, padding: '20px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: 'white', margin: 0, letterSpacing: 1.4, textTransform: 'uppercase' }}>About</h2>
              <button onClick={() => router.push('/edit-profile')} aria-label="Edit about" style={{ width: 32, height: 32, borderRadius: 9999, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PencilIcon size={14} color="#ABABAB" />
              </button>
            </div>
            <p style={{ fontSize: 15, color: profile?.bio ? '#D6D6D6' : '#6B6B6B', lineHeight: '24px', margin: '12px 0 0' }}>
              {profile?.bio || 'Add a bio so people can learn more about you.'}
            </p>
          </div>

          {/* Interests */}
          <div className="glass animate-fade-up" style={{ borderRadius: 20, padding: '20px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 14, fontWeight: 800, color: 'white', margin: 0, letterSpacing: 1.4, textTransform: 'uppercase' }}>Interests</h2>
              <button onClick={() => router.push('/edit-profile')} aria-label="Edit interests" style={{ width: 32, height: 32, borderRadius: 9999, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PencilIcon size={14} color="#ABABAB" />
              </button>
            </div>
            {(profile?.interests?.length || 0) > 0 ? (
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 18 }}>
                {INTEREST_CATEGORIES
                  .map(cat => ({ cat, items: cat.items.filter(it => (profile?.interests || []).includes(it)) }))
                  .filter(g => g.items.length > 0)
                  .map(({ cat, items }) => (
                    <div key={cat.label}>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#6B6B6B', marginBottom: 10 }}>
                        {cat.label}
                      </div>
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
            ) : (
              <button onClick={() => router.push('/edit-profile')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                <p style={{ fontSize: 14.5, color: '#6B6B6B', margin: '12px 0 0', textAlign: 'left' }}>
                  Add your interests so people can see what you love.
                </p>
              </button>
            )}
          </div>

          {/* Other Personal Details */}
          <div className="glass animate-fade-up" style={{ borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: 14, fontWeight: 800, color: 'white', margin: 0, letterSpacing: 1.4, textTransform: 'uppercase' }}>Other Personal Details</h2>
                <button onClick={() => router.push('/edit-profile')} aria-label="Edit personal details" style={{ width: 32, height: 32, borderRadius: 9999, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PencilIcon size={14} color="#ABABAB" />
                </button>
              </div>
            </div>
            {[
              { label: 'Height', value: profile?.height || '-' },
              { label: 'Weight', value: profile?.weight ? `${profile.weight} kg` : '-' },
              { label: 'Relationship Goals', value: profile?.relationshipGoals || '-', capitalize: true },
            ].map((row, i, arr) => (
              <button
                key={row.label}
                onClick={() => router.push('/edit-profile')}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', padding: '15px 20px',
                  background: 'transparent', border: 'none', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  cursor: 'pointer', textAlign: 'left', gap: 12,
                }}
              >
                <span style={{ width: 130, fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#6B6B6B', flexShrink: 0 }}>{row.label}</span>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: row.value === '-' ? '#6B6B6B' : 'white', textTransform: row.capitalize ? 'capitalize' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.value}</span>
                <ChevronForwardIcon size={16} color="#4A4A4A" />
              </button>
            ))}
          </div>

          {/* Profile completion */}
          <div className="glass animate-fade-up" style={{ borderRadius: 20, padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: 'white', letterSpacing: 1.4, textTransform: 'uppercase' }}>Profile completion</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: completionPct === 100 ? '#34C759' : '#FF6B8A' }}>{completionPct}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 9999, background: 'rgba(255,255,255,0.1)', marginTop: 12, overflow: 'hidden' }}>
              <div style={{ width: `${completionPct}%`, height: '100%', borderRadius: 9999, background: 'linear-gradient(90deg, #FF375F, #FF6B8A)', transition: 'width 0.6s ease' }} />
            </div>
          </div>

          {/* Details */}
          <div className="glass animate-fade-up" style={{ borderRadius: 20, overflow: 'hidden' }}>
            {detailsRows.map((row, i) => (
              <button
                key={row.label}
                onClick={() => router.push('/edit-profile')}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', padding: '15px 20px',
                  background: 'transparent', border: 'none', borderBottom: i < detailsRows.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  cursor: 'pointer', textAlign: 'left', gap: 12,
                }}
              >
                <span style={{ width: 108, fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: '#6B6B6B', flexShrink: 0 }}>{row.label}</span>
                <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: 'white', textTransform: row.capitalize ? 'capitalize' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.value}</span>
                <ChevronForwardIcon size={16} color="#4A4A4A" />
              </button>
            ))}
          </div>

          {/* Super Likes wallet */}
          <div
            className="glass animate-fade-up"
            style={{
              borderRadius: 20, padding: '18px 20px',
              border: superlikes.remaining > 0 ? '1px solid rgba(79,195,247,0.35)' : '1px solid rgba(255,255,255,0.08)',
              background: superlikes.remaining > 0
                ? 'linear-gradient(135deg, rgba(79,195,247,0.14), rgba(2,136,209,0.06))'
                : undefined,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg, #4FC3F7, #0288D1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: superlikes.remaining > 0 ? '0 4px 16px rgba(79,195,247,0.45)' : 'none' }}>
                <StarIcon size={20} color="white" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>Super Likes</div>
                <div style={{ fontSize: 12.5, color: '#ABABAB', marginTop: 2 }}>
                  {superlikes.dailyLimit > 0
                    ? `${superlikes.remaining} of ${superlikes.dailyLimit} left today`
                    : 'Daily Super Likes with premium'}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: superlikes.remaining > 0 ? '#4FC3F7' : '#6B6B6B', lineHeight: 1 }}>
                  {superlikes.remaining}
                </div>
                <div style={{ fontSize: 10, color: '#6B6B6B', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 3 }}>left today</div>
              </div>
            </div>

            {superlikes.dailyLimit > 0 && superlikes.remaining > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ height: 6, borderRadius: 9999, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (superlikes.remaining / superlikes.dailyLimit) * 100)}%`, height: '100%', borderRadius: 9999, background: 'linear-gradient(90deg, #4FC3F7, #0288D1)', transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 7 }}>
                  Refills at midnight · {superlikes.dailyLimit} Super Likes a day
                </div>
              </div>
            )}

            {superlikes.dailyLimit === 0 && (
              <button
                onClick={() => router.push('/premium')}
                className="lift"
                style={{
                  marginTop: 14, width: '100%', padding: '12px 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #4FC3F7, #0288D1)',
                  color: 'white', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 8px 24px rgba(79,195,247,0.4)',
                }}
              >
                <StarIcon size={16} color="white" />
                Get Super Likes — stand out to matches
              </button>
            )}
          </div>

          {/* Likes wallet */}
          <div
            className="glass animate-fade-up"
            style={{
              borderRadius: 20, padding: '18px 20px',
              border: (likes.remaining ?? 0) > 0 ? '1px solid rgba(255,55,95,0.35)' : '1px solid rgba(255,255,255,0.08)',
              background: (likes.remaining ?? 0) > 0
                ? 'linear-gradient(135deg, rgba(255,55,95,0.14), rgba(255,59,48,0.06))'
                : undefined,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg, #FF375F, #FF3B30)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: (likes.remaining ?? 0) > 0 ? '0 4px 16px rgba(255,55,95,0.45)' : 'none' }}>
                <HeartIcon size={20} color="white" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>Likes</div>
                <div style={{ fontSize: 12.5, color: '#ABABAB', marginTop: 2 }}>
                  {likes.isPremium
                    ? 'Unlimited daily likes with premium'
                    : likes.dailyLimit > 0
                      ? `${Math.max(0, likes.remaining ?? 0)} of ${likes.dailyLimit} left today`
                      : 'Daily likes with premium'}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: (likes.remaining ?? 0) > 0 ? '#FF375F' : '#6B6B6B', lineHeight: 1 }}>
                  {likes.isPremium ? <InfiniteIcon size={26} color="#FF375F" /> : Math.max(0, likes.remaining ?? 0)}
                </div>
                <div style={{ fontSize: 10, color: '#6B6B6B', fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 3 }}>{likes.isPremium ? 'unlimited' : 'left today'}</div>
              </div>
            </div>

            {!likes.isPremium && likes.dailyLimit > 0 && (likes.remaining ?? 0) > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ height: 6, borderRadius: 9999, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, ((likes.remaining ?? 0) / likes.dailyLimit) * 100)}%`, height: '100%', borderRadius: 9999, background: 'linear-gradient(90deg, #FF375F, #FF6B81)', transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 7 }}>
                  Refills at midnight · {likes.dailyLimit} Likes a day
                </div>
              </div>
            )}

            {!likes.isPremium && likes.dailyLimit > 0 && (likes.remaining ?? 0) <= 0 && (
              <button
                onClick={() => router.push('/premium')}
                className="lift"
                style={{
                  marginTop: 14, width: '100%', padding: '12px 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #FF375F, #FF3B30)',
                  color: 'white', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 8px 24px rgba(255,55,95,0.4)',
                }}
              >
                <HeartIcon size={16} color="white" />
                Get Unlimited Likes
              </button>
            )}
          </div>

          {/* Premium */}
          {profile?.isPremium ? (
            <div className="glass animate-fade-up" style={{ borderRadius: 20, padding: '16px 20px', border: '1px solid rgba(255,215,0,0.35)', background: 'linear-gradient(135deg, rgba(255,215,0,0.14), rgba(255,149,0,0.08))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg, #FFD700, #FF9500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(255,215,0,0.4)' }}>
                  <DiamondIcon size={20} color="white" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>Premium Active</div>
                  <div style={{ fontSize: 12.5, color: '#ABABAB', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {premiumPlanName}{premiumExpiry ? ` · renews ${premiumExpiry}` : ''}
                  </div>
                </div>
                <Button title="Manage" onPress={() => router.push('/premium')} variant="gradient" size="sm" />
              </div>
            </div>
          ) : (
            <button
              onClick={() => router.push('/premium')}
              className="lift animate-fade-up"
              style={{
                position: 'relative', borderRadius: 24, overflow: 'hidden', padding: 0,
                border: '1px solid rgba(255,215,0,0.4)', cursor: 'pointer', textAlign: 'left',
                background: 'linear-gradient(160deg, #1A1014 0%, #14121A 55%, #141C18 100%)',
                boxShadow: '0 14px 44px rgba(255,55,95,0.18), inset 0 0 0 1px rgba(255,215,0,0.06)',
              }}
            >
              {/* animated shimmer top border */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent 0%, #FFD700 20%, #FF375F 40%, #7C4DFF 60%, #FFD700 80%, transparent 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2.8s linear infinite' }} />
              {/* glowing blobs */}
              <div style={{ position: 'absolute', top: -70, left: -40, width: 190, height: 190, borderRadius: 9999, background: 'rgba(255,215,0,0.16)', filter: 'blur(55px)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -80, right: -30, width: 210, height: 210, borderRadius: 9999, background: 'rgba(255,55,95,0.2)', filter: 'blur(55px)', pointerEvents: 'none' }} />

              <div style={{ position: 'relative', zIndex: 1, padding: '22px 20px 18px' }}>
                {/* header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 15, background: 'linear-gradient(135deg, #FFD700, #FF9500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 24px rgba(255,215,0,0.45)', animation: 'floaty 3.5s ease-in-out infinite' }}>
                    <DiamondIcon size={24} color="white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="neon-text" style={{ fontSize: 22, fontWeight: 900, letterSpacing: 0.5, lineHeight: 1.1 }}>Go Premium</div>
                    <div style={{ fontSize: 12.5, color: '#ABABAB', marginTop: 3 }}>Unlock the full Odogwu Dating experience</div>
                  </div>
                  <div style={{ padding: '5px 10px', borderRadius: 9999, background: 'rgba(255,215,0,0.14)', border: '1px solid rgba(255,215,0,0.4)', fontSize: 10.5, fontWeight: 800, color: '#FFD700', letterSpacing: 1, whiteSpace: 'nowrap' }}>BEST VALUE</div>
                </div>

                {/* benefits */}
                <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                  {[
                    { icon: <InfiniteIcon size={18} color="#FF6B8A" />, label: 'Unlimited\nLikes' },
                    { icon: <EyeIcon size={18} color="#4FC3F7" />, label: 'See who\nlikes you' },
                    { icon: <StarIcon size={18} color="#FFD700" />, label: 'Super\nLikes' },
                  ].map((b, i) => (
                    <div key={i} style={{ flex: 1, borderRadius: 14, padding: '12px 6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {b.icon}
                      </div>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#D0D0D0', textAlign: 'center', lineHeight: '13px', whiteSpace: 'pre-line' }}>{b.label}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 15, padding: '14px 18px', background: 'linear-gradient(135deg, #FF375F, #FF3B30)', boxShadow: '0 10px 30px rgba(255,55,95,0.45)', animation: 'glowPulse 2.6s ease-in-out infinite' }}>
                  <span style={{ fontSize: 15.5, fontWeight: 800, color: 'white', letterSpacing: 0.3 }}>Subscribe now · from N4,900/mo</span>
                  <ChevronForwardIcon size={18} color="white" />
                </div>

                {/* social proof */}
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <CheckmarkCircleIcon size={13} color="#34C759" />
                  <span style={{ fontSize: 11.5, color: '#6B6B6B' }}>Trusted by 2,000+ Odogwu Dating members · Cancel anytime</span>
                </div>
              </div>
            </button>
          )}

          {/* Menu */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {menuItems.map((item, i) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="glass lift"
                style={{
                  display: 'flex', alignItems: 'center', padding: '14px 16px',
                  borderRadius: 16, gap: 13, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                  animation: `fadeUp 0.45s ease both`, animationDelay: `${i * 0.05}s`,
                }}
              >
                <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: 'white' }}>{item.label}</span>
                <ChevronForwardIcon size={16} color="#4A4A4A" />
              </button>
            ))}
          </div>

          <Button title="Logout" onPress={handleLogout} variant="outline" size="md" style={{ width: 'fit-content', alignSelf: 'center', marginTop: 8 }} />
        </div>
        <TabBar />
      </GradientBackground>
    </DesktopLayout>
  );
}
