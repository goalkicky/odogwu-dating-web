'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/store/AuthContext';
import { authService, userService, storageService, matchService } from '@/lib/cloudflare/services';
import { account } from '@/lib/cloudflare/config';
import { interestCategory } from '@/lib/interests';
import { profileCompletion, profileCompletionMissing } from '@/lib/profileCompletion';
import { PROFILE_TEMPLATE_CSS } from '@/lib/profileTemplateStyles';

const GENDERS = ['male', 'female', 'non-binary', 'other'] as const;
const BIO_MAX = 500;
const MAX_INTERESTS = 10;
const MAX_PHOTOS = 6;

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

function OptionPicker({ label, options, value, onChange, onClose }: { label: string; options: readonly string[]; value: string; onChange: (v: string) => void; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxHeight: '80vh', background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 24px 40px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#151515', marginBottom: 16, textAlign: 'center', flexShrink: 0 }}>{label}</h3>
        <div style={{ overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => { onChange(opt); onClose(); }}
              style={{
                width: '100%', padding: '14px 16px', background: value === opt ? 'rgba(255,46,95,0.15)' : 'transparent',
                border: `1px solid ${value === opt ? '#FF2E5F' : '#EDEDF1'}`,
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

function TextSheet({ label, value, type, multiline, maxLength, placeholder, onSave, onClose }: { label: string; value: string; type?: string; multiline?: boolean; maxLength?: number; placeholder?: string; onSave: (v: string) => void; onClose: () => void }) {
  const [v, setV] = useState(value || '');
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 24px 40px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#151515', marginBottom: 16, textAlign: 'center' }}>{label}</h3>
        {multiline ? (
          <div style={{ position: 'relative' }}>
            <textarea
              value={v}
              onChange={e => setV(e.target.value.slice(0, maxLength || 1000))}
              placeholder={placeholder}
              rows={5}
              style={{ width: '100%', boxSizing: 'border-box', background: '#F6F6F9', border: '1px solid #EDEDF1', borderRadius: 14, color: '#151515', padding: '14px 14px 24px', fontSize: 15, lineHeight: '22px', resize: 'none', outline: 'none', fontFamily: 'inherit' }}
            />
            {maxLength && (
              <span style={{ position: 'absolute', right: 12, bottom: 8, fontSize: 12, fontWeight: 600, color: v.length >= maxLength ? '#FF7BA0' : '#8A8A8F' }}>
                {v.length}/{maxLength}
              </span>
            )}
          </div>
        ) : (
          <input
            value={v}
            onChange={e => setV(e.target.value)}
            type={type || 'text'}
            placeholder={placeholder}
            style={{ width: '100%', boxSizing: 'border-box', background: '#F6F6F9', border: '1px solid #EDEDF1', borderRadius: 14, color: '#151515', padding: '14px', fontSize: 16, outline: 'none', fontFamily: 'inherit' }}
          />
        )}
        <button
          onClick={() => { onSave(v.trim()); onClose(); }}
          style={{ marginTop: 16, width: '100%', padding: '14px', borderRadius: 9999, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #FF2E5F, #FF7BA0)', color: 'white', fontWeight: 800, fontSize: 15, boxShadow: '0 8px 24px rgba(255,46,95,0.35)' }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, refreshUser, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [bio, setBio] = useState(profile?.bio || '');
  const [city, setCity] = useState(profile?.city || '');
  const [dob, setDob] = useState(profile?.dateOfBirth || '');
  const [gender, setGender] = useState(profile?.gender || '');
  const [interest, setInterest] = useState(profile?.interestedIn || '');
  const [interests, setInterests] = useState<string[]>(profile?.interests || []);
  const [height, setHeight] = useState(profile?.height || '');
  const [weight, setWeight] = useState(profile?.weight || '');
  const [relationshipGoals, setRelationshipGoals] = useState(profile?.relationshipGoals || '');
  const [courseOfStudy, setCourseOfStudy] = useState((profile as any)?.courseOfStudy || '');
  const [institution, setInstitution] = useState((profile as any)?.institution || '');
  const [occupation, setOccupation] = useState('');
  const [ageRange, setAgeRange] = useState((profile as any)?.ageRange || '');
  const [maxDistance, setMaxDistance] = useState((profile as any)?.maxDistance || '');
  const [wantsKids, setWantsKids] = useState((profile as any)?.wantsKids || '');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [messagesCount, setMessagesCount] = useState(0);
  const [openAbout, setOpenAbout] = useState(true);
  const [showGender, setShowGender] = useState(false);
  const [textSheet, setTextSheet] = useState<null | { label: string; value: string; onChange: (v: string) => void; type?: string; multiline?: boolean; maxLength?: number; placeholder?: string }>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const age = calcAge(dob);
  const ageError = !!dob && age !== null && age < 18;
  const uid = (profile as any)?.$id || (profile as any)?.id;

  const openText = (label: string, value: string, onChange: (v: string) => void, opts?: { type?: string; multiline?: boolean; maxLength?: number; placeholder?: string }) => {
    setTextSheet({ label, value, onChange, ...opts });
  };

  const showToast = (message: string) => {
    setToast(message);
    setToastVisible(true);
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToastVisible(false), 2200);
  };

  useEffect(() => {
    if (!profile) return;
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
    setCourseOfStudy((profile as any).courseOfStudy || '');
    setInstitution((profile as any).institution || '');
    setOccupation((profile as any).occupation || '');
    setAgeRange((profile as any).ageRange || '');
    setMaxDistance((profile as any).maxDistance || '');
    setWantsKids((profile as any).wantsKids || '');
    const p = profile.photos || [];
    setPhotos(p);
    Promise.all(p.map(id => storageService.ensurePublicRead(id).catch(() => {}))).catch(() => {});
    authService.createJWT()
      .then(() => setPhotoUrls(p.map(id => storageService.getFilePreview(id))))
      .catch(() => setPhotoUrls(p.map(id => storageService.getFilePreview(id))));
  }, [profile]);

  useEffect(() => {
    if (!uid) return;
    matchService.getUserMatches(uid)
      .then((res: any) => {
        const docs = Array.isArray(res) ? res : (res?.documents || []);
        setMessagesCount(docs.filter((d: any) => d.hasConversation).length);
      })
      .catch(() => {});
  }, [uid]);

  const completionData = {
    fullName: name,
    photos,
    bio,
    city,
    dateOfBirth: dob,
    interestedIn: interest,
    interests,
    gender,
    relationshipGoals,
    courseOfStudy,
    institution,
    occupation,
    ageRange,
    maxDistance,
    wantsKids,
  };
  const completionPct = profileCompletion(completionData);
  const missingItems = profileCompletionMissing(completionData);
  const progressFilled = Math.round((completionPct / 100) * 5);

  const basics = [
    { label: 'Name', value: name || '—', onEdit: () => openText('Name', name, setName, { placeholder: 'Your name' }) },
    { label: 'Age', value: age ? String(age) : '—', onEdit: () => openText('Date of Birth', dob, setDob, { type: 'date' }) },
    { label: 'Gender', value: gender || '—', onEdit: () => setShowGender(true) },
    { label: 'Location', value: city || '—', onEdit: () => openText('Location', city, setCity, { placeholder: 'Lagos, Nigeria' }) },
    { label: 'Course of Study', value: courseOfStudy || '—', onEdit: () => openText('Course of Study', courseOfStudy, setCourseOfStudy, { placeholder: 'e.g. Computer Science' }) },
    { label: 'Institution', value: institution || '—', onEdit: () => openText('Institution', institution, setInstitution, { placeholder: 'e.g. University of Lagos' }) },
    { label: 'Occupation', value: occupation || '—', onEdit: () => openText('Occupation', occupation, setOccupation, { placeholder: 'e.g. Software Developer' }) },
  ];
  const basicsFilled = basics.filter(b => b.value !== '—').length;

  const handlePhotoPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    if (photos.length >= MAX_PHOTOS) {
      showToast(`You can add up to ${MAX_PHOTOS} photos`);
      e.target.value = '';
      return;
    }
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

  const handleSave = async () => {
    if (ageError) {
      showToast('You must be at least 18 to use this app.');
      return;
    }
    setSaving(true);
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
        courseOfStudy,
        institution,
        occupation,
        ageRange,
        maxDistance,
        wantsKids,
      } as any);
      await refreshUser();
      showToast('Profile saved successfully');
      setTimeout(() => router.back(), 900);
    } catch (err: any) {
      showToast(err?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    if (!window.confirm('Log out of your account?')) return;
    await logout();
    router.replace('/login');
  };

  return (
    <AppShell header={<></>}>
      <style jsx global>{PROFILE_TEMPLATE_CSS}</style>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoPick} hidden />

      <main className="ep">
        <div className="app-shell">
          <header className="topbar">
            <button className="icon-btn back" aria-label="Go back" onClick={() => router.back()}>‹</button>
            <img className="brand-logo" src="/o-logo.png" alt="Odogwu Dating" />
            <button className="chat-btn" aria-label="Messages" onClick={() => router.push('/matches')}><span className="bubble">•••</span><em>{messagesCount || 0}</em></button>
          </header>

          <section className="intro">
            <h1>Complete Your Profile</h1>
            <p>Complete your profile to get more matches <span>♥</span></p>
            <div className="progress">
              {Array.from({ length: 5 }, (_, i) => <span key={i} style={i < progressFilled ? undefined : { background: '#f0f0f4' }} />)}
            </div>
            <div className="progress-label">{completionPct}% Complete</div>
            {completionPct < 100 && missingItems.length > 0 && (
              <ul className="missing">
                {missingItems.slice(0, 3).map(m => <li key={m}>• {m}</li>)}
              </ul>
            )}
          </section>

          <section className="card photos-card">
            <div className="section-head">
              <div><h2>Add Your Photos</h2><p>Profiles with 4+ photos get 5x more matches</p></div>
              <strong>{photos.length}/{MAX_PHOTOS}</strong>
            </div>
            <div className="photo-grid" id="photoGrid">
              {photos.map((id, i) => (
                <div className="photo-item" key={id}>
                  <img src={photoUrls[i] || storageService.getFilePreview(id)} alt="Profile photo" />
                  <button className="remove" aria-label="Remove photo" onClick={() => removePhoto(i)}>×</button>
                </div>
              ))}
              <button className="add-tile" id="addPhoto" onClick={() => {
                if (photos.length >= MAX_PHOTOS) { showToast(`You can add up to ${MAX_PHOTOS} photos`); return; }
                fileInputRef.current?.click();
              }}><span>＋</span><small>Add Photo</small></button>
            </div>
            <div className="hint"><span>♧</span> Show your best self! Clear photos with a smiling face work best.</div>
          </section>

          <section className="card basic-card" style={{ cursor: 'pointer' }} onClick={() => router.push('/edit-profile/basic')}>
            <div className="section-head accordion-title" data-target="basicBody">
              <div className="title-icon person">♙</div><h2>Basic Information</h2><strong>{basicsFilled}/7 <span>›</span></strong>
            </div>
            <div className="info-grid" id="basicBody">
              {basics.map(b => (
                <div className="info" key={b.label}>
                  <label>{b.label}</label>
                  <b>{b.value}</b>
                  {b.value !== '—' && <span>✓</span>}
                </div>
              ))}
            </div>
          </section>

          <section className="card about-card">
            <div className="section-head accordion-title" data-target="aboutBody" onClick={() => setOpenAbout(o => !o)}>
              <div className="title-icon quote">“</div><h2>About You</h2><strong>{bio ? '1/1' : '0/1'} <span>{openAbout ? '⌃' : '⌄'}</span></strong>
            </div>
            {openAbout && (
              <div
                className="about-body"
                id="aboutBody"
                onClick={() => openText('About You', bio, setBio, { multiline: true, maxLength: BIO_MAX, placeholder: 'Write something about yourself...' })}
                style={{ whiteSpace: 'pre-line' }}
              >
                {bio || 'Easy going, God fearing and always open to new adventures.'}{bio && <span>✓</span>}
              </div>
            )}
          </section>

          <section className="card preferences-card" style={{ cursor: 'pointer' }} onClick={() => router.push('/edit-profile/preferences')}>
            <div className="section-head accordion-title" data-target="prefsBody">
              <div className="title-icon heart">♡</div><h2>Your Preferences</h2><strong>{[relationshipGoals, ageRange, maxDistance, wantsKids].filter(Boolean).length}/4 <span>›</span></strong>
            </div>
            <div className="preferences" id="prefsBody">
              <div className="pref"><div>▣</div><label>Age Range</label><b>{ageRange || '—'}</b></div>
              <div className="pref"><div>♡</div><label>Looking For</label><b>{relationshipGoals || '—'}</b></div>
              <div className="pref"><div>⌾</div><label>Distance</label><b>{maxDistance || '—'}</b></div>
              <div className="pref"><div>♧</div><label>Kids</label><b>{wantsKids || '—'}</b></div>
            </div>
          </section>

          <section className="card interests-card" onClick={() => router.push('/edit-profile/interests')} style={{ cursor: 'pointer' }}>
            <div className="section-head">
              <div className="title-icon star">☆</div><div><h2>Interests</h2><p>Pick your interests</p></div>
              <strong>{interests.length}/{MAX_INTERESTS}<span>›</span></strong>
            </div>
            {interests.length > 0 && (
              <div className="interest-grid" id="interestsBody">
                {interests.map(it => {
                  const cat = interestCategory(it);
                  return (
                    <div className="interest" key={it}>
                      <span>{cat ? cat.emoji : '✦'}</span>
                      <b>{it}</b>
                      <em>✓</em>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <button className="save" id="saveBtn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save & Continue'}
          </button>
          <p className="footer-note">You can always update this later</p>
          <button className="logout" onClick={handleLogout}>Log Out</button>
          <div className="home-indicator"></div>
        </div>
      </main>

      <div className={`ep toast${toastVisible ? ' show' : ''}`}>{toast || 'Profile saved successfully'}</div>

      {showGender && <OptionPicker label="Gender" options={GENDERS} value={gender} onChange={setGender} onClose={() => setShowGender(false)} />}
      {textSheet && <TextSheet key={textSheet.label + textSheet.value} label={textSheet.label} value={textSheet.value} type={textSheet.type} multiline={textSheet.multiline} maxLength={textSheet.maxLength} placeholder={textSheet.placeholder} onSave={textSheet.onChange} onClose={() => setTextSheet(null)} />}
    </AppShell>
  );
}