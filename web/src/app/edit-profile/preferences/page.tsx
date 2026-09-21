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

const GENDERS = [
  { label: 'Men', value: 'male' },
  { label: 'Women', value: 'female' },
  { label: 'Everyone', value: 'both' },
];

const DISTANCE_STEPS = [10, 25, 50, 100];

const GOAL_OPTIONS = [
  { label: 'Serious Relationship', value: 'Long-term relationship' },
  { label: 'Flirting', value: 'Short-term relationship' },
  { label: 'Dating', value: 'Still figuring it out' },
  { label: 'Friendship', value: 'Friendship' },
];

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

function mapGender(v: string | undefined): string {
  if (v === 'male' || v === 'female' || v === 'both') return v;
  return 'both';
}

function mapGoals(v: string | undefined): string {
  if (v && GOAL_OPTIONS.some(g => g.value === v)) return v;
  if (v === 'Marriage' || v === 'Serious Dating') return 'Long-term relationship';
  if (v === 'Flirting' || v === 'Chatting') return 'Short-term relationship';
  return 'Long-term relationship';
}

function mapDistance(v: string | undefined): number {
  const m = (v || '').match(/up to (\d+) km/i);
  if (m) {
    const val = Number(m[1]);
    if (DISTANCE_STEPS.includes(val)) return val;
  }
  return 100;
}

