'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { MicIcon, MicOffIcon, VolumeIcon, VideoIcon, CallIcon } from '@/components/Icons';

export default function CallPage() {
  const router = useRouter();
  useParams();
  const searchParams = useSearchParams();
  const callTypeParam = searchParams.get('type');

  const [callType, setCallType] = useState<'audio' | 'video'>(callTypeParam === 'video' ? 'video' : 'audio');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(true);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isCallActive) {
      interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    router.back();
  };

  const matchName = 'Sarah Johnson';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0D0D0D, #1A0000, #0D0D0D)', display: 'flex', flexDirection: 'column' }}>
      {callType === 'video' && (
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A1A1A', minHeight: '300px' }}>
            <span style={{ fontSize: 80, fontWeight: 800, color: 'white', opacity: 0.3 }}>{matchName[0]}</span>
          </div>
          <div style={{ position: 'absolute', top: 60, right: 16, width: 100, height: 160, borderRadius: 16, overflow: 'hidden', background: 'linear-gradient(135deg, #FF375F, #FF3B30)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
        <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #FF375F, #FF3B30)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 40, fontWeight: 800, color: 'white' }}>{matchName[0]}</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', margin: 0 }}>{matchName}</h1>
        <p style={{ fontSize: 16, color: '#ABABAB', marginTop: 8, fontVariant: 'tabular-nums' }}>
          {isCallActive ? formatDuration(callDuration) : 'Call ended'}
        </p>

        {callType === 'audio' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 40, marginTop: 40 }}>
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} style={{ width: 3, height: Math.random() * 30 + 5, backgroundColor: i % 2 === 0 ? '#FF375F' : '#FF3B30', borderRadius: 2 }} />
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '0 24px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
          {callType === 'video' && (
            <button
              onClick={() => setIsCameraOn(!isCameraOn)}
              style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: !isCameraOn ? '#FF375F' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
            >
              {isCameraOn ? <VideoIcon size={24} color="white" /> : <VideoOffIcon size={24} color="white" />}
              <span style={{ position: 'absolute', bottom: -18, fontSize: 10, color: '#ABABAB', fontWeight: 500 }}>{isCameraOn ? 'Camera' : 'Off'}</span>
            </button>
          )}

          <button
            onClick={() => setIsMuted(!isMuted)}
            style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: isMuted ? '#FF375F' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
          >
            {isMuted ? <MicOffIcon size={24} color="white" /> : <MicIcon size={24} color="white" />}
            <span style={{ position: 'absolute', bottom: -18, fontSize: 10, color: '#ABABAB', fontWeight: 500 }}>{isMuted ? 'Muted' : 'Mute'}</span>
          </button>

          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: isSpeakerOn ? '#FF375F' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
          >
            <VolumeIcon size={24} color="white" />
            <span style={{ position: 'absolute', bottom: -18, fontSize: 10, color: '#ABABAB', fontWeight: 500 }}>{isSpeakerOn ? 'Speaker' : 'Phone'}</span>
          </button>

          {callType === 'audio' && (
            <button
              onClick={() => setCallType('video')}
              style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
            >
              <VideoIcon size={24} color="white" />
              <span style={{ position: 'absolute', bottom: -18, fontSize: 10, color: '#ABABAB', fontWeight: 500 }}>Video</span>
            </button>
          )}
        </div>

        <button onClick={handleEndCall} style={{ width: 72, height: 72, borderRadius: '50%', border: 'none', cursor: 'pointer', overflow: 'hidden', background: 'none' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #FF3B30, #FF6B6B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ transform: 'rotate(135deg)', display: 'flex' }}>
              <CallIcon size={32} color="white" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

function VideoOffIcon({ size, color }: { size?: number; color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}
