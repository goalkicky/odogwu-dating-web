'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronBackIcon, PlusIcon, CloseCircleIcon, ChevronForwardIcon } from '@/components/Icons';
import Button from '@/components/Button';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/store/AuthContext';
import { authService, userService, storageService } from '@/lib/cloudflare/services';
import { account } from '@/lib/cloudflare/config';
import { INTEREST_CATEGORIES } from '@/lib/interests';

const GENDERS = ['male', 'female', 'non-binary', 'other'] as const;
const INTERESTS = ['male', 'female', 'both', 'non-binary'] as const;
const BIO_MAX = 500;
const MAX_INTERESTS = 20;

const HEIGHT_OPTIONS = (() => {
  const opts: string[] = [];
  for (let inches = 48; inches <= 84; inches++) {
    const ft = Math.floor(inches / 12);
    const inch = inches % 12;
    opts.push(`${ft}'${inch}"`);
  }
  return opts;
})();
const RELATIONSHIP_GOALS = ['Flirting', 'Chatting', 'Serious Dating', 'Marriage'] as const;

function calcAge(dob: string): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
  return age;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: '#8A8A8F', margin: '28px 2px 12px' }}>
      {children}
    </h2>
  );
}

function OptionPicker({ label, options, value, onChange, onClose }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '80vh', background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 24px 40px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#151515', marginBottom: 16, textAlign: 'center', flexShrink: 0 }}>{label}</h3>
        <div style={{ overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); onClose(); }}
              style={{
                width: '100%', padding: '14px 16px', background: value === opt ? 'rgba(255,55,95,0.15)' : 'transparent',
                border: `1px solid ${value === opt ? '#FF375F' : '#EDEDF1'}`,
                borderRadius: 12, color: '#151515', fontSize: 16, cursor: 'pointer', textAlign: 'center', marginBottom: 8, textTransform: 'capitalize',
                fontWeight: value === opt ? 700 : 400,
              }}
            >
              {opt}
            </button>
          ))}
        </div>
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
  const [interests, setInterests] = useState<string[]>(profile?.interests || []);
  const [height, setHeight] = useState(profile?.height || '');
  const [weight, setWeight] = useState(profile?.weight || '');
  const [relationshipGoals, setRelationshipGoals] = useState(profile?.relationshipGoals || '');
  const [photos, setPhotos] = useState<string[]>(profile?.photos || []);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [showGender, setShowGender] = useState(false);
  const [showInterest, setShowInterest] = useState(false);
  const [showHeight, setShowHeight] = useState(false);
  const [showRelationshipGoals, setShowRelationshipGoals] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [interestNote, setInterestNote] = useState('');
  const age = calcAge(dob);
  const ageError = !!dob && age !== null && age < 18;

  useEffect(() => {
    if (!profile || !account) return;
    setName(profile.fullName || '');
    setBio(profile.bio || '');
    setCity(profile.city || '');
    setDob(profile.dateOfBirth || '');
    setGender(profile.gender || '');
    setInterest(profile.interestedIn || '');
    setInterests(profile.interests || []);
    setHeight(profile.height || '');
    setWeight(profile.weight || '');
    setRelationshipGoals(profile.relationshipGoals || '');
    const p = profile.photos || [];
    setPhotos(p);
    Promise.all(p.map(id => storageService.ensurePublicRead(id).catch(() => {}))).catch(() => {});
    authService.createJWT()
      .then(() => setPhotoUrls(p.map(id => storageService.getFilePreview(id))))
      .catch(() => setPhotoUrls(p.map(id => storageService.getFilePreview(id))));
  }, [profile]);

  const handlePhotoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const file = files[0];
    const result = await storageService.uploadFile(file, 400 * 1024);
    const newPhotos = [...photos, result.$id];
    setPhotos(newPhotos);
    setPhotoUrls([...photoUrls, storageService.getFilePreview(result.$id)]);
    const user = await account!.get();
    await userService.updateProfile(user.$id, { photos: newPhotos } as any);
    e.target.value = '';
  };

  const removePhoto = async (index: number) => {
    if (!window.confirm('Remove this photo?')) return;
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
    const user = await account!.get();
    await userService.updateProfile(user.$id, { photos: newPhotos } as any);
  };

  const movePhoto = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    [next[index], next[target]] = [next[target], next[index]];
    setPhotos(next);
    setPhotoUrls(prev => {
      if (prev.length !== photos.length) return next.map(id => storageService.getFilePreview(id));
      const n = [...prev];
      [n[index], n[target]] = [n[target], n[index]];
      return n;
    });
    const user = await account!.get();
    await userService.updateProfile(user.$id, { photos: next } as any);
  };

  const toggleInterest = (opt: string) => {
    if (interests.includes(opt)) {
      setInterests(prev => prev.filter(x => x !== opt));
    } else if (interests.length >= MAX_INTERESTS) {
      setInterestNote(`You can pick up to ${MAX_INTERESTS}`);
    } else {
      setInterests(prev => [...prev, opt]);
      setInterestNote('');
    }
  };

  const handleSave = async () => {
    if (ageError) {
      setError('You must be at least 18 to use this app.');
      return;
    }
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
        interests,
        height,
        weight,
        relationshipGoals,
      } as any);
      await refreshUser();
      router.back();
    } catch (err: any) {
      setError(err?.message || 'Failed to save');
    }
    setSaving(false);
  };

  return (
    <AppShell>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoPick} style={{ display: 'none' }} />

      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        display: 'flex', alignItems: 'center',
        padding: '16px 2px', marginBottom: 4,
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      }}>
        <button onClick={() => router.back()} aria-label="Back" style={{ width: 40, height: 40, borderRadius: 9999, background: '#F3F3F6', border: '1px solid #EDEDF1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <ChevronBackIcon size={20} color="#151515" />
        </button>
        <h1 style={{ flex: 1, fontSize: 19, fontWeight: 800, color: '#151515', margin: 0, textAlign: 'center' }}>Edit Profile</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ width: 40, height: 40, borderRadius: 9999, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'linear-gradient(135deg, #FF375F, #FF6B8A)', boxShadow: '0 4px 16px rgba(255,55,95,0.4)', color: 'white', fontWeight: 800, fontSize: 13 }}
        >
          {saving ? '...' : 'Done'}
        </button>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <SectionLabel>Photos</SectionLabel>
        <p style={{ fontSize: 13, color: '#8A8A8F', margin: '0 2px 14px' }}>Your first photo is your main photo. Tap a photo to remove it, use the arrows to reorder.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {photos.map((id, i) => (
            <div key={id} style={{ width: 'calc((100% - 20px) / 3)', aspectRatio: '3/4', borderRadius: 14, overflow: 'hidden', position: 'relative', background: '#F3F3F6' }}>
              <img src={photoUrls[i] || storageService.getFilePreview(id)} alt="" onClick={() => removePhoto(i)} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
              <span style={{ position: 'absolute', top: 6, left: 6, minWidth: 22, height: 22, padding: '0 6px', boxSizing: 'border-box', borderRadius: 9999, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {i + 1}
              </span>
              <button onClick={() => removePhoto(i)} aria-label="Remove photo" style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 9999, background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CloseCircleIcon size={16} color="white" />
              </button>
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', background: 'rgba(0,0,0,0.55)' }}>
                <button onClick={() => movePhoto(i, -1)} disabled={i === 0} aria-label="Move left" style={{ flex: 1, background: 'none', border: 'none', color: 'white', padding: '5px 0', cursor: i === 0 ? 'not-allowed' : 'pointer', opacity: i === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronBackIcon size={14} color="white" />
                </button>
                <button onClick={() => movePhoto(i, 1)} disabled={i === photos.length - 1} aria-label="Move right" style={{ flex: 1, background: 'none', border: 'none', color: 'white', padding: '5px 0', cursor: i === photos.length - 1 ? 'not-allowed' : 'pointer', opacity: i === photos.length - 1 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronForwardIcon size={14} color="white" />
                </button>
              </div>
            </div>
          ))}
          {photos.length < 9 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: 'calc((100% - 20px) / 3)', aspectRatio: '3/4', borderRadius: 14,
                background: '#F6F6F9', border: '1.5px dashed #D0D0D5', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#8A8A8F',
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 9999, background: '#EDEDF1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PlusIcon size={20} color="#151515" />
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>Add</span>
            </button>
          )}
        </div>

        <SectionLabel>Bio</SectionLabel>
        <div style={{ position: 'relative' }}>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value.slice(0, BIO_MAX))}
            placeholder="Write something about yourself..."
            rows={4}
            style={{ width: '100%', boxSizing: 'border-box', background: '#F6F6F9', border: '1px solid #EDEDF1', borderRadius: 14, color: '#151515', padding: '14px 14px 24px', fontSize: 15, lineHeight: '22px', resize: 'none', outline: 'none', fontFamily: 'inherit' }}
          />
          <span style={{ position: 'absolute', right: 12, bottom: 8, fontSize: 12, fontWeight: 600, color: bio.length >= BIO_MAX ? '#FF6B8A' : '#8A8A8F' }}>
            {bio.length}/{BIO_MAX}
          </span>
        </div>

        <SectionLabel>My Basics</SectionLabel>
        <div style={{ background: '#F6F6F9', borderRadius: 14, overflow: 'hidden' }}>
          <BasicsRow label="Name">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={{ flex: 1, background: 'none', border: 'none', color: '#151515', fontSize: 15, textAlign: 'right', outline: 'none', padding: '0 0 0 12px', minWidth: 0 }} />
          </BasicsRow>
          <BasicsRow label="Date of Birth">
            <input value={dob} onChange={e => setDob(e.target.value)} type="date" style={{ flex: 1, background: 'none', border: 'none', color: dob ? '#151515' : '#8A8A8F', fontSize: 15, textAlign: 'right', outline: 'none', padding: '0 0 0 12px', minWidth: 0 }} />
          </BasicsRow>
          {ageError && (
            <div style={{ padding: '4px 16px 10px', color: '#FF3B30', fontSize: 12.5, fontWeight: 500 }}>
              You must be at least 18 to use this app.
            </div>
          )}
          <BasicsRow label="Gender" onClick={() => setShowGender(true)} chevron>
            <span style={{ flex: 1, color: gender ? '#151515' : '#8A8A8F', fontSize: 15, textTransform: 'capitalize', textAlign: 'right', paddingLeft: 12 }}>{gender || 'Select'}</span>
          </BasicsRow>
          <BasicsRow label="Show Me" onClick={() => setShowInterest(true)} chevron>
            <span style={{ flex: 1, color: interest ? '#151515' : '#8A8A8F', fontSize: 15, textTransform: 'capitalize', textAlign: 'right', paddingLeft: 12 }}>{interest || 'Select'}</span>
          </BasicsRow>
          <BasicsRow label="City" last>
            <input value={city} onChange={e => setCity(e.target.value)} placeholder="City" style={{ flex: 1, background: 'none', border: 'none', color: '#151515', fontSize: 15, textAlign: 'right', outline: 'none', padding: '0 0 0 12px', minWidth: 0 }} />
          </BasicsRow>
        </div>

        <SectionLabel>My Interests</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 2px 14px' }}>
          <p style={{ fontSize: 13, color: '#8A8A8F', margin: 0 }}>These show as badges on your profile.</p>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: interests.length >= MAX_INTERESTS ? '#FF6B8A' : '#8A8A8F' }}>
            {interests.length}/{MAX_INTERESTS}
          </span>
        </div>
        {interestNote && <p style={{ fontSize: 12.5, color: '#FF6B8A', margin: '-6px 2px 10px', fontWeight: 600 }}>{interestNote}</p>}
        {INTEREST_CATEGORIES.map(cat => (
          <div key={cat.label} style={{ marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '18px 2px 10px' }}>
              <span style={{ fontSize: 14 }}>{cat.emoji}</span>
              <span style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', color: '#8A8A8F' }}>{cat.label}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {cat.items.map(opt => {
                const selected = interests.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggleInterest(opt)}
                    style={{
                      padding: '9px 16px', borderRadius: 9999, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                      color: selected ? 'white' : '#8A8A8F',
                      background: selected ? 'linear-gradient(135deg, #FF375F, #FF6B8A)' : '#F3F3F6',
                      border: selected ? 'none' : '1px solid #EDEDF1',
                      opacity: !selected && interests.length >= MAX_INTERESTS ? 0.45 : 1,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {error && <p style={{ color: '#FF3B30', fontSize: 13, textAlign: 'center', marginTop: 20 }}>{error}</p>}

        <SectionLabel>Other Personal Details</SectionLabel>
        <div style={{ borderRadius: 16, overflow: 'hidden', marginTop: 12, background: '#fff', border: '1px solid #EDEDF1', boxShadow: '0 1px 4px rgba(20,20,25,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: '1px solid #F0F0F3' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#8A8A8F' }}>Height</span>
            <button onClick={() => setShowHeight(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: height ? '#151515' : '#8A8A8F', fontSize: 15 }}>
              {height || 'Select'}
              <ChevronForwardIcon size={16} color="#65656A" />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: '1px solid #F0F0F3' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#8A8A8F' }}>Weight (kg)</span>
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="e.g. 70"
              min="20"
              max="300"
              style={{ background: 'none', border: 'none', color: '#151515', fontSize: 15, textAlign: 'right', outline: 'none', width: 100 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#8A8A8F' }}>Relationship Goals</span>
            <button onClick={() => setShowRelationshipGoals(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: relationshipGoals ? '#151515' : '#8A8A8F', fontSize: 15, textTransform: 'capitalize' }}>
              {relationshipGoals || 'Select'}
              <ChevronForwardIcon size={16} color="#65656A" />
            </button>
          </div>
        </div>

        <Button title={saving ? 'Saving...' : 'Save Changes'} onPress={handleSave} variant="gradient" size="lg" style={{ width: '100%', marginTop: 28 }} disabled={saving} loading={saving} />
      </div>

      {showGender && <OptionPicker label="Gender" options={GENDERS} value={gender} onChange={setGender} onClose={() => setShowGender(false)} />}
      {showInterest && <OptionPicker label="Show Me" options={INTERESTS} value={interest} onChange={setInterest} onClose={() => setShowInterest(false)} />}
      {showHeight && <OptionPicker label="Height" options={HEIGHT_OPTIONS} value={height} onChange={setHeight} onClose={() => setShowHeight(false)} />}
      {showRelationshipGoals && <OptionPicker label="Relationship Goals" options={RELATIONSHIP_GOALS} value={relationshipGoals} onChange={setRelationshipGoals} onClose={() => setShowRelationshipGoals(false)} />}

    </AppShell>
  );
}

function BasicsRow({ label, children, onClick, chevron, last }: { label: string; children: React.ReactNode; onClick?: () => void; chevron?: boolean; last?: boolean }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', padding: '0 16px', minHeight: 56, cursor: onClick ? 'pointer' : 'default',
      borderBottom: last ? 'none' : '1px solid #F0F0F3', gap: 12,
    }}>
      <span style={{ fontSize: 15, color: '#151515', fontWeight: 500, width: 110, flexShrink: 0 }}>{label}</span>
      {children}
      {chevron && <ChevronForwardIcon size={16} color="#65656A" />}
    </div>
  );
}
