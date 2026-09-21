'use client';
import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/store/AuthContext';
import { userService } from '@/lib/cloudflare/services';
import { account } from '@/lib/cloudflare/config';
import { PREFERENCE_TEMPLATE_CSS } from '@/lib/preferenceTemplateStyles';

const AGE_MIN = 18;
const AGE_MAX = 99;

const RELATIONSHIPS = [
  { value: 'Long-term relationship', title: 'Long-term relationship', sub: 'Looking for something serious and meaningful', icon: <svg viewBox="0 0 24 24"><path d="M20.8 8.8c0 5.4-8.8 10.1-8.8 10.1S3.2 14.2 3.2 8.8A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8.8 2.8Z" /></svg> },
  { value: 'Short-term relationship', title: 'Short-term relationship', sub: 'Something casual and fun', icon: <svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="3" /><path d="M2.5 20c.5-4 2.2-6 5.5-6s5 2 5.5 6" /><path d="M16 11a3 3 0 1 0-1-5.8M17 14c2.8.1 4.3 2 4.8 5.5" /></svg> },
  { value: 'Friendship', title: 'Friendship', sub: 'New friends and great connections', icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path d="M8 10h.01M16 10h.01M8.5 14.5c2 2 5 2 7 0" /><path d="M9 8c.6-1 1.4-1.5 3-1.5S14.4 7 15 8" /></svg> },
  { value: 'Still figuring it out', title: 'Still figuring it out', sub: "Not sure yet, let's see where it goes", icon: <svg viewBox="0 0 24 24"><path d="M7 4h10M8 4v4l-2 3h12l-2-3V4M6 11v4a6 6 0 0 0 12 0v-4" /><path d="M9 15h6" /></svg> },
];

const DISTANCES = ['Up to 10 km', 'Up to 25 km', 'Up to 50 km', 'Up to 100 km', '150+ km'];
const KIDS = ["Doesn't have kids", 'Has kids', 'Open to kids'];

function parseRange(v: string | undefined): [number, number] {
  const m = (v || '').match(/(\d+)\s*-\s*(\d+)/);
  if (m) {
    let lo = Math.max(AGE_MIN, Number(m[1]));
    let hi = Math.min(AGE_MAX, Number(m[2]));
    if (lo > hi) [lo, hi] = [hi, lo];
    return [lo, hi];
  }
  return [AGE_MIN, AGE_MAX];
}

function mapGoals(v: string | undefined): string {
  if (v && RELATIONSHIPS.some(r => r.value === v)) return v;
  if (v === 'Marriage' || v === 'Serious Dating') return 'Long-term relationship';
  if (v === 'Flirting' || v === 'Chatting') return 'Short-term relationship';
  return 'Long-term relationship';
}

function mapDistance(v: string | undefined): string {
  if (v && DISTANCES.includes(v)) return v;
  if (v === 'Anywhere') return '150+ km';
  return 'Up to 50 km';
}

function mapKids(v: string | undefined): string {
  if (v && KIDS.includes(v)) return v;
  if (v === 'Have kids') return 'Has kids';
  if (v === 'Flexible' || v === 'Prefer no kids' || v === 'No kids') return "Doesn't have kids";
  return 'Open to kids';
}

