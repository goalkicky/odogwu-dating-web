'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/store/AuthContext';
import { userService } from '@/lib/cloudflare/services';
import { account } from '@/lib/cloudflare/config';
import { INTEREST_CATEGORIES, interestCategory } from '@/lib/interests';
import type { InterestCategory } from '@/lib/interests';
import { INTERESTS_TEMPLATE_CSS } from '@/lib/interestsTemplateStyles';

const MAX_INTERESTS = 10;

export default function InterestsPage() {
  const router = useRouter();
  const { profile, refreshUser } = useAuth();

  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (profile) setSelected(profile.interests || []);
  }, [profile]);

  const toggle = (cat: InterestCategory | undefined, opt: string) => {
    setSelected(prev => {
      if (prev.includes(opt)) return prev.filter(x => x !== opt);
      const rest = cat ? prev.filter(x => interestCategory(x)?.label !== cat.label) : prev;
      if (rest.length >= MAX_INTERESTS) return prev;
      return [...rest, opt];
    });
  };

  const q = query.trim().toLowerCase();
  const sections = q
    ? INTEREST_CATEGORIES.map(cat => ({ ...cat, items: cat.items.filter(i => i.toLowerCase().includes(q)) })).filter(cat => cat.items.length > 0)
    : INTEREST_CATEGORIES;

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = await account!.get();
      await userService.updateProfile(user.$id, { interests: selected } as any);
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
      <style jsx global>{INTERESTS_TEMPLATE_CSS}</style>

      <main className="pi">
        <div className="app-shell">
          <header className="head">
            <button className="back" aria-label="Go back" onClick={() => router.back()}>‹</button>
            <h1>Your Interests</h1>
            <div className="counttop" id="count">{selected.length}/{MAX_INTERESTS} selected</div>
            <p>Select one interest from each category.</p>
          </header>

          <div className="search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input placeholder="Search interest or language" value={query} onChange={e => setQuery(e.target.value)} />
          </div>

          {sections.map(cat => (
            <section key={cat.label}>
              <h2 className="title">{cat.label}</h2>
              <div className="grid">
                {cat.items.map(item => {
                  const sel = selected.includes(item);
                  return (
                    <button className={`lang${sel ? ' selected' : ''}`} key={item} onClick={() => toggle(cat, item)}>
                      <span>{item}</span>
                      <span className="plus">+</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

          <div className="selectedArea">
            <div className="selhead">
              <h2>Your Selected Interests ({selected.length})</h2>
              {selected.length > 0 && (
                <button className="clear" onClick={() => setSelected([])}>Clear all</button>
              )}
            </div>

            {selected.length > 0 && (
              <div className="selchips" id="chips">
                {selected.map(item => (
                  <div className="chip" key={item}>
                    <span>{item}</span>
                    <button className="x" aria-label={`Remove ${item}`} onClick={() => toggle(interestCategory(item), item)}>×</button>
                  </div>
                ))}
              </div>
            )}

            <div className="empty" id="empty">
              <div className="emptyIcon">
                <span className="globe">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
                </span>
                <span className="bubble b1">…</span>
                <span className="bubble b2">…</span>
              </div>
              <p id="emptyText">{selected.length > 0 ? `${selected.length} interest${selected.length > 1 ? 's' : ''} selected.` : 'You haven\'t selected any interest yet.'}</p>
            </div>
          </div>

          <button className="save" id="saveBtn" onClick={handleSave} disabled={saving}>
            {done ? 'Saved ✓' : saving ? 'Saving...' : 'Save Interests'}
          </button>
          <div className="home-indicator"></div>
        </div>
      </main>
    </AppShell>
  );
}