'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronBackIcon, CallIcon, VideoIcon, CheckmarkCircleIcon, CloseCircleIcon, EllipsisIcon } from '@/components/Icons';
import GradientBackground from '@/components/GradientBackground';
import TabBar from '@/components/TabBar';
import { useAuth } from '@/store/AuthContext';
import { callLogService, userService } from '@/lib/appwrite/services';
import { account } from '@/lib/appwrite/config';

interface CallLogEntry {
  $id: string;
  from: string;
  to: string;
  matchId: string;
  callType: 'audio' | 'video';
  status: 'answered' | 'missed' | 'declined';
  duration: number;
  createdAt: string;
  otherName?: string;
}

export default function CallLogsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [logs, setLogs] = useState<CallLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.$id) return;
    setLoading(true);
    callLogService.getCallLogs(user.$id)
      .then(async (docs: any[]) => {
        const enriched = await Promise.all(docs.map(async (d: any) => {
          const otherId = d.from === user.$id ? d.to : d.from;
          let name = 'User';
          try {
            const p = await userService.getProfile(otherId);
            name = (p as any)?.displayName || (p as any)?.fullName || 'User';
          } catch {}
          return { ...d, otherName: name } as CallLogEntry;
        }));
        setLogs(enriched);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user?.$id]);

  const formatDuration = (seconds: number) => {
    if (seconds <= 0) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 172800000) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getStatusIcon = (status: string, isOutgoing: boolean) => {
    if (status === 'answered') return <CheckmarkCircleIcon size={18} color="#34C759" />;
    if (status === 'missed') return isOutgoing ? <EllipsisIcon size={18} color="#ABABAB" /> : <CloseCircleIcon size={18} color="#FF3B30" />;
    return <CloseCircleIcon size={18} color="#FF3B30" />;
  };

  const getStatusText = (status: string, isOutgoing: boolean) => {
    if (status === 'answered') return '';
    if (status === 'missed') return isOutgoing ? 'No answer' : 'Missed';
    return isOutgoing ? 'Declined' : 'Declined';
  };

  return (
    <GradientBackground style={{ minHeight: '100vh', padding: '24px 16px 85px' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '56px 16px 12px', gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ChevronBackIcon size={28} color="white" />
        </button>
        <span style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>Call Log</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
          <span style={{ color: '#ABABAB', fontSize: 16 }}>Loading...</span>
        </div>
      ) : logs.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 16 }}>
          <CallIcon size={48} color="#6B6B6B" />
          <span style={{ color: '#6B6B6B', fontSize: 16 }}>No call history yet</span>
        </div>
      ) : (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {logs.map((log) => {
            const isOutgoing = log.from === user?.$id;
            return (
              <div key={log.$id} style={{ display: 'flex', alignItems: 'center', padding: '14px 8px', gap: 14, borderBottom: '1px solid #2A2A2A' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #FF375F, #FF3B30)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>{log.otherName?.[0] || '?'}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>{log.otherName}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {!isOutgoing && log.callType === 'video' ? <VideoIcon size={14} color="#ABABAB" /> : <CallIcon size={14} color="#ABABAB" />}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    {getStatusIcon(log.status, isOutgoing)}
                    <span style={{ fontSize: 13, color: log.status === 'missed' && !isOutgoing ? '#FF3B30' : '#ABABAB' }}>
                      {isOutgoing ? 'Outgoing' : 'Incoming'}
                      {getStatusText(log.status, isOutgoing) && ` · ${getStatusText(log.status, isOutgoing)}`}
                      {log.duration > 0 && ` · ${formatDuration(log.duration)}`}
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: '#6B6B6B', flexShrink: 0 }}>{formatDate(log.createdAt)}</span>
              </div>
            );
          })}
        </div>
      )}

      <TabBar />
    </GradientBackground>
  );
}
