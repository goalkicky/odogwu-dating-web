'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronForwardIcon, EyeIcon, GlobeIcon, InfoIcon, PersonIcon } from '@/components/Icons';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/store/AuthContext';
import { userService, blockService } from '@/lib/cloudflare/services';

function Switch({ checked, onToggle, disabled }: { checked: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      aria-label={checked ? 'On' : 'Off'}
      style={{
        width: 48, height: 28, borderRadius: 9999, border: 'none', padding: 0, position: 'relative',
        cursor: disabled ? 'default' : 'pointer', flexShrink: 0, transition: 'background 0.2s',
        background: checked ? 'linear-gradient(135deg, #FF2E5F, #B44CFF)' : '#D0D0D5',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: checked ? 23 : 3, width: 22, height: 22, borderRadius: 9999,
        background: 'white', transition: 'left 0.2s', boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

export default function PrivacyPage() {
  const router = useRouter();
  const { profile, user, refreshUser } = useAuth();

  const [visibility, setVisibility] = useState<'everyone' | 'matches_only'>('everyone');
  const [showOnline, setShowOnline] = useState(true);
  const [dataAnalytics, setDataAnalytics] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blockedCount, setBlockedCount] = useState<number | null>(null);

  useEffect(() => {
    if (!profile) return;
    setVisibility(profile.profileVisibility === 'matches_only' ? 'matches_only' : 'everyone');
    setShowOnline(profile.showOnlineStatus !== false);
    setDataAnalytics(profile.dataAnalytics !== false);
  }, [profile]);

  useEffect(() => {
    blockService.list().then(docs => setBlockedCount(docs.length)).catch(() => {});
  }, []);

  const persist = async (patch: Record<string, unknown>) => {
    if (!user?.$id) return;
    setSaving(true);
    try {
      await userService.updateProfile(user.$id, patch as any);
      await refreshUser();
    } catch {
      await refreshUser();
    }
    setSaving(false);
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 12,
    backgroundColor: '#F6F6F9', border: 'none', textAlign: 'left', width: '100%',
  };

  return (
    <AppShell>
      <div>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#FF2E5F', fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: '8px 0', marginBottom: 8 }}>
          ← Back
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#151515', margin: '0 0 24px' }}>Privacy</h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#8A8A8F', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>
            Who can see you
          </div>
          <div style={rowStyle}>
            <EyeIcon size={20} color="#FF7BA0" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, color: '#151515' }}>Profile Visibility</div>
              <div style={{ fontSize: 12, color: '#8A8A8F', marginTop: 2 }}>
                {visibility === 'everyone' ? 'Anyone on Odogwu Dating can find your profile' : 'Only your matches can see your profile'}
              </div>
            </div>
          </div>
          <div style={{ padding: '8px 16px 16px', backgroundColor: '#F6F6F9', display: 'flex', gap: 8 }}>
            <button
              onClick={() => { if (!saving) { setVisibility('everyone'); persist({ profileVisibility: 'everyone' }); } }}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
                background: visibility === 'everyone' ? 'linear-gradient(135deg, #FF2E5F, #B44CFF)' : '#EDEDF1',
                color: visibility === 'everyone' ? 'white' : '#8A8A8F',
              }}
            >
              Everyone
            </button>
            <button
              onClick={() => { if (!saving) { setVisibility('matches_only'); persist({ profileVisibility: 'matches_only' }); } }}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
                background: visibility === 'matches_only' ? 'linear-gradient(135deg, #FF2E5F, #B44CFF)' : '#EDEDF1',
                color: visibility === 'matches_only' ? 'white' : '#8A8A8F',
              }}
            >
              Only Matches
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#8A8A8F', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>
            Your activity
          </div>
          <div style={rowStyle}>
            <GlobeIcon size={20} color="#FF7BA0" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, color: '#151515' }}>Online Status</div>
              <div style={{ fontSize: 12, color: '#8A8A8F', marginTop: 2 }}>
                {showOnline ? 'Show when you are active' : 'Hide when you are active'}
              </div>
            </div>
            <Switch checked={showOnline} disabled={saving} onToggle={() => { setShowOnline(!showOnline); persist({ showOnlineStatus: !showOnline }); }} />
          </div>
          <div style={rowStyle}>
            <InfoIcon size={20} color="#FF7BA0" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, color: '#151515' }}>Data & Analytics</div>
              <div style={{ fontSize: 12, color: '#8A8A8F', marginTop: 2 }}>
                {dataAnalytics ? 'Help us improve Odogwu Dating with anonymous usage data' : 'Your usage data is not used for analytics'}
              </div>
            </div>
            <Switch checked={dataAnalytics} disabled={saving} onToggle={() => { setDataAnalytics(!dataAnalytics); persist({ dataAnalytics: !dataAnalytics }); }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, borderRadius: 12, overflow: 'hidden' }}>
          <button onClick={() => router.push('/privacy/blocked')} style={{ ...rowStyle, cursor: 'pointer' }}>
            <PersonIcon size={20} color="#FF7BA0" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, color: '#151515' }}>Blocked Users</div>
              <div style={{ fontSize: 12, color: '#8A8A8F', marginTop: 2 }}>
                {blockedCount === null ? 'Manage users you have blocked' : `${blockedCount} blocked user${blockedCount === 1 ? '' : 's'}`}
              </div>
            </div>
            <ChevronForwardIcon size={18} color="#8A8A8F" />
          </button>
          <button onClick={() => router.push('/privacy/policy')} style={{ ...rowStyle, cursor: 'pointer' }}>
            <EyeIcon size={20} color="#FF7BA0" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, color: '#151515' }}>Privacy Policy</div>
              <div style={{ fontSize: 12, color: '#8A8A8F', marginTop: 2 }}>Read how we handle your data</div>
            </div>
            <ChevronForwardIcon size={18} color="#8A8A8F" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
