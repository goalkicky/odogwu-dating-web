'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  DiamondIcon, SettingsIcon, BellIcon, ShieldIcon, HelpIcon,
  ChevronForwardIcon, EyeIcon, CallIcon, PencilIcon, CheckmarkIcon,
  CameraIcon, PlusIcon, LocationIcon,
} from '@/components/Icons';
import GradientBackground from '@/components/GradientBackground';
import Button from '@/components/Button';
import TabBar from '@/components/TabBar';
import DesktopLayout from '@/components/DesktopLayout';
import { useAuth } from '@/store/AuthContext';
import { storageService } from '@/lib/cloudflare/services';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, user, logout } = useAuth();

  const photos = profile?.photos || [];
  const photoUrls = photos.map((id: string) => storageService.getFilePreview(id));
  const [photoIndex, setPhotoIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const name = profile?.fullName || user?.name || 'User';
  const age = profile?.age;
  const displayName = age ? `${name}, ${age}` : name;

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.clientWidth === 0) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    if (idx !== photoIndex) setPhotoIndex(idx);
  };

  const completionFields = [
    Boolean(profile?.photos?.length),
    Boolean(profile?.bio),
    Boolean(profile?.age || profile?.dateOfBirth),
    Boolean(profile?.gender),
    Boolean(profile?.interestedIn),
    Boolean(profile?.city),
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
    { icon: <SettingsIcon size={20} color="#D0D0D0" />, label: 'Settings', onClick: () => router.push('/settings') },
    { icon: <BellIcon size={20} color="#FFD700" />, label: 'Notifications', onClick: () => router.push('/notifications') },
    { icon: <ShieldIcon size={20} color="#7C4DFF" />, label: 'Privacy', onClick: () => router.push('/privacy') },
    { icon: <HelpIcon size={20} color="#ABABAB" />, label: 'Help & Support', onClick: () => router.push('/faq') },
  ];

  return (
    <DesktopLayout>
      <GradientBackground style={{ minHeight: '100vh', padding: '24px 16px 110px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Photo carousel — Tinder-style hero */}
          <div
            ref={scrollRef}
            onScroll={onScroll}
            className="glass animate-fade-up"
            style={{
              position: 'relative',
              borderRadius: 26,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'flex-start',
              scrollSnapType: 'x mandatory',
              overscrollBehaviorX: 'contain',
            }}
          >
            {photoUrls.length > 0 ? (
              photoUrls.map((src, i) => (
                <div key={i} style={{ position: 'relative', width: '100%', flex: '0 0 100%', scrollSnapAlign: 'start' }}>
                  <img
                    src={src}
                    alt=""
                    style={{ width: '100%', height: 'auto', maxHeight: '78vh', objectFit: 'contain', display: 'block', background: '#000' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 34%, rgba(0,0,0,0.82) 100%)' }} />
                  {i === photoIndex && (
                    <div style={{ position: 'absolute', left: 22, right: 22, bottom: 26 }}>
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
                </div>
              ))
            ) : (
              <button onClick={() => router.push('/edit-profile')} style={{ width: '100%', height: 420, background: 'linear-gradient(160deg, rgba(255,55,95,0.14), rgba(108,99,255,0.1)), rgba(255,255,255,0.02)', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#ABABAB' }}>
                <div style={{ width: 64, height: 64, borderRadius: 9999, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PlusIcon size={30} color="white" />
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{name}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Add your photos</span>
              </button>
            )}

            {/* Page dots */}
            {photoUrls.length > 1 && (
              <div style={{ position: 'absolute', top: 18, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6, zIndex: 3 }}>
                {photoUrls.map((_, i) => (
                  <span key={i} style={{ width: photoIndex === i ? 20 : 7, height: 7, borderRadius: 9999, background: photoIndex === i ? 'white' : 'rgba(255,255,255,0.4)', transition: 'all 0.25s ease' }} />
                ))}
              </div>
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

          {/* Premium CTA */}
          {!profile?.isPremium && (
            <button onClick={() => router.push('/premium')} className="glass lift" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 20px', borderRadius: 20, border: '1px solid rgba(255,215,0,0.25)', background: 'linear-gradient(135deg, rgba(255,215,0,0.12), rgba(255,149,0,0.08))', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg, #FFD700, #FF9500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(255,215,0,0.4)' }}>
                <DiamondIcon size={20} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>Go Premium</div>
                <div style={{ fontSize: 12.5, color: '#ABABAB', marginTop: 2 }}>Unlimited likes, rewind & more</div>
              </div>
              <ChevronForwardIcon size={18} color="#FFD700" />
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
