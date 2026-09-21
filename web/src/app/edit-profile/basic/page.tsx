'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/store/AuthContext';
import { userService } from '@/lib/cloudflare/services';
import { account } from '@/lib/cloudflare/config';
import { BASIC_TEMPLATE_CSS } from '@/lib/basicTemplateStyles';

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

const GENDERS = ['male', 'female', 'non-binary', 'other'] as const;

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

function TextSheet({ label, value, type, maxLength, placeholder, onSave, onClose }: { label: string; value: string; type?: string; maxLength?: number; placeholder?: string; onSave: (v: string) => void; onClose: () => void }) {
  const [v, setV] = useState(value || '');
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.6)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 24px 40px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#151515', marginBottom: 16, textAlign: 'center' }}>{label}</h3>
        <input
          value={v}
          onChange={e => setV(e.target.value.slice(0, maxLength || 1000))}
          type={type || 'text'}
          placeholder={placeholder}
          style={{ width: '100%', boxSizing: 'border-box', background: '#F6F6F9', border: '1px solid #EDEDF1', borderRadius: 14, color: '#151515', padding: '14px', fontSize: 16, outline: 'none', fontFamily: 'inherit' }}
        />
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

export default function BasicInfoPage() {
  const router = useRouter();
  const { profile, refreshUser } = useAuth();

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [courseOfStudy, setCourseOfStudy] = useState('');
  const [institution, setInstitution] = useState('');
  const [occupation, setOccupation] = useState('');
  const [showGender, setShowGender] = useState(false);
  const [textSheet, setTextSheet] = useState<null | { label: string; value: string; onSave: (v: string) => void; type?: string; placeholder?: string }>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (message: string) => {
    setToast(message);
    setToastVisible(true);
    window.clearTimeout((showToast as any)._t);
    (showToast as any)._t = window.setTimeout(() => setToastVisible(false), 1800);
  };

  useEffect(() => {
    if (!profile) return;
    setName(profile.fullName || '');
    setDob(profile.dateOfBirth || '');
    setGender(profile.gender || '');
    setCity(profile.city || '');
    setCourseOfStudy((profile as any).courseOfStudy || '');
    setInstitution((profile as any).institution || '');
    setOccupation((profile as any).occupation || '');
  }, [profile]);

  const age = calcAge(dob);
  const basics = [
    { field: 'Name', value: name || '—', sub: 'This is how it will appear on your profile.', twoLine: false, onEdit: () => setTextSheet({ label: 'Name', value: name, placeholder: 'Your name', onSave: (v: string) => { setName(v); showToast('Name updated'); } }) },
    { field: 'Age', value: age ? String(age) : '—', sub: "Your age won't be shown on your profile.", twoLine: false, onEdit: () => setTextSheet({ label: 'Date of Birth', value: dob, type: 'date', onSave: (v: string) => { setDob(v); showToast('Age updated'); } }) },
    { field: 'Gender', value: gender ? (gender.charAt(0).toUpperCase() + gender.slice(1)) : '—', sub: 'This helps us show you better matches.', twoLine: false, onEdit: () => setShowGender(true) },
    { field: 'Location', value: city || '—', sub: 'Your location helps us find matches near you.', twoLine: false, onEdit: () => setTextSheet({ label: 'Location', value: city, placeholder: 'Lagos, Nigeria', onSave: (v: string) => { setCity(v); showToast('Location updated'); } }) },
    { field: 'Course of Study', value: courseOfStudy || '—', sub: 'What did you study?', twoLine: false, onEdit: () => setTextSheet({ label: 'Course of Study', value: courseOfStudy, placeholder: 'e.g. Computer Science', onSave: (v: string) => { setCourseOfStudy(v); showToast('Course updated'); } }) },
    { field: 'Institution', value: institution || '—', sub: 'Where did you attend?', twoLine: false, onEdit: () => setTextSheet({ label: 'Institution', value: institution, placeholder: 'e.g. University of Lagos', onSave: (v: string) => { setInstitution(v); showToast('Institution updated'); } }) },
    { field: 'Occupation', value: occupation || '—', sub: 'What do you do?', twoLine: false, onEdit: () => setTextSheet({ label: 'Occupation', value: occupation, placeholder: 'e.g. Software Developer', onSave: (v: string) => { setOccupation(v); showToast('Occupation updated'); } }) },
  ];
  const basicsFilled = basics.filter(b => b.value !== '—').length;
  const progressFilled = Math.round((basicsFilled / 7) * 4);
  const percent = Math.round((basicsFilled / 7) * 100);

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = await account!.get();
      await userService.updateProfile(user.$id, {
        fullName: name,
        dateOfBirth: dob,
        gender,
        city,
        courseOfStudy,
        institution,
        occupation,
      } as any);
      await refreshUser();
      showToast('Information saved successfully');
      setTimeout(() => router.back(), 900);
    } catch (err: any) {
      showToast(err?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const iconFor = (field: string) => {
    if (field === 'Name') return <svg viewBox="0 0 32 32"><circle cx="16" cy="10" r="5.5" /><path d="M6.5 25c.8-5 4-7.5 9.5-7.5s8.7 2.5 9.5 7.5" /><path d="M9 27h14" /></svg>;
    if (field === 'Age') return <svg viewBox="0 0 32 32"><rect x="6" y="7" width="20" height="20" rx="2.5" /><path d="M10 4.5v5M22 4.5v5M6 12h20" /><path d="M11 16h3M18 16h3M11 21h3M18 21h3" /></svg>;
    if (field === 'Gender') return <svg viewBox="0 0 32 32"><circle cx="12" cy="12" r="5" /><path d="M12 17v9M8 22h8M21 9l5-5M21 4h5v5" /><path d="M21 17a5 5 0 1 0-2.8-9.1" /></svg>;
    if (field === 'Location') return <svg viewBox="0 0 32 32"><path d="M16 28s9-8.1 9-15a9 9 0 1 0-18 0c0 6.9 9 15 9 15Z" /><circle cx="16" cy="13" r="3" /></svg>;
    if (field === 'Course of Study') return <svg viewBox="0 0 32 32"><path d="m4 11 12-6 12 6-12 6Z" /><path d="M8 13v8c4 3 12 3 16 0v-8M28 11v8" /></svg>;
    if (field === 'Institution') return <svg viewBox="0 0 32 32"><path d="M5 14h22M7 14v11M25 14v11M7 25h18" /><rect x="11" y="17" width="3" height="4" /><rect x="18" y="17" width="3" height="4" /></svg>;
    return <svg viewBox="0 0 32 32"><rect x="5" y="9" width="22" height="17" rx="2.5" /><path d="M11 9V6h10v3M5 16h22M13 16v3h6v-3" /></svg>;
  };

  return (
    <AppShell header={<></>}>
      <style jsx global>{BASIC_TEMPLATE_CSS}</style>

      <main className="bk">
        <div className="app-shell">
          <header className="topbar">
            <button className="back-btn" aria-label="Go back" type="button" onClick={() => router.back()}>
              <svg viewBox="0 0 24 24"><path d="M15 4.5 7.5 12 15 19.5" /></svg>
            </button>
            <div className="heading">
              <h1>Basic Information</h1>
              <p>Tell us a little about yourself.</p>
            </div>
            <div className="complete">{basicsFilled}/7 Complete</div>
          </header>

          <section className="progress" aria-label="Profile completion">
            {Array.from({ length: 4 }, (_, i) => <span key={i} style={i < progressFilled ? undefined : { background: '#f0f0f4' }} />)}
          </section>
          <div className="percent">{percent}% Complete</div>

          <section className="info-card">
            {basics.map(b => (
              <button className="info-row" type="button" key={b.field} data-field={b.field} onClick={b.onEdit}>
                <div className="icon-box">{iconFor(b.field)}</div>
                <div className="labels"><strong>{b.field}</strong><small>{b.sub}</small></div>
                <div className={`value${b.twoLine ? ' two-line' : ''}`}><b>{b.value}</b></div>
                <span className="edit" aria-label={`Edit ${b.field}`}><svg viewBox="0 0 24 24"><path d="m4 20 4.1-.9L19.5 7.7a2.1 2.1 0 0 0-3-3L5.1 16.1z" /><path d="m14.5 6.5 3 3" /></svg></span>
              </button>
            ))}
          </section>

          <section className="safe-card">
            <div className="safe-icon">
              <svg viewBox="0 0 32 32"><path d="M16 3.5 26 7v8.2c0 6.3-4.2 10.8-10 13.3-5.8-2.5-10-7-10-13.3V7Z" /><rect x="12" y="14" width="8" height="7" rx="1.5" /><path d="M13.5 14v-2.2a2.5 2.5 0 0 1 5 0V14" /></svg>
            </div>
            <div>
              <h2>Your information is safe with us</h2>
              <p>We&apos;ll never share your personal details with other users.<br />You can always change this information later.</p>
            </div>
          </section>

          <section className="tips-card">
            <div className="tips-title">
              <svg viewBox="0 0 32 32"><path d="M11 21c-1.8-1.8-3-4.1-3-7a8 8 0 0 1 16 0c0 2.9-1.2 5.2-3 7" /><path d="M12 25h8M13 28h6M16 4V1M6 7 4 5M26 7l2-2" /></svg>
              <h2>Tips for a great profile</h2>
            </div>
            <ul>
              <li><span>✓</span>Be honest about your information</li>
              <li><span>✓</span>Keeping your profile updated gets you more matches</li>
              <li><span>✓</span>A complete profile gets 5x more matches</li>
            </ul>
          </section>

          <div className="actions">
            <button className="save-btn" type="button" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save & Continue'}
            </button>
            <button className="skip-btn" type="button" onClick={() => router.back()}>Skip for now</button>
          </div>

          <div className="home-indicator" aria-hidden="true"></div>
        </div>
      </main>

      <div className={`bk toast${toastVisible ? ' show' : ''}`}>{toast || 'Information saved successfully'}</div>

      {showGender && (
        <OptionPicker
          label="Gender"
          options={GENDERS}
          value={gender}
          onChange={(v: string) => { setGender(v); showToast('Gender updated'); }}
          onClose={() => setShowGender(false)}
        />
      )}
      {textSheet && (
        <TextSheet
          key={textSheet.label + textSheet.value}
          label={textSheet.label}
          value={textSheet.value}
          type={textSheet.type}
          placeholder={textSheet.placeholder}
          onSave={textSheet.onSave}
          onClose={() => setTextSheet(null)}
        />
      )}
    </AppShell>
  );
}