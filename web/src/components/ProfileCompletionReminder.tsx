'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { CloseIcon } from '@/components/Icons';

const FIELDS = [
  { key: 'photo', label: 'Add a profile photo', check: (p: any) => Boolean(p?.photos?.length) },
  { key: 'bio', label: 'Write a bio', check: (p: any) => Boolean(p?.bio) },
  { key: 'dob', label: 'Set your date of birth', check: (p: any) => Boolean(p?.age || p?.dateOfBirth) },
  { key: 'gender', label: 'Select your gender', check: (p: any) => Boolean(p?.gender) },
  { key: 'interestedIn', label: "Set who you're interested in", check: (p: any) => Boolean(p?.interestedIn) },
  { key: 'city', label: 'Add your city', check: (p: any) => Boolean(p?.city) },
  { key: 'interests', label: 'Pick your interests', check: (p: any) => Boolean(p?.interests?.length) },
  { key: 'height', label: 'Add your height', check: (p: any) => Boolean(p?.height) },
  { key: 'weight', label: 'Add your weight', check: (p: any) => Boolean(p?.weight) },
  { key: 'relationshipGoals', label: 'Set your relationship goals', check: (p: any) => Boolean(p?.relationshipGoals) },
];

const INTERVAL_MS = 40_000;
const MAX_SHOWN = 4;
const STORAGE_KEY = 'profileReminderCount';

function getMissingFields(profile: any): string[] {
  return FIELDS.filter(f => !f.check(profile)).map(f => f.label);
}

export default function ProfileCompletionReminder() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);
  const [pct, setPct] = useState(0);
  const shownRef = useRef(0);
  const dismissedSession = useRef(false);

  useEffect(() => {
    try {
      shownRef.current = Number(sessionStorage.getItem(STORAGE_KEY) || '0');
    } catch {}
  }, []);

  const evaluate = useCallback(() => {
    if (loading || !profile) return;
    if (dismissedSession.current) return;
    if (shownRef.current >= MAX_SHOWN) return;
    const m = getMissingFields(profile);
    const p = Math.round(((FIELDS.length - m.length) / FIELDS.length) * 100);
    setMissing(m);
    setPct(p);
    if (p < 100 && m.length > 0) {
      setShow(true);
      shownRef.current += 1;
      try {
        sessionStorage.setItem(STORAGE_KEY, String(shownRef.current));
      } catch {}
    }
  }, [profile, loading]);

  useEffect(() => {
    if (loading || !profile) return;
    const timer = setInterval(evaluate, INTERVAL_MS);
    evaluate();
    return () => clearInterval(timer);
  }, [evaluate, loading, profile]);

  const dismiss = () => {
    setShow(false);
    dismissedSession.current = true;
  };

  if (!show || pct === 100 || loading || !profile) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(0,0,0,0.6)' }}
      onClick={dismiss}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="animate-fade-up"
        style={{
          width: '100%', maxWidth: 400, background: '#16161C', borderRadius: 24,
          padding: '28px 24px 24px', position: 'relative',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 16px 60px rgba(0,0,0,0.7)',
        }}
      >
        <button
          onClick={dismiss}
          aria-label="Close"
          style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32, borderRadius: 9999, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <CloseIcon size={14} color="white" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 9999, background: 'linear-gradient(135deg, #FF375F, #7C4DFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 22 }}>✨</span>
          </div>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'white', margin: 0 }}>Complete Your Profile</h3>
            <p style={{ fontSize: 13, color: '#ABABAB', margin: '2px 0 0' }}>{pct}% complete</p>
          </div>
        </div>

        <div style={{ height: 5, borderRadius: 9999, background: 'rgba(255,255,255,0.1)', marginBottom: 18, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 9999, background: 'linear-gradient(90deg, #FF375F, #FF6B8A)', transition: 'width 0.5s ease' }} />
        </div>

        <p style={{ fontSize: 13, color: '#D0D0D0', margin: '0 0 12px', lineHeight: '18px' }}>
          {pct < 50
            ? 'Your profile is barely visible to others. Complete it to get more matches and likes!'
            : 'You&apos;re almost there! A complete profile gets up to 10x more matches.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          {missing.slice(0, 5).map(label => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 5, height: 5, borderRadius: 9999, background: '#FF6B8A', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#ABABAB' }}>{label}</span>
            </div>
          ))}
          {missing.length > 5 && (
            <span style={{ fontSize: 12, color: '#6B6B6B', paddingLeft: 13 }}>+{missing.length - 5} more</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={dismiss}
            style={{ padding: '13px 20px', borderRadius: 9999, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#D0D0D0', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            Later
          </button>
          <button
            onClick={() => { dismiss(); router.push('/edit-profile'); }}
            style={{ flex: 1, padding: '13px 20px', borderRadius: 9999, border: 'none', background: 'linear-gradient(135deg, #FF375F, #FF6B8A)', color: 'white', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 18px rgba(255,55,95,0.35)' }}
          >
            Complete Now
          </button>
        </div>
      </div>
    </div>
  );
}
