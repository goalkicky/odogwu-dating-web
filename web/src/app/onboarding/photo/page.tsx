'use client';
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CameraIcon, ImagesIcon, CloseCircleIcon } from '@/components/Icons';
import Button from '@/components/Button';
import OnboardingProgress from '@/components/OnboardingProgress';
import { useOnboarding } from '@/store/OnboardingContext';
import { useAuth } from '@/store/AuthContext';

const MAX_PHOTOS = 6;

export default function PhotoPage() {
  const router = useRouter();
  const { data, updateData } = useOnboarding();
  const { setOnboarded } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const newPhotos = [...data.photos];
    for (let i = 0; i < files.length && newPhotos.length < MAX_PHOTOS; i++) {
      newPhotos.push(URL.createObjectURL(files[i]));
    }
    updateData({ photos: newPhotos });
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    const newPhotos = data.photos.filter((_, i) => i !== index);
    updateData({ photos: newPhotos });
  };

  const handleComplete = async () => {
    if (data.photos.length === 0) {
      alert('Please upload at least one photo');
      return;
    }
    setUploading(true);
    try {
      const { userService, storageService } = await import('@/lib/appwrite/services');
      const { account: acct } = await import('@/lib/appwrite/config');
      if (!acct) throw new Error('Appwrite not configured');
      const user = await acct.get();
      const uploadedUrls = await Promise.all(
        data.photos.map((uri) => storageService.uploadPhoto(uri).then((f: any) => f.$id))
      );
      const age = data.dateOfBirth
        ? new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear()
        : 0;
      await userService.createProfile(user.$id, {
        email: user.email,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender!,
        interestedIn: data.interestedIn!,
        photos: uploadedUrls,
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        bio: data.bio,
        age,
        isPremium: false,
        verified: false,
      } as any);
      setOnboarded();
      router.push('/discover');
    } catch (err) {
      alert('Failed to save profile. Please try again.');
    }
    setUploading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0D0D0D, #0D0A1A, #0D0D0D)', display: 'flex', flexDirection: 'column', padding: '60px 24px 0' }}>
      <OnboardingProgress currentStep={5} totalSteps={6} />

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #AF52DE, #FF375F)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CameraIcon size={36} color="white" />
        </div>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', textAlign: 'center', marginBottom: 8 }}>Add your photos</h1>
      <p style={{ fontSize: 16, color: '#ABABAB', textAlign: 'center', marginBottom: 32 }}>Upload at least one photo to continue</p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilePick}
        style={{ display: 'none' }}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {Array.from({ length: MAX_PHOTOS }).map((_, i) => {
          const hasPhoto = i < data.photos.length;
          return (
            <button
              key={i}
              onClick={() => {
                if (hasPhoto) removePhoto(i);
                else fileInputRef.current?.click();
              }}
              style={{
                width: 100,
                height: 130,
                borderRadius: 12,
                backgroundColor: '#1A1A1A',
                border: `1.5px dashed ${hasPhoto ? '#FF375F' : '#2A2A2A'}`,
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                padding: 0,
              }}
            >
              {hasPhoto ? (
                <>
                  <img src={data.photos[i]} alt="Upload" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 2, display: 'flex' }}>
                    <CloseCircleIcon size={22} color="white" />
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  {i === 0 ? <CameraIcon size={24} color="#6B6B6B" /> : <ImagesIcon size={24} color="#6B6B6B" />}
                  <span style={{ color: '#6B6B6B', fontSize: 12, fontWeight: 600 }}>{i === 0 ? 'Selfie' : `${i + 1}`}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <p style={{ color: '#6B6B6B', fontSize: 12, textAlign: 'center', marginTop: 12 }}>Tap to add • Tap again to remove</p>

      <div style={{ flex: 1 }} />
      <Button
        title={uploading ? 'Saving...' : data.photos.length === 0 ? 'Add a photo first' : 'Complete Profile'}
        onPress={handleComplete}
        variant="gradient"
        size="lg"
        style={{ width: '100%', marginBottom: 40 }}
        disabled={data.photos.length === 0 || uploading}
        loading={uploading}
      />
    </div>
  );
}
