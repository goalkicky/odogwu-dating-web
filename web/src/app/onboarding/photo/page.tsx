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
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const filesRef = useRef<File[]>([]);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const newUrls = [...data.photos];
    const newFiles = [...filesRef.current];
    for (let i = 0; i < files.length && newUrls.length < MAX_PHOTOS; i++) {
      newUrls.push(URL.createObjectURL(files[i]));
      newFiles.push(files[i]);
    }
    updateData({ photos: newUrls });
    filesRef.current = newFiles;
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    const newUrls = data.photos.filter((_, i) => i !== index);
    const newFiles = filesRef.current.filter((_, i) => i !== index);
    updateData({ photos: newUrls });
    filesRef.current = newFiles;
  };

  const handleComplete = async () => {
    setError('');
    if (data.photos.length === 0) {
      setError('Please upload at least one photo');
      return;
    }
    setUploading(true);
    try {
      const { userService, storageService } = await import('@/lib/appwrite/services');
      const { account: acct, APPWRITE_CONFIG } = await import('@/lib/appwrite/config');
      if (!acct) throw new Error('Appwrite not configured');
      if (!APPWRITE_CONFIG.databaseId) throw new Error('Missing NEXT_PUBLIC_APPWRITE_DATABASE_ID');
      if (!APPWRITE_CONFIG.storageBucketId) throw new Error('Missing NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID');
      const user = await acct.get();
      const files = filesRef.current;
      const uploadedIds = await Promise.all(
        files.map((file) => storageService.uploadFile(file))
      );
      const age = data.dateOfBirth
        ? new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear()
        : 0;
      try {
        await userService.createProfile(user.$id, {
          email: user.email,
          fullName: data.fullName,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender!,
          interestedIn: data.interestedIn!,
          photos: uploadedIds,
          latitude: data.latitude,
          longitude: data.longitude,
          city: data.city,
          bio: data.bio,
          age,
          isPremium: false,
          verified: false,
        } as any);
      } catch (profileErr: any) {
        if (profileErr?.message?.includes('already exists') || profileErr?.type === 'document_already_exists') {
          await userService.updateProfile(user.$id, {
            photos: uploadedIds,
            isPremium: false,
            verified: false,
          } as any);
        } else {
          throw profileErr;
        }
      }
      setOnboarded();
      router.push('/discover');
    } catch (err: any) {
      console.error('Profile save error:', err);
      const msg = err?.message || err?.type || '';
      if (msg.includes('Missing')) {
        setError(msg + '. Add it in Vercel dashboard → Settings → Environment Variables.');
      } else if (msg.includes('Appwrite not initialized')) {
        setError('Appwrite is not configured. Check your environment variables.');
      } else if (msg.includes('storage') || msg.includes('bucket')) {
        setError('Failed to upload photos. Check Appwrite storage bucket configuration.');
      } else if (msg.includes('database') || msg.includes('collection') || msg.includes('document')) {
        setError('Failed to save profile. Check Appwrite database configuration.');
      } else if (msg.includes('missing scopes') || msg.includes('unauthorized') || msg.includes('403')) {
        setError('Authentication error. Please try logging in again.');
      } else {
        setError(`Failed to save profile: ${msg || 'Please try again.'}`);
      }
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

      {error && <p style={{ color: '#FF3B30', fontSize: 13, textAlign: 'center', marginTop: 12, padding: '8px 12px', background: 'rgba(255,59,48,0.1)', borderRadius: 8 }}>{error}</p>}

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
