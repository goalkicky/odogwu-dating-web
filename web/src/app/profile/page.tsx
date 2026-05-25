'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DiamondIcon, SettingsIcon, BellIcon, ShieldIcon, HelpIcon, ChevronForwardIcon, EyeIcon } from '@/components/Icons';
import GradientBackground from '@/components/GradientBackground';
import Button from '@/components/Button';
import TabBar from '@/components/TabBar';
import { useAuth } from '@/store/AuthContext';
import { storageService } from '@/lib/appwrite/services';
import { account } from '@/lib/appwrite/config';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, user, logout } = useAuth();
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const photoId = profile?.photos?.[0];

  useEffect(() => {
    if (!photoId || !account) return;
    setPhotoUrl('');
    storageService.ensurePublicRead(photoId).catch(() => {});
    account.createJWT()
      .then(res => setPhotoUrl(storageService.getFilePreview(photoId, res.jwt)))
      .catch(() => setPhotoUrl(storageService.getFilePreview(photoId)));
  }, [photoId]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      router.push('/login');
    }
  };

  return (
    <GradientBackground style={{ minHeight: '100vh', paddingBottom: '85px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80, paddingBottom: 24 }}>
        <div style={{ width: 120, height: 120, borderRadius: '50%', padding: 4, background: 'linear-gradient(135deg, #FF3B30, #FF375F)', marginBottom: 16 }}>
          <div style={{ width: 112, height: 112, borderRadius: '50%', backgroundColor: '#1A1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {profile?.photos?.[0] && photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setPhotoUrl('')}
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ABABAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            )}
          </div>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: 0 }}>{profile?.fullName || user?.name || 'User'}</h1>
        <p style={{ fontSize: 14, color: '#ABABAB', marginTop: 4 }}>{user?.email || ''}</p>
        {profile?.isPremium && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 9999, background: 'linear-gradient(135deg, #FFD700, #FFA500)', marginTop: 10 }}>
            <DiamondIcon size={12} color="white" />
            <span style={{ color: 'white', fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>PREMIUM</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 24px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, margin: '0 24px' }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'white', textTransform: 'capitalize' }}>{profile?.age || '-'}</span>
          <p style={{ fontSize: 12, color: '#6B6B6B', margin: '2px 0 0' }}>Age</p>
        </div>
        <div style={{ width: 1, height: 30, backgroundColor: '#2A2A2A' }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'white', textTransform: 'capitalize' }}>{profile?.gender || '-'}</span>
          <p style={{ fontSize: 12, color: '#6B6B6B', margin: '2px 0 0' }}>Gender</p>
        </div>
        <div style={{ width: 1, height: 30, backgroundColor: '#2A2A2A' }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'white', textTransform: 'capitalize' }}>{profile?.city || '-'}</span>
          <p style={{ fontSize: 12, color: '#6B6B6B', margin: '2px 0 0' }}>Location</p>
        </div>
      </div>

      <div style={{ padding: '24px 24px 0' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 8 }}>About</h2>
        <p style={{ fontSize: 15, color: '#ABABAB', lineHeight: '22px' }}>{profile?.bio || 'No bio yet'}</p>
      </div>

      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { icon: <EyeIcon size={22} color="#ABABAB" />, label: 'Who Likes You', onClick: () => router.push('/likes') },
            { icon: <SettingsIcon size={22} color="#ABABAB" />, label: 'Settings', onClick: () => router.push('/settings') },
            { icon: <BellIcon size={22} color="#ABABAB" />, label: 'Notifications', onClick: () => router.push('/notifications') },
            { icon: <ShieldIcon size={22} color="#ABABAB" />, label: 'Privacy', onClick: () => router.push('/privacy') },
            { icon: <HelpIcon size={22} color="#ABABAB" />, label: 'Help & Support', onClick: () => router.push('/faq') },
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.onClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 16px',
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderRadius: 12,
                gap: 12,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              {item.icon}
              <span style={{ flex: 1, fontSize: 15, color: 'white' }}>{item.label}</span>
              <ChevronForwardIcon size={18} color="#6B6B6B" />
            </button>
          ))}
        </div>
      </div>

      <Button
        title="Logout"
        onPress={handleLogout}
        variant="outline"
        size="md"
        style={{ margin: '32px 24px 0' }}
      />

      <TabBar />
    </GradientBackground>
  );
}
