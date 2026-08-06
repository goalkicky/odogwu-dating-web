'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DiamondIcon, SettingsIcon, BellIcon, ShieldIcon, HelpIcon, ChevronForwardIcon, EyeIcon, CallIcon, PencilIcon, CheckmarkIcon } from '@/components/Icons';
import GradientBackground from '@/components/GradientBackground';
import Button from '@/components/Button';
import TabBar from '@/components/TabBar';
import DesktopLayout from '@/components/DesktopLayout';
import { useAuth } from '@/store/AuthContext';
import { storageService } from '@/lib/appwrite/services';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, user, logout } = useAuth();
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const photoId = profile?.photos?.[0];

  useEffect(() => {
    if (!photoId) return;
    setPhotoUrl(storageService.getFilePreview(photoId));
  }, [photoId]);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
      router.push('/login');
    }
  };

  const menuItems = [
    { icon: <PencilIcon size={22} color="#FF6B8A" />, label: 'Edit Profile', onClick: () => router.push('/edit-profile') },
    { icon: <EyeIcon size={22} color="#4FC3F7" />, label: 'Who Likes You', onClick: () => router.push('/likes') },
    { icon: <CallIcon size={22} color="#34C759" />, label: 'Call Log', onClick: () => router.push('/call-logs') },
    { icon: <SettingsIcon size={22} color="#D0D0D0" />, label: 'Settings', onClick: () => router.push('/settings') },
    { icon: <BellIcon size={22} color="#FFD700" />, label: 'Notifications', onClick: () => router.push('/notifications') },
    { icon: <ShieldIcon size={22} color="#7C4DFF" />, label: 'Privacy', onClick: () => router.push('/privacy') },
    { icon: <HelpIcon size={22} color="#ABABAB" />, label: 'Help & Support', onClick: () => router.push('/faq') },
  ];

  return (
    <DesktopLayout>
      <GradientBackground style={{ minHeight: '100vh', padding: '24px 16px 110px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Hero */}
        <div className="glass animate-fade-up" style={{ borderRadius: 26, padding: '28px 24px', background: 'linear-gradient(135deg, rgba(255,55,95,0.1), rgba(124,77,255,0.08)), rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: 22 }}>
          <div className="grad-ring" style={{ width: 108, height: 108, display: 'flex', flexShrink: 0, boxShadow: '0 8px 32px rgba(255,55,95,0.35)' }}>
            <div style={{ width: 102, height: 102, borderRadius: '50%', backgroundColor: '#16161C', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {profile?.photos?.[0] && photoUrl ? (
                <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setPhotoUrl('')} />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ABABAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              )}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white', margin: 0 }}>{profile?.fullName || user?.name || 'User'}</h1>
              {profile?.verified && (
                <div style={{ width: 22, height: 22, borderRadius: 9999, background: 'linear-gradient(135deg, #4FC3F7, #0288D1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(79,195,247,0.6)' }}>
                  <CheckmarkIcon size={13} color="white" />
                </div>
              )}
            </div>
            <p style={{ fontSize: 13.5, color: '#ABABAB', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {profile?.isPremium ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 14px', borderRadius: 9999, background: 'linear-gradient(135deg, #FFD700, #FF9500)', boxShadow: '0 4px 16px rgba(255,215,0,0.4)', width: 'fit-content' }}>
                  <DiamondIcon size={13} color="white" />
                  <span style={{ color: '#1A1A1A', fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>PREMIUM</span>
                </div>
              ) : (
                <button onClick={() => router.push('/premium')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 14px', borderRadius: 9999, border: '1px solid rgba(255,215,0,0.4)', background: 'rgba(255,215,0,0.08)', cursor: 'pointer', width: 'fit-content' }}>
                  <DiamondIcon size={13} color="#FFD700" />
                  <span style={{ color: '#FFD700', fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>GO PREMIUM</span>
                </button>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 14px', borderRadius: 9999, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)' }}>
                <span style={{ width: 7, height: 7, borderRadius: 9999, background: '#34C759', boxShadow: '0 0 8px #34C759' }} />
                <span style={{ color: '#D0D0D0', fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>ONLINE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="glass animate-fade-up" style={{ borderRadius: 20, overflow: 'hidden', display: 'flex' }}>
          {[
            { label: 'Age', value: profile?.age || '-' },
            { label: 'Gender', value: profile?.gender || '-', capitalize: true },
            { label: 'Location', value: profile?.city || '-' },
          ].map((item, i, arr) => (
            <React.Fragment key={item.label}>
              <div style={{ flex: 1, textAlign: 'center', padding: '18px 8px' }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'white', textTransform: item.capitalize ? 'capitalize' : 'none' }}>{item.value}</span>
                <p style={{ fontSize: 11.5, color: '#6B6B6B', margin: '3px 0 0', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>{item.label}</p>
              </div>
              {i < arr.length - 1 && <div style={{ width: 1, alignSelf: 'stretch', margin: '14px 0', backgroundColor: 'rgba(255,255,255,0.08)' }} />}
            </React.Fragment>
          ))}
        </div>

        {/* About */}
        <div className="glass animate-fade-up" style={{ borderRadius: 20, padding: '20px 22px' }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: 0, letterSpacing: 0.5 }}>About</h2>
          <p style={{ fontSize: 14.5, color: '#ABABAB', lineHeight: '23px', margin: '10px 0 0' }}>{profile?.bio || 'No bio yet'}</p>
        </div>

        {/* Menu */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={item.onClick}
              className="glass lift"
              style={{
                display: 'flex', alignItems: 'center', padding: '15px 16px',
                borderRadius: 16, gap: 12, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                animation: `fadeUp 0.45s ease both`, animationDelay: `${i * 0.05}s`,
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.icon}
              </div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'white' }}>{item.label}</span>
              <ChevronForwardIcon size={16} color="#4A4A4A" />
            </button>
          ))}
        </div>

        <Button title="Logout" onPress={handleLogout} variant="outline" size="md" style={{ width: 'fit-content', alignSelf: 'center', marginTop: 6 }} />
      </div>
      <TabBar />
      </GradientBackground>
    </DesktopLayout>
  );
}
