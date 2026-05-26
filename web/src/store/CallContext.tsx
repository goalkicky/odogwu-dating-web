'use client';
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './AuthContext';
import { callService, userService, callLogService } from '@/lib/appwrite/services';

interface IncomingCall {
  from: string;
  matchId: string;
  callType: 'audio' | 'video';
  callerName: string;
  signalDocId: string;
  offerData: string;
}

type SignalCallback = (signal: any) => void;

interface CallContextType {
  incomingCall: IncomingCall | null;
  dismissCall: () => void;
  onSignal: (cb: SignalCallback) => () => void;
}

const CallContext = createContext<CallContextType>({
  incomingCall: null,
  dismissCall: () => {},
  onSignal: () => () => {},
});

export const useCall = () => useContext(CallContext);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const unsubRef = useRef<{ unsubscribe: () => Promise<void> } | null>(null);
  const listenersRef = useRef<Set<SignalCallback>>(new Set());

  const onSignal = useCallback((cb: SignalCallback) => {
    listenersRef.current.add(cb);
    return () => { listenersRef.current.delete(cb); };
  }, []);

  useEffect(() => {
    if (!user?.$id) return;

    callService.subscribeToSignals(user.$id, async (signal: any) => {
      listenersRef.current.forEach(cb => cb(signal));
      if (signal.type === 'offer') {
        let name = 'Someone';
        try {
          const profile = await userService.getProfile(signal.from);
          name = (profile as any).displayName || (profile as any).fullName || 'Someone';
        } catch {}
        setIncomingCall({
          from: signal.from,
          matchId: signal.matchId,
          callType: signal.callType || 'audio',
          callerName: name,
          signalDocId: signal.$id,
          offerData: signal.data,
        });
      }
    }).then(sub => { unsubRef.current = sub; });

    return () => { if (unsubRef.current) unsubRef.current.unsubscribe(); };
  }, [user?.$id]);

  const dismissCall = useCallback(() => setIncomingCall(null), []);

  return (
    <CallContext.Provider value={{ incomingCall, dismissCall, onSignal }}>
      {children}
      {incomingCall && <IncomingCallOverlay call={incomingCall} onDismiss={dismissCall} />}
    </CallContext.Provider>
  );
}

function IncomingCallOverlay({ call, onDismiss }: { call: IncomingCall; onDismiss: () => void }) {
  const { user } = useAuth();
  const router = useRouter();

  const handleAccept = async () => {
    onDismiss();
    router.push(`/call/${call.matchId}?type=${call.callType}&mode=incoming&otherId=${call.from}&offerId=${call.signalDocId}`);
  };

  const handleDecline = async () => {
    await callService.sendSignal({
      from: user!.$id,
      to: call.from,
      matchId: call.matchId,
      type: 'end',
      data: JSON.stringify({ reason: 'declined' }),
    });
    callLogService.createCallLog({
      from: call.from,
      to: user!.$id,
      matchId: call.matchId,
      callType: call.callType,
      status: 'declined',
      duration: 0,
    }).catch(() => {});
    onDismiss();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(135deg, #0D0D0D, #1A0000)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 32, padding: 24
    }}>
      <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #FF375F, #FF3B30)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 40, fontWeight: 800, color: 'white' }}>{call.callerName[0]}</span>
      </div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', margin: 0 }}>{call.callerName}</h1>
      <p style={{ fontSize: 16, color: '#ABABAB', margin: 0 }}>
        Incoming {call.callType === 'video' ? 'video' : 'audio'} call...
      </p>
      <div style={{ display: 'flex', gap: 40, marginTop: 40 }}>
        <button onClick={handleDecline} style={{ width: 72, height: 72, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #FF3B30, #FF6B6B)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(135deg)' }}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </button>
        <button onClick={handleAccept} style={{ width: 72, height: 72, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #34C759, #30D158)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