export default function PreferencesPage() {
  const router = useRouter();
  const { profile, refreshUser } = useAuth();
  const rangeRef = useRef<HTMLDivElement>(null);

  const [age, setAge] = useState<[number, number]>([AGE_MIN, AGE_MAX]);
  const [goals, setGoals] = useState('Long-term relationship');
  const [distance, setDistance] = useState('Up to 50 km');
  const [kids, setKids] = useState('Open to kids');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setAge(parseRange((profile as any).ageRange));
    setGoals(mapGoals(profile.relationshipGoals || ''));
    setDistance(mapDistance((profile as any).maxDistance || ''));
    setKids(mapKids((profile as any).wantsKids || ''));
  }, [profile]);

  const setAgeFromX = (which: 'min' | 'max', clientX: number) => {
    const rect = rangeRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const val = Math.round(AGE_MIN + pct * (AGE_MAX - AGE_MIN));
    setAge(prev => {
      const [lo, hi] = prev;
      let min = which === 'min' ? Math.min(val, hi - 1) : lo;
      let max = which === 'max' ? Math.max(val, lo + 1) : hi;
      min = Math.max(AGE_MIN, min);
      max = Math.min(AGE_MAX, max);
      return [min, max];
    });
  };

  const startDrag = (which: 'min' | 'max', e: React.PointerEvent) => {
    e.preventDefault();
    const move = (ev: PointerEvent) => setAgeFromX(which, ev.clientX);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const minPct = ((age[0] - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100;
  const maxPct = ((age[1] - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100;

  const filled = [(profile as any)?.ageRange, profile?.relationshipGoals, (profile as any)?.maxDistance, (profile as any)?.wantsKids].filter(Boolean).length;
  const percent = Math.round((filled / 4) * 100);

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = await account!.get();
      await userService.updateProfile(user.$id, {
        ageRange: `${age[0]} - ${age[1]}`,
        relationshipGoals: goals,
        maxDistance: distance,
        wantsKids: kids,
      } as any);
      await refreshUser();
      setSaving(false);
      setDone(true);
      setTimeout(() => router.back(), 1200);
    } catch {
      setSaving(false);
      setDone(false);
    }
  };

  return (
    <AppShell header={<></>}>
      <style jsx global>{PREFERENCE_TEMPLATE_CSS}</style>

      <main className="pf">
        <div className="app-shell">
          <header>
            <div className="title-row">
              <button className="back" aria-label="Go back" onClick={() => router.back()}>ΓÇ╣</button>
              <div className="heading"><h1>Your Preferences</h1></div>
              <div className="complete">{filled}/4 Complete</div>
            </div>
            <div className="subtitle">Tell us what you&apos;re looking for in a match.</div>
            <div className="progress" aria-label="Progress">
              {Array.from({ length: 4 }, (_, i) => <span key={i} />)}
            </div>
            <div className="complete-percent">{percent}% Complete</div>
          </header>

          <section className="card">
            <div className="card-head">
              <div className="icon-box">
                <svg viewBox="0 0 24 24"><path d="M8 4h8v4h4v12H4V8h4z" /><path d="M9 4v4h6V4" /><path d="M8 12h8M8 16h5" /></svg>
              </div>
              <div className="head-copy">
                <div className="head-title">Age Range</div>
                <div className="head-sub">Select the age range you&apos;re interested in.</div>
              </div>
              <div className="head-value" id="ageValue">{age[0]} - {age[1]}</div>
            </div>
            <div className="age-body">
              <div className="age-labels"><span id="minLabel">{age[0]}</span><span id="maxLabel">{age[1]}</span></div>
              <div className="range" ref={rangeRef}>
                <div className="range-fill" style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}></div>
                <div className="thumb left" aria-label="Minimum age" role="slider" aria-valuemin={AGE_MIN} aria-valuemax={AGE_MAX} aria-valuenow={age[0]} onPointerDown={e => startDrag('min', e)} style={{ left: `${minPct}%` }}></div>
                <div className="thumb right" aria-label="Maximum age" role="slider" aria-valuemin={AGE_MIN} aria-valuemax={AGE_MAX} aria-valuenow={age[1]} onPointerDown={e => startDrag('max', e)} style={{ left: `${maxPct}%` }}></div>
              </div>
              <div className="age-ticks">
                <span>18</span><span>30</span><span>45</span><span>60</span><span>75</span><span>99</span>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <div className="icon-box">
                <svg viewBox="0 0 24 24"><path d="M20.8 8.8c0 5.4-8.8 10.1-8.8 10.1S3.2 14.2 3.2 8.8A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8.8 2.8Z" /></svg>
              </div>
              <div className="head-copy">
                <div className="head-title">Looking For</div>
                <div className="head-sub">What type of relationship are you looking for?</div>
              </div>
              <div className="head-value" id="relationshipValue">{goals}</div>
            </div>
            <div className="options" id="relationshipOptions">
              {RELATIONSHIPS.map(r => (
                <button className={`option${goals === r.value ? ' selected' : ''}`} key={r.value} onClick={() => setGoals(r.value)}>
                  <div className="option-icon">{r.icon}</div>
                  <div className="option-copy"><div className="option-title">{r.title}</div><div className="option-sub">{r.sub}</div></div>
                  <div className={`radio${goals === r.value ? ' selected' : ''}`}></div>
                </button>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <div className="icon-box">
                <svg viewBox="0 0 24 24"><path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" /><circle cx="12" cy="9" r="2.3" /></svg>
              </div>
              <div className="head-copy">
                <div className="head-title">Distance</div>
                <div className="head-sub">How far are you willing to go?</div>
              </div>
              <div className="head-value" id="distanceValue">{distance}</div>
            </div>
            <div className="distance-body">
              <div className="distance-buttons" id="distanceButtons">
                {DISTANCES.map(d => (
                  <button className={`distance-btn${distance === d ? ' selected' : ''}`} key={d} onClick={() => setDistance(d)}>{d}</button>
                ))}
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <div className="icon-box">
                <svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3" /><path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6" /><path d="M16 11a3 3 0 1 0-1-5.8M17 14c2.5.2 3.8 2 4.2 5" /></svg>
              </div>
              <div className="head-copy">
                <div className="head-title">Kids</div>
                <div className="head-sub">What&apos;s your preference about having kids?</div>
              </div>
              <div className="head-value" id="kidsValue">{kids}</div>
            </div>
            <div className="kids-body">
              <div className="kids-buttons" id="kidsButtons">
                {KIDS.map(k => (
                  <button className={`kids-btn${kids === k ? ' selected' : ''}`} key={k} onClick={() => setKids(k)}>
                    <span>{k}</span><span className="mini-radio"></span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <button className="save" id="saveBtn" onClick={handleSave} disabled={saving}>
            {done ? 'Preferences Saved Γ£ô' : saving ? 'Saving...' : 'Save Preferences'}
          </button>
          <div className="home-indicator"></div>
        </div>
      </main>
    </AppShell>
  );
}
