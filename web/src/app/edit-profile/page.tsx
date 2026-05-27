'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CameraIcon, CloseCircleIcon, PersonIcon, PencilIcon, LocationIcon, CalendarIcon, TransgenderIcon, HeartIcon } from '@/components/Icons';
import Button from '@/components/Button';
import GradientBackground from '@/components/GradientBackground';
import TabBar from '@/components/TabBar';
import { useAuth } from '@/store/AuthContext';
import { userService, storageService } from '@/lib/appwrite/services';
import { account } from '@/lib/appwrite/config';

const GENDERS = ['male', 'female', 'non-binary', 'other'] as const;
const INTERESTS = ['male', 'female', 'both', 'non-binary'] as const;

function OptionPicker({ label, options, value, onChange, onClose }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#1A1A1A', borderRadius: '20px 20px 0 0', padding: '24px 24px 40px' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 16, textAlign: 'center' }}>{label}</h3>
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => { onChange(opt); onClose(); }}
            style={{
              width: '100%', padding: '14px 16px', background: value === opt ? 'rgba(255,55,95,0.15)' : 'transparent',
              border: `1px solid ${value === opt ? '#FF375F' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 12, color: 'white', fontSize: 16, cursor: 'pointer', textAlign: 'center', marginBottom: 8, textTransform: 'capitalize',
              fontWeight: value === opt ? 700 : 400,
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(profile?.fullName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [city, setCity] = useState(profile?.city || '');
  const [dob, setDob] = useState(profile?.dateOfBirth || '');
  const [gender, setGender] = useState(profile?.gender || '');
  const [interest, setInterest] = useState(profile?.interestedIn || '');
  const [photos, setPhotos] = useState<string[]>(profile?.photos || []);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [jwt, setJwt] = useState<string>('');
  const [showGender, setShowGender] = useState(false);
  const [showInterest, setShowInterest] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile || !account) return;
    setName(profile.fullName || '');
    setBio(profile.bio || '');
    setCity(profile.city || '');
    setDob(profile.dateOfBirth || '');
    setGender(profile.gender || '');
    setInterest(profile.interestedIn || '');
    const p = profile.photos || [];
    setPhotos(p);
    Promise.all(p.map(id => storageService.ensurePublicRead(id).catch(() => {}))).catch(() => {});
    account.createJWT()
      .then(res => {
        setJwt(res.jwt);
        setPhotoUrls(p.map(id => storageService.getFilePreview(id)));
      })
      .catch(() => setPhotoUrls(p.map(id => storageService.getFilePreview(id))));
  }, [profile]);

  const handlePhotoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const file = files[0];
    const result = await storageService.uploadFile(file);
    const newPhotos = [...photos, result.$id];
    setPhotos(newPhotos);
    setPhotoUrls([...photoUrls, storageService.getFilePreview(result.$id)]);
    const user = await account!.get();
    await userService.updateProfile(user.$id, { photos: newPhotos } as any);
    e.target.value = '';
  };

  const removePhoto = async (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
    const user = await account!.get();
    await userService.updateProfile(user.$id, { photos: newPhotos } as any);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const user = await account!.get();
      await userService.updateProfile(user.$id, {
        fullName: name,
        bio,
        city,
        dateOfBirth: dob,
        gender,
        interestedIn: interest,
      } as any);
      await refreshUser();
      router.back();
    } catch (err: any) {
      setError(err?.message || 'Failed to save');
    }
    setSaving(false);
  };

  return (
    <GradientBackground style={{ minHeight: '100vh', paddingBottom: '85px', paddingTop: '24px', overflowY: 'auto' }}>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoPick} style={{ display: 'none' }} />

      <div style={{ padding: '60px 24px 24px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#FF375F', fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: '8px 0', marginBottom: 8 }}>
          ← Back
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', margin: '0 0 24px' }}>Edit Profile</h1>

        <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          {Array.from({ length: 6 }).map((_, i) => {
            const hasPhoto = i < photos.length;
            return (
              <button
                key={i}
                onClick={() => {
                  if (hasPhoto) removePhoto(i);
                  else fileInputRef.current?.click();
                }}
                style={{
                  width: 90, height: 110, borderRadius: 12,
                  backgroundColor: '#1A1A1A', border: `1.5px dashed ${hasPhoto ? '#FF375F' : '#2A2A2A'}`,
                  overflow: 'hidden', cursor: 'pointer', position: 'relative', padding: 0,
                }}
              >
                {hasPhoto ? (
                  <>
                    <img src={photoUrls[i] || storageService.getFilePreview(photos[i])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 2, display: 'flex' }}>
                      <CloseCircleIcon size={18} color="white" />
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 4 }}>
                    {i === 0 ? <CameraIcon size={22} color="#6B6B6B" /> : <CameraIcon size={18} color="#6B6B6B" />}
                    <span style={{ color: '#6B6B6B', fontSize: 10, fontWeight: 600 }}>{i === 0 ? 'Add' : `${i + 1}`}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 12, overflow: 'hidden', marginBottom: 28 }}>
          <FieldRow icon={<PersonIcon size={20} color="#ABABAB" />} label="Name">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={{ flex: 1, background: 'none', border: 'none', color: 'white', fontSize: 15, textAlign: 'right', outline: 'none', padding: '14px 0' }} />
          </FieldRow>
          <FieldRow icon={<PencilIcon size={20} color="#ABABAB" />} label="Bio">
            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Write something about yourself..." rows={2} style={{ flex: 1, background: 'none', border: 'none', color: 'white', fontSize: 15, textAlign: 'right', outline: 'none', padding: '14px 0', resize: 'none' }} />
          </FieldRow>
          <FieldRow icon={<TransgenderIcon size={20} color="#ABABAB" />} label="Gender" onClick={() => setShowGender(true)}>
            <span style={{ color: gender ? 'white' : '#6B6B6B', fontSize: 15, textTransform: 'capitalize' }}>{gender || 'Select'}</span>
          </FieldRow>
          <FieldRow icon={<HeartIcon size={20} color="#ABABAB" />} label="Show Me" onClick={() => setShowInterest(true)}>
            <span style={{ color: interest ? 'white' : '#6B6B6B', fontSize: 15, textTransform: 'capitalize' }}>{interest || 'Select'}</span>
          </FieldRow>
          <FieldRow icon={<LocationIcon size={20} color="#ABABAB" />} label="Location">
            <input value={city} onChange={e => setCity(e.target.value)} placeholder="City" style={{ flex: 1, background: 'none', border: 'none', color: 'white', fontSize: 15, textAlign: 'right', outline: 'none', padding: '14px 0' }} />
          </FieldRow>
          <FieldRow icon={<CalendarIcon size={20} color="#ABABAB" />} label="Date of Birth">
            <input value={dob} onChange={e => setDob(e.target.value)} placeholder="YYYY-MM-DD" type="date" style={{ flex: 1, background: 'none', border: 'none', color: 'white', fontSize: 15, textAlign: 'right', outline: 'none', padding: '14px 0' }} />
          </FieldRow>
        </div>

        {error && <p style={{ color: '#FF3B30', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</p>}

        <Button title={saving ? 'Saving...' : 'Save Changes'} onPress={handleSave} variant="gradient" size="lg" style={{ width: '100%' }} disabled={saving} loading={saving} />
      </div>

      {showGender && <OptionPicker label="Gender" options={GENDERS} value={gender} onChange={setGender} onClose={() => setShowGender(false)} />}
      {showInterest && <OptionPicker label="Show Me" options={INTERESTS} value={interest} onChange={setInterest} onClose={() => setShowInterest(false)} />}

      <TabBar />
    </GradientBackground>
  );
}

function FieldRow({ icon, label, children, onClick }: { icon: React.ReactNode; label: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12,
      backgroundColor: 'rgba(255,255,255,0.08)', cursor: onClick ? 'pointer' : 'default',
      minHeight: 52,
    }}>
      {icon}
      <span style={{ fontSize: 14, color: '#ABABAB', width: 100 }}>{label}</span>
      {children}
    </div>
  );
}
