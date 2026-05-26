'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { callService, userService } from '@/lib/appwrite/services';
import { MicIcon, MicOffIcon, VolumeIcon, VideoIcon, CallIcon } from '@/components/Icons';

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export default function CallPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const callType = searchParams.get('type') === 'video' ? 'video' : 'audio';
  const mode = searchParams.get('mode') || 'outgoing';
  const otherId = searchParams.get('otherId') || '';
  const matchId = params.id as string || '';

  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(true);
  const [statusText, setStatusText] = useState(mode === 'outgoing' ? 'Calling...' : 'Connecting...');
  const [otherName, setOtherName] = useState('User');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const unsubRef = useRef<{ unsubscribe: () => Promise<void> } | null>(null);

  const getOtherUserId = useCallback(() => {
    return otherId;
  }, [otherId]);

  useEffect(() => {
    if (!user?.$id) return;
    const uid = getOtherUserId();
    if (uid) {
      userService.getProfile(uid).then(p => {
        setOtherName((p as any)?.displayName || (p as any)?.fullName || 'User');
      }).catch(() => {});
    }
  }, [user?.$id, getOtherUserId]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isCallActive) {
      interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  useEffect(() => {
    if (!user?.$id) return;

    const uid = user.$id;
    const constraints: MediaStreamConstraints = {
      audio: true,
      video: callType === 'video' ? { width: { ideal: 640 }, height: { ideal: 480 } } : false,
    };

    async function setup() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection(RTC_CONFIG);
        pcRef.current = pc;

        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        pc.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
          setStatusText('Connected');
          setIsCallActive(true);
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const targetId = otherId;
            if (targetId) {
              callService.sendSignal({
                from: uid,
                to: targetId,
                matchId,
                type: 'ice-candidate',
                callType,
                data: JSON.stringify(event.candidate),
              });
            }
          }
        };

        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
            setStatusText('Call ended');
            setIsCallActive(false);
          }
        };

        const targetId = otherId;

        callService.subscribeToSignals(uid, async (signal: any) => {
          if (signal.from !== targetId) return;
          if (signal.type === 'answer') {
            try {
              const answer = JSON.parse(signal.data);
              if (answer.sdp) {
                await pc.setRemoteDescription(new RTCSessionDescription(answer));
              }
            } catch {}
          } else if (signal.type === 'ice-candidate') {
            try {
              const candidate = JSON.parse(signal.data);
              if (candidate.candidate) {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
              }
            } catch {}
          } else if (signal.type === 'end') {
            handleEndCall();
          }
        }).then(sub => { unsubRef.current = sub; });

        if (mode === 'outgoing') {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          if (targetId) {
            await callService.sendSignal({
              from: uid,
              to: targetId,
              matchId,
              type: 'offer',
              callType,
              data: JSON.stringify(offer),
            });
          }
        } else if (mode === 'incoming') {
          const offerId = searchParams.get('offerId') || '';
          if (offerId) {
            try {
              const offerDoc = await callService.getSignals(uid);
              const found = offerDoc.documents.find(d => d.$id === offerId);
              if (found) {
                const offer = JSON.parse(found.data);
                await pc.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                await callService.sendSignal({
                  from: uid,
                  to: otherId,
                  matchId,
                  type: 'answer',
                  callType,
                  data: JSON.stringify(answer),
                });
                setStatusText('Connected');
              }
            } catch {
              setStatusText('Connection failed');
            }
          }
        }
      } catch (err: any) {
        const msg = err?.message || '';
        const type = err?.type || '';
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setStatusText('Microphone permission denied');
        } else if (msg.includes('collection') || msg.includes('not found') || err.code === 404) {
          setStatusText('Missing callSignals collection in Appwrite');
        } else if (msg.includes('permission') || type === 'permission' || err.code === 401) {
          setStatusText('Appwrite permission error');
        } else {
          setStatusText('Failed to start call');
        }
        console.error('[Call] setup error:', err);
      }
    }

    setup();

    return () => {
      if (unsubRef.current) unsubRef.current.unsubscribe();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, [user?.$id, callType, mode, otherId, matchId, getOtherUserId]);

  useEffect(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(t => t.enabled = !isMuted);
    }
  }, [isMuted]);

  useEffect(() => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(t => t.enabled = isCameraOn);
    }
  }, [isCameraOn]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEndCall = async () => {
    setIsCallActive(false);
    if (user?.$id && otherId) {
      await callService.sendSignal({
        from: user.$id,
        to: otherId,
        matchId,
        type: 'end',
        data: JSON.stringify({ reason: 'ended' }),
      });
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (pcRef.current) pcRef.current.close();
    router.back();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0D0D0D, #1A0000, #0D0D0D)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Remote video */}
        {callType === 'video' && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {!remoteStream && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A1A1A' }}>
                <span style={{ fontSize: 80, fontWeight: 800, color: 'white', opacity: 0.3 }}>{otherName[0]}</span>
              </div>
            )}
          </div>
        )}

        {/* Local video (PiP) */}
        {callType === 'video' && (
          <div style={{ position: 'absolute', top: 60, right: 16, width: 100, height: 160, borderRadius: 16, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)' }}>
            <video ref={localVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
      </div>

      {/* Audio-only UI */}
      {callType === 'audio' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #FF375F, #FF3B30)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 40, fontWeight: 800, color: 'white' }}>{otherName[0]}</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', margin: 0 }}>{otherName}</h1>
          <p style={{ fontSize: 16, color: '#ABABAB', marginTop: 8, fontVariant: 'tabular-nums' }}>
            {isCallActive ? (statusText === 'Connected' ? formatDuration(callDuration) : statusText) : 'Call ended'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 40, marginTop: 40 }}>
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} style={{ width: 3, height: Math.random() * 30 + 5, backgroundColor: i % 2 === 0 ? '#FF375F' : '#FF3B30', borderRadius: 2 }} />
            ))}
          </div>
        </div>
      )}

      {/* Video + status text overlay */}
      {callType === 'video' && (
        <div style={{ position: 'absolute', top: 120, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{otherName}</h1>
          <p style={{ fontSize: 16, color: '#ccc', marginTop: 8, fontVariant: 'tabular-nums', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            {isCallActive ? (statusText === 'Connected' ? formatDuration(callDuration) : statusText) : 'Call ended'}
          </p>
        </div>
      )}

      <div style={{ padding: '0 24px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
          {callType === 'video' && (
            <button
              onClick={() => setIsCameraOn(!isCameraOn)}
              style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: !isCameraOn ? '#FF375F' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
            >
              {isCameraOn ? <VideoIcon size={24} color="white" /> : <VideoIcon size={24} color="white" />}
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
              onClick={() => router.replace(`/call/${matchId}?type=video&mode=${mode}&otherId=${otherId}`)}
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