export default function PreferencesPage() {
  const router = useRouter();
  const { profile, refreshUser } = useAuth();
  const ageRangeRef = useRef<HTMLDivElement>(null);
  const distRef = useRef<HTMLDivElement>(null);

  const [age, setAge] = useState<[number, number]>([AGE_MIN, AGE_MAX]);
  const [gender, setGender] = useState('both');
  const [goals, setGoals] = useState('Long-term relationship');
  const [distanceKm, setDistanceKm] = useState(50);
  const [locationLabel, setLocationLabel] = useState('');
  const [switches, setSwitches] = useState({ verified: true, photos: true, active: true });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('locpicked') !== '1') return;
    try {
      const raw = localStorage.getItem('dogwu_location');
      if (raw) {
        const loc = JSON.parse(raw);
        if (loc && loc.city) setLocationLabel(loc.city);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!profile) return;
    setAge(parseRange((profile as any).ageRange));
    setGender(mapGender((profile as any).interestedIn));
    setGoals(mapGoals(profile?.relationshipGoals || ''));
    setDistanceKm(mapDistance((profile as any).maxDistance || ''));
    setLocationLabel((profile as any)?.city || '');
  }, [profile]);

  const setAgeFromX = (which: 'min' | 'max', clientX: number) => {
    const rect = ageRangeRef.current?.getBoundingClientRect();
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

  const startDist = (e: React.PointerEvent) => {
    e.preventDefault();
    const move = (ev: PointerEvent) => {
      const rect = distRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
      const idx = Math.round(pct * (DISTANCE_STEPS.length - 1));
      setDistanceKm(DISTANCE_STEPS[idx]);
    };
    move(e.nativeEvent);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const minPct = ((age[0] - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100;
  const maxPct = ((age[1] - AGE_MIN) / (AGE_MAX - AGE_MIN)) * 100;
  const distIdx = Math.max(0, DISTANCE_STEPS.indexOf(distanceKm));
  const distPct = (distIdx / (DISTANCE_STEPS.length - 1)) * 100;
  const locValue = locationLabel || 'Select a location';

  const handleReset = () => {
    setGender('female');
    setGoals('Short-term relationship');
    setAge([AGE_MIN, AGE_MAX]);
    setDistanceKm(100);
    setSwitches({ verified: true, photos: true, active: true });
  };

  const handleApply = async () => {
    if (saving) return;
    setSaving(true);
    setSaved(false);
    try {
      const user = await account!.get();
      const payload: Record<string, unknown> = {
        ageRange: `${age[0]} - ${age[1]}`,
        relationshipGoals: goals,
        maxDistance: `Up to ${distanceKm} km`,
        interestedIn: gender,
      };
      if ((profile as any)?.wantsKids) payload.wantsKids = (profile as any).wantsKids;
      await userService.updateProfile(user.$id, payload as any);
      await refreshUser();
      setSaving(false);
      setSaved(true);
      setTimeout(() => router.back(), 1200);
    } catch {
      setSaving(false);
      setSaved(false);
    }
  };

  const switchItems = [
    { key: 'verified' as const, icon: '✣', cls: 'blue', label: 'Verified profiles only' },
    { key: 'photos' as const, icon: '▣', cls: 'red', label: 'Profiles with photos' },
    { key: 'active' as const, icon: 'ϟ', cls: 'green', label: 'Recently active' },
  ];

  return (
    <AppShell header={<></>}>
      <style jsx global>{PREFERENCE_TEMPLATE_CSS}</style>

      <main className="dpr">
        <div className="app">
          <header className="topbar">
            <div className="brand" aria-label="Dogwu Dating">
              <div className="brand-mark"><span></span></div>
              <div className="brand-copy">
                <strong>DOGWU</strong>
                <small>D A T <b>♥</b> I N G</small>
              </div>
            </div>
            <h1>Discover</h1>
            <button className="filter-icon" aria-label="Open filters" onClick={() => router.push('/discover')}>
              <i></i><i></i><i></i>
            </button>
          </header>

          <main className="sheet">
            <div className="sheet-head">
              <button className="close" aria-label="Close" onClick={() => router.back()}>×</button>
              <h2>Discover Preferences</h2>
            </div>

            <section className="section first">
              <h3><span className="pink person">●</span> Who are you looking for?</h3>

              <div className="preference-card">
                <div className="row gender-row">
                  <label>Gender</label>
                  <div className="segmented gender">
                    {GENDERS.map(g => (
                      <button key={g.value} className={gender === g.value ? 'selected' : ''} onClick={() => setGender(g.value)}>
                        {g.label}{gender === g.value && <span className="check">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="range-block">
                  <div className="range-title">
                    <span>Age Range</span><span>{age[0]} – {age[1]}</span>
                  </div>
                  <div className="dual-range" ref={ageRangeRef}>
                    <div className="track"></div>
                    <div className="active-track" style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}></div>
                    <span className="knob left" onPointerDown={e => startDrag('min', e)} style={{ left: `calc(${minPct}% - 11px)` }}></span>
                    <span className="knob right" onPointerDown={e => startDrag('max', e)} style={{ left: `calc(${maxPct}% - 11px)` }}></span>
                  </div>
                  <div className="range-labels"><span>{AGE_MIN}</span><span>{AGE_MAX}</span></div>
                </div>

                <div className="range-block distance">
                  <div className="range-title">
                    <span>Distance</span><span>Up to {distanceKm} km</span>
                  </div>
                  <div className="single-range" ref={distRef} onPointerDown={startDist}>
                    <div className="track"></div>
                    <div className="active-track" style={{ right: `${100 - distPct}%` }}></div>
                    <span className="knob" style={{ left: `calc(${distPct}% - 11px)` }}></span>
                  </div>
                  <div className="distance-labels">
                    <span>{DISTANCE_STEPS[0]} km</span><span>{DISTANCE_STEPS[1]} km</span><span>{DISTANCE_STEPS[2]} km</span><span>{DISTANCE_STEPS[3]} km</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="premium">
              <div className="crown">♛</div>
              <div className="premium-copy">
                <div><strong>Advanced filters</strong> <em>Premium</em></div>
                <p>Go Premium to unlock more powerful filters<br className="desktop-break" /> and find your perfect match.</p>
              </div>
              <button className="upgrade" onClick={() => alert('Premium filters are ready for your upgrade flow.')}>Upgrade</button>
            </section>

            <section className="simple-row" onClick={() => { window.location.href = '/location.html?return=/edit-profile/preferences'; }}>
              <div className="left-content"><span className="outline-icon pin">⌾</span><strong>Location</strong></div>
              <div className="value">{locValue} <span className="chevron">›</span></div>
            </section>

            <section className="section relationship">
              <h3><span className="pink heart">♥</span> Relationship</h3>
              <div className="choice-card">
                {GOAL_OPTIONS.map(o => (
                  <button key={o.value} className={goals === o.value ? 'selected' : ''} onClick={() => setGoals(o.value)}>
                    {o.label}{goals === o.value && <span className="check">✓</span>}
                  </button>
                ))}
              </div>
            </section>

            <section className="section profile">
              <h3><span className="pink shield">◈</span> Profile Preferences</h3>
              <div className="switch-card">
                {switchItems.map(s => (
                  <div className="switch-row" key={s.key}>
                    <div className="switch-label"><span className={`${s.cls} icon`}>{s.icon}</span> {s.label}</div>
                    <button className={`switch ${switches[s.key] ? 'on' : ''}`} aria-label={s.label} onClick={() => setSwitches(prev => ({ ...prev, [s.key]: !prev[s.key] }))}><span></span></button>
                  </div>
                ))}
              </div>
            </section>

            <div className="bottom-actions">
              <button className="reset" onClick={handleReset}><span>↶</span> Reset Filters</button>
              <button className="apply" onClick={handleApply} disabled={saving}>
                <span>✓</span>{saved ? 'Filters Applied' : saving ? 'Applying…' : 'Apply Filters'}
              </button>
            </div>
          </main>
        </div>
      </main>
    </AppShell>
  );
}