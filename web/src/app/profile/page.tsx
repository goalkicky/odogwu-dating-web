'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DiamondIcon, SettingsIcon, BellIcon, ShieldIcon, HelpIcon, ChevronForwardIcon, EyeIcon, CallIcon } from '@/components/Icons';
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

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      router.push('/login');
    }
  };

  const menuItems = [
    { icon: <EyeIcon size={22} color="#ABABAB" />, label: 'Who Likes You', onClick: () => router.push('/likes') },
    { icon: <CallIcon size={22} color="#ABABAB" />, label: 'Call Log', onClick: () => router.push('/call-logs') },
    { icon: <SettingsIcon size={22} color="#ABABAB" />, label: 'Settings', onClick: () => router.push('/settings') },
    { icon: <BellIcon size={22} color="#ABABAB" />, label: 'Notifications', onClick: () => router.push('/notifications') },
    { icon: <ShieldIcon size={22} color="#ABABAB" />, label: 'Privacy', onClick: () => router.push('/privacy') },
    { icon: <HelpIcon size={22} color="#ABABAB" />, label: 'Help & Support', onClick: () => router.push('/faq') },
  ];

  return (
    <DesktopLayout>
      <GradientBackground style={{ minHeight: '100vh', paddingBottom: '85px', paddingTop: '24px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ width: 96, height: 96, borderRadius: '50%', padding: 3, background: 'linear-gradient(135deg, #FF3B30, #FF375F)', flexShrink: 0 }}>
            <div style={{ width: 90, height: 90, borderRadius: '50%', backgroundColor: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {profile?.photos?.[0] && photoUrl ? (
                <img src={photoUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setPhotoUrl('')} />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ABABAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              )}
            </div>
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: 0 }}>{profile?.fullName || user?.name || 'User'}</h1>
            <p style={{ fontSize: 14, color: '#ABABAB', marginTop: 4 }}>{user?.email || ''}</p>
            {profile?.isPremium && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 9999, background: 'linear-gradient(135deg, #FFD700, #FFA500)', marginTop: 8, width: 'fit-content' }}>
                <DiamondIcon size={12} color="white" />
                <span style={{ color: 'white', fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>PREMIUM</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 0, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
          {[
            { label: 'Age', value: profile?.age || '-' },
            { label: 'Gender', value: profile?.gender || '-', capitalize: true },
            { label: 'Location', value: profile?.city || '-' },
          ].map((item, i, arr) => (
            <React.Fragment key={item.label}>
              <div style={{ flex: 1, textAlign: 'center', padding: '16px 8px' }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'white', textTransform: item.capitalize ? 'capitalize' : 'none' }}>{item.value}</span>
                <p style={{ fontSize: 12, color: '#6B6B6B', margin: '2px 0 0' }}>{item.label}</p>
              </div>
              {i < arr.length - 1 && <div style={{ width: 1, backgroundColor: '#2A2A2A' }} />}
            </React.Fragment>
          ))}
        </div>

        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 8 }}>About</h2>
          <p style={{ fontSize: 15, color: '#ABABAB', lineHeight: '24px', margin: 0, padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{profile?.bio || 'No bio yet'}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {menuItems.map((item, i) => (
            <button
              key={i}
              onClick={item.onClick}
              style={{
                display: 'flex', alignItems: 'center', padding: '14px 16px',
                backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, gap: 12,
                border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
              }}
            >
              {item.icon}
              <span style={{ flex: 1, fontSize: 14, color: 'white' }}>{item.label}</span>
              <ChevronForwardIcon size={16} color="#6B6B6B" />
            </button>
          ))}
        </div>

        <Button title="Logout" onPress={handleLogout} variant="outline" size="md" style={{ width: 'fit-content', alignSelf: 'center' }} />
      </div>
      <TabBar />
      </GradientBackground>
    </DesktopLayout>
  );
}
