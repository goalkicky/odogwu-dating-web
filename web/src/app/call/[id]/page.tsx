'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuth } from '@/store/AuthContext';
import { useCall } from '@/store/CallContext';
import { callService, userService, callLogService, turnService } from '@/lib/cloudflare/services';
import { takeStream, mediaConstraints, mediaErrorMessage } from '@/lib/media';
import { MicIcon, MicOffIcon, VolumeIcon, VideoIcon, CallIcon } from '@/components/Icons';

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.services.mozilla.com' },
    { urls: 'stun:stun.cloudflare.com:3478' },
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
  const [timerActive, setTimerActive] = useState(false);
  const answeredRef = useRef(false);
  const endedRef = useRef(false);
  const [otherName, setOtherName] = useState('User');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const { onSignal } = useCall();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const unsubRef = useRef<{ unsubscribe: () => void } | null>(null);

  const [debugLog, setDebugLog] = useState<string[]>([]);
  const debug = (msg: string) => {
    const line = `[${new Date().toISOString().slice(11, 19)}] ${msg}`;
    console.log('[CallDebug]', line);
    setDebugLog(prev => [...prev.slice(-18), line]);
  };

  const durationRef = useRef(0);

  useEffect(() => {
    durationRef.current = callDuration;
  }, [callDuration]);

  useEffect(() => {
    if (!user?.$id) return;
    const uid = otherId;
    if (uid) {
      userService.getProfile(uid).then(p => {
        setOtherName((p as any)?.displayName || (p as any)?.fullName || 'User');
      }).catch(() => {});
    }
  }, [user?.$id, otherId]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive) {
      interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  useEffect(() => {
    if (!user?.$id) return;

    const uid = user.$id;
    const targetId = otherId;
    const constraints = mediaConstraints(callType);

    let disposed = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let remoteDescSet = false;
    const pendingCandidates: RTCIceCandidateInit[] = [];

    const stopPoll = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };

    const clearTimeoutIfAny = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const addCandidate = async (candidate: RTCIceCandidateInit) => {
      const pc = pcRef.current;
      if (!pc || disposed) return;
      if (!remoteDescSet) {
        pendingCandidates.push(candidate);
        return;
      }
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {}
    };

    const drainCandidates = async () => {
      const pc = pcRef.current;
      if (!pc || disposed) return;
      const batch = pendingCandidates.splice(0, pendingCandidates.length);
      for (const c of batch) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        } catch {}
      }
    };

    const applyAnswer = async (answerDoc: any) => {
      try {
        const answer = JSON.parse(answerDoc.data || answerDoc);
        if (!answer.sdp) return false;
        await pcRef.current!.setRemoteDescription(new RTCSessionDescription(answer));
        remoteDescSet = true;
        clearTimeoutIfAny();
        stopPoll();
        debug('answer applied, remoteDescription set');
        await drainCandidates();
        return true;
      } catch (e) {
        debug('applyAnswer failed: ' + (e as any)?.message);
        return false;
      }
    };

    const applyOfferAndAnswer = async (offerDoc: any) => {
      try {
        const offer = JSON.parse(offerDoc.data || offerDoc);
        if (!offer.sdp) return;
        await pcRef.current!.setRemoteDescription(new RTCSessionDescription(offer));
        remoteDescSet = true;
        const answer = await pcRef.current!.createAnswer();
        await pcRef.current!.setLocalDescription(answer);
        if (targetId) {
          await callService.sendSignal({
            from: uid,
            to: targetId,
            matchId,
            type: 'answer',
            callType,
            data: JSON.stringify(answer),
          });
          debug('answer sent to ' + targetId);
        }
          setStatusText('Connecting...');
          clearTimeoutIfAny();
          await drainCandidates();
      } catch (e) {
        debug('applyOfferAndAnswer failed: ' + (e as any)?.message);
        setStatusText('Connection failed');
      }
    };

    async function setup() {
      try {
        const [preStream, turnIce] = await Promise.all([
          Promise.resolve(takeStream()),
          turnService.getIceServers().catch(() => [] as RTCIceServer[]),
        ]);
        const stream = preStream || await navigator.mediaDevices.getUserMedia(constraints);
        if (disposed) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        debug('media ready: ' + (preStream ? 'pre-acquired' : 'getUserMedia') + ' (' + callType + '), turn=' + turnIce.length + ' servers');
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const iceServers = [...RTC_CONFIG.iceServers, ...turnIce];
        const pc = new RTCPeerConnection({ iceServers });
        pcRef.current = pc;
        debug('peerConnection created, iceServers=' + iceServers.length + ' (mode=' + mode + ')');

        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });

        pc.ontrack = (event) => {
          clearTimeoutIfAny();
          stopPoll();
          setRemoteStream(event.streams[0]);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
          debug('REMOTE TRACK RECEIVED');
        };

        let candidateCount = 0;
        pc.onicecandidate = (event) => {
          if (event.candidate && targetId && !disposed) {
            candidateCount++;
            if (candidateCount <= 5 || candidateCount % 10 === 0) {
              debug('sent ICE candidate #' + candidateCount + ' (' + (event.candidate.type || '?') + ')');
            }
            callService.sendSignal({
              from: uid,
              to: targetId,
              matchId,
              type: 'ice-candidate',
              callType,
              data: JSON.stringify(event.candidate),
            });
          }
        };

        pc.oniceconnectionstatechange = () => {
          debug('iceConnectionState: ' + pc.iceConnectionState);
        };

        pc.onconnectionstatechange = () => {
          debug('connectionState: ' + pc.connectionState);
          if (pc.connectionState === 'connected') {
            answeredRef.current = true;
            clearTimeoutIfAny();
            stopPoll();
            setStatusText('Connected');
            setIsCallActive(true);
            setTimerActive(true);
          } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
            setStatusText('Call ended');
            setIsCallActive(false);
            clearTimeoutIfAny();
          }
        };

        const unsubFn = onSignal(async (signal: any) => {
          if (disposed) return;
          debug('signal received: type=' + signal.type + ' from=' + signal.from);
          if (signal.from !== targetId) return;
          if (signal.type === 'answer' && mode === 'outgoing') {
            await applyAnswer(signal);
          } else if (signal.type === 'offer' && mode === 'incoming' && !remoteDescSet) {
            await applyOfferAndAnswer(signal);
          } else if (signal.type === 'ice-candidate') {
            try {
              const candidate = JSON.parse(signal.data);
              if (candidate.candidate) {
                await addCandidate(candidate);
              }
            } catch {}
          } else if (signal.type === 'end' && signal.from === targetId) {
            handleEndCall();
          }
        });
        unsubRef.current = { unsubscribe: unsubFn };

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
            debug('offer sent to ' + targetId + ' (sdp has ' + (offer.sdp?.match(/m=/g) || []).length + ' m-lines)');
            timeoutId = setTimeout(() => {
              if (!disposed && !answeredRef.current) {
                setStatusText('Missed call');
                setIsCallActive(false);
                callLogService.createCallLog({
                  from: uid,
                  to: targetId,
                  matchId,
                  callType,
                  status: 'missed',
                  duration: 0,
                }).catch(() => {});
                if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
                if (pcRef.current) pcRef.current.close();
              }
            }, 60000);
          }

          let pollTimer: ReturnType<typeof setInterval> | null = null;
          const pollAnswer = async () => {
            if (disposed || !targetId || answeredRef.current) return;
            try {
              const docs = (await callService.getSignals(uid)) as any[];
              const answer = docs.find((d: any) => d.from === targetId && d.type === 'answer' && !remoteDescSet);
              if (answer) {
                debug('fallback poll found answer');
                await applyAnswer(answer);
              }
              for (const d of docs) {
                if (d.from === targetId && d.type === 'ice-candidate') {
                  try {
                    const cand = JSON.parse(d.data);
                    if (cand.candidate) await addCandidate(cand);
                  } catch {}
                }
              }
            } catch {}
          };
          pollAnswer();
          pollTimer = setInterval(pollAnswer, 5000);
        } else if (mode === 'incoming') {
          const offerId = searchParams.get('offerId') || '';
          try {
            const docs = (await callService.getSignals(uid)) as any[];
            debug('incoming getSignals: ' + docs.length + ' docs, offerId=' + offerId);
            const offerDoc = offerId
              ? docs.find((d: any) => d.$id === offerId)
              : docs.find((d: any) => d.from === targetId && d.type === 'offer');
            if (offerDoc && !remoteDescSet) {
              debug('incoming offer found, applying');
              await applyOfferAndAnswer(offerDoc);
            } else if (!offerDoc) {
              debug('incoming offer NOT FOUND');
            }
            for (const d of docs) {
              if (d.from === targetId && d.type === 'ice-candidate') {
                try {
                  const cand = JSON.parse(d.data);
                  if (cand.candidate) await addCandidate(cand);
                } catch {}
              }
            }
            await drainCandidates();
            if (!offerDoc) {
              setStatusText('Connection failed');
            }
          } catch {
            setStatusText('Connection failed');
          }
        }
      } catch (err: any) {
        debug('setup error: name=' + err?.name + ' msg=' + (err?.message || ''));
        const msg = err?.message || '';
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setStatusText(mediaErrorMessage(err));
        } else if (msg.includes('not found') || err.code === 404) {
          setStatusText('Call setup failed');
        } else if (msg.includes('permission') || err.code === 401) {
          setStatusText('Permission error');
        } else {
          setStatusText('Failed to start call');
        }
        console.error('[Call] setup error:', err);
      }
    }

    setup();

    return () => {
      disposed = true;
      clearTimeoutIfAny();
      stopPoll();
      if (unsubRef.current) unsubRef.current.unsubscribe();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, [user?.$id, callType, mode, otherId, matchId, onSignal]);

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
    if (endedRef.current) return;
    endedRef.current = true;
    setIsCallActive(false);
    if (user?.$id && otherId) {
      await callService.sendSignal({
        from: user.$id,
        to: otherId,
        matchId,
        type: 'end',
        data: JSON.stringify({ reason: 'ended' }),
      });
        callLogService.createCallLog({
          from: user.$id,
          to: otherId,
          matchId,
          callType,
          status: answeredRef.current ? 'answered' : 'missed',
          duration: answeredRef.current ? durationRef.current : 0,
        }).catch(() => {});
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (pcRef.current) pcRef.current.close();
    router.back();
  };

  return (
    <div style={{ minHeight: '100svh', background: 'linear-gradient(135deg, #0D0D0D, #1A0000, #0D0D0D)', display: 'flex', flexDirection: 'column' }}>
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

      <details style={{ position: 'fixed', bottom: 8, left: 8, zIndex: 999, maxWidth: '90vw', color: '#bbb', fontSize: 11, background: 'rgba(0,0,0,0.75)', borderRadius: 8, padding: '6px 10px' }}>
        <summary style={{ cursor: 'pointer' }}>Debug ({debugLog.length})</summary>
        <pre style={{ whiteSpace: 'pre-wrap', margin: '6px 0 0', maxHeight: 200, overflowY: 'auto', fontFamily: 'monospace' }}>{debugLog.join('\n')}</pre>
      </details>
    </div>
  );
}
