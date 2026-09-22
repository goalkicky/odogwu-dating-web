'use client';
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  SendIcon, PencilIcon, CloseCircleIcon, HappyIcon, KeypadIcon, CoinsIcon,
} from '@/components/Icons';

import { useAuth } from '@/store/AuthContext';
import { messageService, storageService, matchService, userService, walletService, callLogService } from '@/lib/cloudflare/services';
import { captureStream, mediaConstraints, mediaErrorMessage } from '@/lib/media';
import Button from '@/components/Button';
import type { Message } from '@/lib/types';

const EMOJIS = ['😀', '😂', '❤️', '🔥', '😍', '🥰', '😘', '💕', '😊', '😎', '🙌', '👋', '💪', '✨', '🌟', '🎉', '🎂', '🍕', '☕', '🌮'];
const REACTIONS = ['❤️', '😂', '🔥', '😍', '👍', '😮'];

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  return `${m}:${(seconds % 60).toString().padStart(2, '0')}`;
}

function formatTime(iso: string) {
  try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return iso; }
}

function sameDay(a: string, b: string) {
  const x = new Date(a), y = new Date(b);
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
}

function dateDivider(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(now) - day(d)) / 86400000);
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: 'rgba(255,230,0,0.3)', color: 'inherit', borderRadius: 3, padding: '0 2px' }}>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function VoiceBubble({ url, isMe }: { url: string; isMe: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopPrevRef = useRef<() => void>(() => {});
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const bars = useMemo(() => Array.from({ length: 24 }, (_, i) => 5 + (hashStr(url + i) % 20)), [url]);

  const toggle = () => {
    if (!audioRef.current) {
      const a = new Audio(url);
      audioRef.current = a;
      a.ontimeupdate = () => setElapsed(a.currentTime);
      a.onended = () => { setPlaying(false); setElapsed(0); };
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      stopPrevRef.current();
      stopPrevRef.current = () => {
        if (audioRef.current) { audioRef.current.pause(); setPlaying(false); }
      };
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  useEffect(() => () => { audioRef.current?.pause(); }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 170 }}>
      <button
        onClick={toggle}
        style={{
          width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
          background: isMe ? 'rgba(255,255,255,0.55)' : 'linear-gradient(135deg, #d91b70, #ff5e8f)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {playing ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="white"><polygon points="6 3 20 12 6 21 6 3"/></svg>
        )}
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 26 }}>
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              width: 3, height: h, borderRadius: 2,
              background: isMe ? 'rgba(0,0,0,0.45)' : '#d91b70',
              transformOrigin: 'center',
              animation: playing ? `equalizer 0.9s ease-in-out ${(i % 6) * 0.12}s infinite` : 'none',
              opacity: playing ? 0.9 : 0.4,
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 13, color: isMe ? '#8b8b91' : '#8a8a8f', fontVariant: 'tabular-nums', minWidth: 34 }}>{formatDuration(Math.round(elapsed))}</span>
    </div>
  );
}

function docToMessage(d: any): Message {
  return {
    id: d.$id || d.id,
    matchId: d.matchId,
    senderId: d.senderId,
    text: d.text,
    type: d.type,
    mediaUrl: d.mediaUrl,
    replyTo: d.replyTo ? (typeof d.replyTo === 'string' ? JSON.parse(d.replyTo) : d.replyTo) : undefined,
    editedAt: d.editedAt,
    createdAt: d.createdAt,
    readAt: d.readAt,
    reactions: (d.reactions as string[]) || [],
  };
}

function resolveMediaUrl(url: string): string {
  return url.startsWith('blob:') || url.startsWith('data:') ? url : storageService.getFilePreview(url);
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { profile, user } = useAuth();
  const matchId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [callLogs, setCallLogs] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; text: string; senderId: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingLocked, setRecordingLocked] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [matchName, setMatchName] = useState('User');
  const [otherUserId, setOtherUserId] = useState('');
  const [otherProfile, setOtherProfile] = useState<any>(null);
  const [otherOnline, setOtherOnline] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingImage, setSendingImage] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showGift, setShowGift] = useState(false);
  const [giftAmount, setGiftAmount] = useState(5);
  const [gifting, setGifting] = useState(false);
  const [myCoins, setMyCoins] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const attachRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const unsubRef = useRef<{ unsubscribe: () => Promise<void> } | null>(null);

  const userId = (profile as any)?.$id || user?.$id;

  const otherAvatarUrl = otherProfile?.photos?.[0] ? storageService.getFilePreview(otherProfile.photos[0]) : '';

  const recBars = useMemo(() => Array.from({ length: 16 }, (_, i) => 6 + ((i * 13) % 18)), []);

  useEffect(() => {
    if (!matchId || !userId) return;
    matchService.getMatch(matchId).then(doc => {
      const other = (doc as any).userId === userId ? (doc as any).matchedUserId : (doc as any).userId;
      setOtherUserId(other);
      userService.getProfile(other).then(p => {
        setOtherProfile(p);
        setMatchName((p as any).displayName || (p as any).fullName || 'User');
        const lastActive = (p as any).lastActive;
        setOtherOnline(!!lastActive && Date.now() - new Date(lastActive).getTime() < 120000);
      }).catch(() => {});
    }).catch(() => {});
    messageService.getMessages(matchId).then(res => {
      const msgs = (res.documents || []).map(docToMessage);
      setMessages(msgs);
    }).catch(() => {});
    callLogService.getCallLogsForMatch(matchId).then(logs => {
      setCallLogs(logs);
    }).catch(() => {});

    messageService.subscribeToMessages(matchId, (msg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        const cleaned = prev.filter(m => !(m.id.startsWith('temp-') && m.senderId === msg.senderId && m.text === msg.text && m.type === msg.type));
        return [...cleaned, msg];
      });
    }).then(sub => { unsubRef.current = sub; });
    return () => { if (unsubRef.current) unsubRef.current.unsubscribe(); };
  }, [matchId, userId]);

  useEffect(() => {
    if (!otherUserId) return;
    const checkOnline = () => {
      userService.getProfile(otherUserId).then(p => {
        const lastActive = (p as any).lastActive;
        setOtherOnline(!!lastActive && Date.now() - new Date(lastActive).getTime() < 120000);
      }).catch(() => {});
    };
    const id = setInterval(checkOnline, 30000);
    return () => clearInterval(id);
  }, [otherUserId]);

  useEffect(() => {
    if (searchParams?.get('gift') === '1') setShowGift(true);
    walletService.getWallet().then(w => setMyCoins(w?.coins ?? 0)).catch(() => {});
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const visibleMessages = useMemo(() => {
    const items: Array<{ kind: 'msg'; msg: Message } | { kind: 'call'; log: any }> = messages.map(m => ({ kind: 'msg' as const, msg: m }));
    for (const log of callLogs) {
      items.push({ kind: 'call', log });
    }
    items.sort((a, b) => {
      const ta = a.kind === 'msg' ? new Date(a.msg.createdAt).getTime() : new Date(a.log.createdAt).getTime();
      const tb = b.kind === 'msg' ? new Date(b.msg.createdAt).getTime() : new Date(b.log.createdAt).getTime();
      return ta - tb;
    });
    return items;
  }, [messages, callLogs]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !userId || sending) return;
    setSending(true);
    try {
      if (editingId) {
        await messageService.editMessage(editingId, text);
        setMessages(prev => prev.map(m => m.id === editingId ? { ...m, text, editedAt: new Date().toISOString() } : m));
        setEditingId(null);
      } else {
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const optimistic: Message = {
          id: tempId,
          matchId,
          senderId: userId,
          text,
          type: 'text',
          replyTo: replyTo || undefined,
          createdAt: new Date().toISOString(),
          readAt: new Date().toISOString(),
          reactions: [],
        };
        setMessages(prev => [...prev, optimistic]);
        try {
          const doc = await messageService.sendMessage(matchId, userId, { text, type: 'text', replyTo: replyTo || undefined });
          if (doc && (doc.$id || doc.id)) {
            setMessages(prev => prev.map(m => m.id === tempId ? docToMessage(doc) : m));
          } else {
            setMessages(prev => prev.filter(m => m.id !== tempId));
          }
        } catch {
          setMessages(prev => prev.filter(m => m.id !== tempId));
        }
      }
      setInputText('');
      setReplyTo(null);
      setShowEmoji(false);
    } catch {}
    setSending(false);
  };

  const toggleReaction = useCallback((msg: Message, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msg.id) return m;
      const reactions = [...(m.reactions || [])];
      const i = reactions.indexOf(emoji);
      if (i >= 0) reactions.splice(i, 1); else reactions.push(emoji);
      messageService.reactToMessage(msg.id, reactions).catch(() => {});
      return { ...m, reactions };
    }));
  }, []);

  const handleAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !userId || sendingImage) return;
    if (!file.type.startsWith('image/')) return;
    setSendingImage(true);

    const tempId = `temp-img-${Date.now()}`;
    const localUrl = URL.createObjectURL(file);
    const optimistic: Message = {
      id: tempId,
      matchId,
      senderId: userId,
      text: '',
      type: 'image',
      mediaUrl: localUrl,
      createdAt: new Date().toISOString(),
      reactions: [],
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const uploaded = await storageService.uploadFile(file);
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, mediaUrl: storageService.getFilePreview(uploaded.$id) } : m));
      const doc = await messageService.sendMessage(matchId, userId, { type: 'image', mediaUrl: uploaded.$id });
      if (doc && (doc.$id || doc.id)) {
        setMessages(prev => prev.map(m => m.id === tempId ? docToMessage(doc) : m));
      } else {
        setMessages(prev => prev.filter(m => m.id !== tempId));
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
    setSendingImage(false);
  };

  const startRecording = async () => {
    if (mediaRecorderRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch {}
  };

  const stopRecording = (send = true) => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = async () => {
        const stream = mediaRecorderRef.current?.stream;
        if (stream) stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (send && blob.size >= 100 && userId) {
          try {
            const file = new File([blob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
            const uploaded = await storageService.uploadFile(file);
            await messageService.sendMessage(matchId, userId, { type: 'voice', mediaUrl: uploaded.$id });
          } catch {}
        }
      };
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setRecordingLocked(false);
    setRecordingDuration(0);
  };

  const handleMicPointerDown = async () => { await startRecording(); };

  const handleMicPointerUp = () => {
    if (!recordingLocked && isRecording) stopRecording(true);
  };

  const handleMicPointerLeave = () => {
    if (!recordingLocked && isRecording) stopRecording(false);
  };

  const handleEmojiPick = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  const handleReply = (msg: Message) => {
    setReplyTo({ id: msg.id, text: msg.text, senderId: msg.senderId });
    setShowEmoji(false);
  };

  const handleEdit = (msg: Message) => {
    setEditingId(msg.id);
    setInputText(msg.text);
    setShowEmoji(false);
  };

  const handleGift = async () => {
    const amt = Math.floor(giftAmount);
    if (!amt || amt < 1 || gifting) return;
    setGifting(true);
    try {
      const res = await walletService.gift(otherUserId, amt);
      setMyCoins(res?.coins ?? 0);
      setShowGift(false);
    } catch (e: any) {
      alert(e?.message || 'Gift failed');
    }
    setGifting(false);
  };

  const toggleGift = () => {
    setShowGift(prev => {
      const next = !prev;
      if (next) setShowEmoji(false);
      return next;
    });
    walletService.getWallet().then(w => setMyCoins(w?.coins ?? 0)).catch(() => {});
  };

  const startCall = async (type: 'audio' | 'video') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints(type));
      captureStream(stream);
      router.push(`/call/${matchId}?type=${type}&otherId=${otherUserId}`);
    } catch (err: any) {
      alert(mediaErrorMessage(err));
    }
  };

  return (
    <div className="chat-screen" style={{ minHeight: '100svh', background: '#fff' }}>
      <style global jsx>{`
        .ch-header{position:fixed;top:0;left:0;right:0;z-index:30;background:rgba(255,255,255,.98);border-bottom:1px solid #eeeeef;display:flex;align-items:center;padding:calc(12px + env(safe-area-inset-top,0px)) 30px 0 28px}
        .ch-back{width:34px;height:44px;border:0;background:transparent;padding:0;margin-right:25px;display:grid;place-items:center;cursor:pointer;flex:none}
        .ch-back svg{width:25px;height:25px;stroke:#111;stroke-width:2;fill:none;stroke-linecap:round;stroke-linejoin:round}
        .ch-avatar-btn{border:0;background:transparent;padding:0;cursor:pointer;flex:none}
        .ch-avatar-wrap{position:relative;width:56px;height:56px;flex:none}
        .ch-avatar{width:56px;height:56px;border-radius:50%;object-fit:cover;display:block}
        .ch-online{position:absolute;right:1px;bottom:1px;width:12px;height:12px;background:#18bf74;border:2px solid #fff;border-radius:50%}
        .ch-person{margin-left:22px;min-width:0}
        .ch-name{font-size:25px;font-weight:700;line-height:1.05;display:flex;align-items:center;gap:8px;color:#000}
        .ch-verified{width:17px;height:17px;border-radius:50%;background:#1496e9;color:#fff;display:inline-grid;place-items:center;font-size:11px;font-weight:900}
        .ch-online-text{font-size:17px;color:#85858b;margin-top:7px}
        .ch-header-actions{margin-left:auto;display:flex;align-items:center;gap:35px}
        .ch-action-btn{border:0;background:transparent;padding:6px;cursor:pointer}
        .ch-action-btn svg{width:34px;height:34px;stroke:#111;stroke-width:1.8;fill:none;stroke-linecap:round;stroke-linejoin:round}
        .ch-conversation{position:fixed;top:0;left:0;right:0;bottom:0;overflow-y:auto;padding:calc(78px + env(safe-area-inset-top,0px)) 17px calc(152px + env(safe-area-inset-bottom,0px));scrollbar-width:none}
        .ch-conversation::-webkit-scrollbar{display:none}
        .ch-today{text-align:center;color:#8c8c92;font-size:16px;padding:26px 0 14px}
        .ch-divider{display:flex;align-items:center;gap:25px;color:#d21a6a;font-weight:600;font-size:18px;margin:33px 0 34px}
        .ch-divider:before,.ch-divider:after{content:"";height:2px;background:#d21a6a;flex:1}
        .ch-row{display:flex;align-items:flex-end;margin-bottom:23px}
        .ch-incoming{justify-content:flex-start}
        .ch-outgoing{justify-content:flex-end}
        .ch-avatar-small{width:73px;height:73px;border-radius:50%;object-fit:cover;flex:none;margin-right:17px}
        .ch-message-col{max-width:calc(100% - 90px);display:flex;flex-direction:column}
        .ch-incoming .ch-message-col{align-items:flex-start}
        .ch-outgoing .ch-message-col{align-items:flex-end}
        .ch-bubble{padding:20px 25px;font-size:21px;line-height:1.45;letter-spacing:.05px;border-radius:27px;color:#171717;white-space:pre-wrap;word-break:break-word}
        .ch-incoming .ch-bubble{background:#f1f1f3;border-radius:27px}
        .ch-outgoing .ch-bubble{background:#ffd8e7;border-radius:27px 27px 0 27px}
        .ch-time{color:#8b8b91;font-size:15px;margin-top:9px;display:flex;align-items:center;gap:7px}
        .ch-incoming .ch-time{justify-content:flex-start}
        .ch-outgoing .ch-time{justify-content:flex-end}
        .ch-checks{color:#d5166a;font-size:18px;line-height:1;font-weight:700;letter-spacing:1px}
        .ch-call-row{display:flex;flex-direction:column;align-items:center;gap:5px;margin:4px 0 14px}
        .ch-call-pill{font-size:14px;color:#8c8c92;background:#f6f6f7;border-radius:999px;padding:6px 16px;font-weight:600}
        .ch-call-time{font-size:12px;color:#8c8c92}
        .ch-footer{position:fixed;left:0;right:0;bottom:0;z-index:20;background:rgba(255,255,255,.98)}
        .ch-composer{display:flex;align-items:center;padding:15px 23px calc(15px + env(safe-area-inset-bottom,0px));border-top:1px solid #f3f3f3}
        .ch-composer-box{width:100%;height:58px;border:1px solid #e5e5e8;border-radius:30px;display:flex;align-items:center;padding:0 13px 0 12px;box-shadow:0 1px 3px rgba(0,0,0,.03) inset}
        .ch-plus{width:35px;height:35px;border:2px solid #d91b70;border-radius:50%;display:grid;place-items:center;color:#d91b70;font-size:27px;font-weight:300;line-height:1;cursor:pointer;background:#fff;flex:none;padding:0}
        .ch-input{border:0;outline:0;flex:1;margin:0 15px;font-size:18px;color:#333;background:transparent;min-width:0}
        .ch-input::placeholder{color:#8f8f95}
        .ch-ico{background:transparent;border:0;padding:5px;cursor:pointer;flex:none;display:flex;align-items:center;justify-content:center}
        .ch-mic{width:36px;height:36px}
        .ch-mic svg{width:27px;height:31px;stroke:#d91b70;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
        .ch-send{width:36px;height:36px;border-radius:50%;background:#d91b70;border:0;cursor:pointer;flex:none;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(217,27,112,.35)}
        .ch-send svg{width:17px;height:17px}
        @media (max-width:600px){
          .ch-header{padding:calc(8px + env(safe-area-inset-top,0px)) 15px 0}
          .ch-back{margin-right:12px;width:28px}
          .ch-avatar-wrap,.ch-avatar{width:44px;height:44px}
          .ch-online{width:9px;height:9px}
          .ch-person{margin-left:12px}
          .ch-name{font-size:19px;gap:5px}
          .ch-verified{width:14px;height:14px;font-size:9px}
          .ch-online-text{font-size:14px;margin-top:4px}
          .ch-header-actions{gap:13px}
          .ch-action-btn svg{width:27px;height:27px}
          .ch-conversation{padding:calc(62px + env(safe-area-inset-top,0px)) 17px calc(132px + env(safe-area-inset-bottom,0px))}
          .ch-today{font-size:14px;padding:20px 0 10px}
          .ch-divider{font-size:14px;gap:17px;margin:27px 0 28px}
          .ch-row{margin-bottom:19px}
          .ch-avatar-small{width:52px;height:52px}
          .ch-incoming .ch-avatar-small{margin-right:11px}
          .ch-message-col{max-width:calc(100% - 63px)}
          .ch-bubble{font-size:16px;line-height:1.45;padding:14px 18px;border-radius:21px}
          .ch-outgoing .ch-bubble{border-radius:21px 21px 0 21px}
          .ch-incoming .ch-bubble{border-radius:21px}
          .ch-time{font-size:12px;margin-top:7px}
          .ch-checks{font-size:15px}
          .ch-composer{padding:10px 15px calc(10px + env(safe-area-inset-bottom,0px))}
          .ch-composer-box{height:49px}
          .ch-plus{width:29px;height:29px;font-size:22px}
          .ch-input{font-size:15px;margin:0 11px}
          .ch-mic svg{width:23px;height:27px}
          .ch-send{width:30px;height:30px}
        }
        @media (max-width:380px){
          .ch-bubble{font-size:15px;padding:13px 16px}
          .ch-person{margin-left:9px}
          .ch-name{font-size:17px}
          .ch-header-actions{gap:8px}
        }
      `}</style>

      {/* ===== Header ===== */}
      <header className="ch-header">
        <button className="ch-back" aria-label="Back" onClick={() => router.back()}>
          <svg viewBox="0 0 24 24"><path d="M15 4.5 7.5 12 15 19.5"/></svg>
        </button>

        <button className="ch-avatar-btn" onClick={() => otherUserId && router.push(`/my-profile/${otherUserId}`)} aria-label="View profile">
          <div className="ch-avatar-wrap">
            <div className="ch-avatar" style={{ background: '#EEEEF0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {otherAvatarUrl ? (
                <img src={otherAvatarUrl} alt={matchName} fetchPriority="high" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#8A8A8F', fontWeight: 800, fontSize: 30 }}>{(matchName[0] || 'U').toUpperCase()}</span>
              )}
            </div>
            <span className="ch-online" style={{ background: otherOnline ? '#18bf74' : '#6b6b6b' }}></span>
          </div>
        </button>

        <div className="ch-person">
          <div className="ch-name">
            {matchName}
            {(otherProfile as any)?.verified && <span className="ch-verified">✓</span>}
          </div>
          <div className="ch-online-text">{otherOnline ? 'Online now' : 'Offline'}</div>
        </div>

        <div className="ch-header-actions">
          <button className="ch-action-btn" aria-label="Call" onClick={() => startCall('audio')}>
            <svg viewBox="0 0 24 24">
              <path d="M6.6 3.8c.5-.5 1.3-.6 1.9-.2l2.3 1.5c.6.4.8 1.2.5 1.8L10 9.1c-.2.5-.2 1 .1 1.4.8 1.1 2 2.3 3.1 3.1.4.3.9.3 1.4.1l2.2-1.3c.6-.3 1.4-.1 1.8.5l1.5 2.3c.4.6.3 1.4-.2 1.9l-1.5 1.5c-.7.7-1.7 1-2.7.8-2.5-.5-5.4-2.2-8-4.8s-4.3-5.5-4.8-8c-.2-1 .1-2 .8-2.7z"/>
            </svg>
          </button>
          <button className="ch-action-btn" aria-label="Gift" onClick={toggleGift}>
            <svg viewBox="0 0 24 24">
              <path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-1.8 0-4.5-1-4.5-2.8C7.5 3.1 8.4 2 9.6 2c1.7 0 2.4 2.3 2.4 5zM12 7c1.8 0 4.5-1 4.5-2.8 0-1.1-.9-2.2-2.1-2.2-1.7 0-2.4 2.3-2.4 5z"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ===== Conversation ===== */}
      <div className="ch-conversation">
        {messages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12, textAlign: 'center', padding: 24 }}>
            <div style={{ width: 76, height: 76, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 44px rgba(217,27,112,0.35)', overflow: 'hidden', background: '#EEEEF0' }}>
              {otherAvatarUrl ? (
                <img src={otherAvatarUrl} alt={matchName} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#8A8A8F', fontWeight: 800, fontSize: 30 }}>{(matchName[0] || 'U').toUpperCase()}</span>
              )}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#151515' }}>You matched with {matchName}!</div>
            <div style={{ fontSize: 13, color: '#8A8A8F', maxWidth: 260, lineHeight: '20px' }}>
              Say hi and start the conversation — compliments go a long way ✨
            </div>
          </div>
        )}

        {visibleMessages.map((item, i) => {
          const prev = visibleMessages[i - 1];
          const getItemTime = (it: typeof item) => it.kind === 'msg' ? it.msg.createdAt : it.log.createdAt;

          const showDivider = !prev || !sameDay(getItemTime(prev), getItemTime(item));
          const dividerTs = getItemTime(item);

          if (item.kind === 'call') {
            const log = item.log;
            const isMe = log.from === userId;
            const isVideo = log.callType === 'video';
            const isMissed = log.status === 'missed';
            const isDeclined = log.status === 'declined';
            const icon = isVideo ? '📹' : '📞';
            let statusLabel = '';
            if (isMissed) statusLabel = isMe ? 'No answer' : 'Missed';
            else if (isDeclined) statusLabel = 'Declined';
            else statusLabel = log.duration > 0 ? formatDuration(log.duration) : 'Answered';

            return (
              <div key={`call-${log.$id || log.id}`}>
                {showDivider && (
                  dateDivider(dividerTs) === 'Today'
                    ? <div className="ch-divider"><span>New Messages</span></div>
                    : <div className="ch-today">{dateDivider(dividerTs)}</div>
                )}
                <div className="ch-call-row">
                  <span className="ch-call-pill">{icon} {isMe ? 'Outgoing' : 'Incoming'} {isVideo ? 'video' : 'voice'} call · {statusLabel}</span>
                  <span className="ch-call-time">{formatTime(log.createdAt)}</span>
                </div>
              </div>
            );
          }

          const msg = item.msg;
          const isMe = msg.senderId === userId;
          const isImage = msg.type === 'image';
          const isVoice = msg.type === 'voice';
          const isGift = msg.type === 'gift';
          const mediaUrl = msg.mediaUrl;

          const bubbleStyle: React.CSSProperties | undefined = isImage
            ? { maxWidth: '100%', padding: 0, background: 'transparent', border: 'none', borderRadius: 16, overflow: 'hidden' }
            : isGift
              ? {
                  maxWidth: '100%', padding: '12px 16px',
                  background: 'linear-gradient(135deg, rgba(255,230,0,0.18), rgba(255,180,0,0.10))',
                  border: '1px solid rgba(255,210,0,0.4)',
                  borderRadius: isMe ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                }
              : undefined;

          return (
            <div key={msg.id}>
              {showDivider && (
                dateDivider(dividerTs) === 'Today'
                  ? <div className="ch-divider"><span>New Messages</span></div>
                  : <div className="ch-today">{dateDivider(dividerTs)}</div>
              )}

              <div className={`ch-row ${isMe ? 'ch-outgoing' : 'ch-incoming'}`}>
                {!isMe && (
                  <div className="ch-avatar-small" style={{ background: '#EEEEF0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
{otherAvatarUrl ? (
                <img src={otherAvatarUrl} alt={matchName} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ color: '#8A8A8F', fontWeight: 800, fontSize: 30 }}>{(matchName[0] || 'U').toUpperCase()}</span>
              )}
                  </div>
                )}

                <div className="ch-message-col">
                  <div
                    style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, maxWidth: '100%' }}
                    onMouseEnter={() => setHoveredId(msg.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onDoubleClick={() => toggleReaction(msg, '❤️')}
                  >
                    {/* Hover reaction / action bar */}
                    <div style={{
                      position: 'absolute', bottom: '100%', marginBottom: 6,
                      left: isMe ? 'auto' : 0, right: isMe ? 0 : 'auto',
                      display: hoveredId === msg.id ? 'flex' : 'none', alignItems: 'center', gap: 2,
                      background: 'rgba(255,255,255,0.97)', border: '1px solid #EDEDF1',
                      borderRadius: 9999, padding: '4px 8px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                      zIndex: 20, whiteSpace: 'nowrap',
                    }}>
                      {REACTIONS.map(r => (
                        <button
                          key={r}
                          onClick={() => toggleReaction(msg, r)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1,
                            padding: '2px 3px', transition: 'transform 0.15s ease',
                            opacity: (msg.reactions || []).includes(r) ? 1 : 0.65,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.35)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                          {r}
                        </button>
                      ))}
                      <span style={{ width: 1, height: 18, background: '#E3E3E8', margin: '0 4px' }} />
                      <button
                        onClick={() => handleReply(msg)}
                        title="Reply"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', display: 'flex', alignItems: 'center' }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8A8A8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
                      </button>
                      {isMe && (
                        <button
                          onClick={() => handleEdit(msg)}
                          title="Edit"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', display: 'flex', alignItems: 'center' }}
                        >
                          <PencilIcon size={14} color="#8A8A8F" />
                        </button>
                      )}
                    </div>

                    <div className="ch-bubble" style={bubbleStyle}>
                      {msg.replyTo && (
                        <div style={{
                          borderLeft: '3px solid #d91b70',
                          background: isMe ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.05)',
                          borderRadius: 8, padding: '4px 8px', marginBottom: 6,
                        }}>
                          <div style={{ fontSize: 11, color: '#d91b70', fontWeight: 700 }}>
                            {msg.replyTo.senderId === userId ? 'You' : matchName}
                          </div>
                          <div style={{ fontSize: 12, color: '#8b8b91', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>
                            <Highlight text={msg.replyTo.text} query="" />
                          </div>
                        </div>
                      )}

                      {isVoice && mediaUrl ? (
                        <VoiceBubble url={resolveMediaUrl(mediaUrl)} isMe={isMe} />
                      ) : isImage && mediaUrl ? (
                        <div>
                          <img
                            src={resolveMediaUrl(mediaUrl)}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            onClick={(e) => { e.stopPropagation(); setLightbox(resolveMediaUrl(mediaUrl)); }}
                            style={{ display: 'block', maxWidth: 240, maxHeight: 280, borderRadius: 12, cursor: 'zoom-in', objectFit: 'cover' }}
                          />
                        </div>
                      ) : isGift ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '2px 2px' }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #FFE600, #FFB62B)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <CoinsIcon size={18} color="#1A1A1A" />
                          </div>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: '#151515' }}>{isMe ? 'Gift sent' : 'Gift received'}</div>
                            <div style={{ fontSize: 14, color: '#8b8b91', fontWeight: 600 }}>{msg.text} coins</div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Highlight text={msg.text} query="" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ch-time">
                    {msg.editedAt && <span style={{ fontStyle: 'italic' }}>edited</span>}
                    {formatTime(msg.createdAt)}
                    {isMe && <span className="ch-checks">{msg.readAt ? '✓✓' : '✓'}</span>}
                  </div>
                </div>
              </div>

              {(msg.reactions || []).length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginTop: -10, marginBottom: 10, marginLeft: isMe ? 0 : 90, marginRight: isMe ? 8 : 0, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  {(msg.reactions || []).map((r, ri) => (
                    <span key={ri} style={{ fontSize: 13, lineHeight: 1.3, background: '#FFFFFF', border: '1px solid #EDEDF1', borderRadius: 9999, padding: '3px 8px' }}>{r}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* ===== Fixed footer ===== */}
      <div className="ch-footer">
        {editingId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: 'rgba(255,230,0,0.06)', borderTop: '1px solid rgba(255,230,0,0.15)' }}>
            <PencilIcon size={14} color="#FFE600" />
            <span style={{ flex: 1, fontSize: 13, color: '#FFE600', fontWeight: 700 }}>Editing message</span>
            <button onClick={() => { setEditingId(null); setInputText(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <CloseCircleIcon size={18} color="#8A8A8F" />
            </button>
          </div>
        )}

        {replyTo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: 'rgba(217,27,112,0.07)', borderTop: '1px solid rgba(217,27,112,0.15)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: '#d91b70', fontWeight: 700 }}>Replying to {replyTo.senderId === userId ? 'yourself' : matchName}</div>
              <div style={{ fontSize: 13, color: '#8A8A8F', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{replyTo.text}</div>
            </div>
            <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <CloseCircleIcon size={20} color="#8A8A8F" />
            </button>
          </div>
        )}

        {showEmoji && (
          <div style={{ background: '#FFFFFF', borderTop: '1px solid #EDEDF1', maxHeight: '40vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px 0' }}>
              <span style={{ fontSize: 12, color: '#8A8A8F', fontWeight: 700, letterSpacing: 1 }}>EMOJIS</span>
              <button onClick={() => setShowEmoji(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <CloseCircleIcon size={18} color="#8A8A8F" />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', padding: 8, gap: 4 }}>
              {EMOJIS.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => handleEmojiPick(emoji)}
                  style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: 27, borderRadius: 10, transition: 'transform 0.12s ease, background 0.12s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'scale(1.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {showGift && (
          <div style={{ background: '#FFFFFF', borderTop: '1px solid #EDEDF1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px 0' }}>
              <span style={{ fontSize: 12, color: '#FFE600', fontWeight: 700, letterSpacing: 1 }}>GIFT COINS</span>
              <button onClick={() => setShowGift(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <CloseCircleIcon size={18} color="#8A8A8F" />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', padding: 10, gap: 8 }}>
              {[1, 5, 10, 25, 50, 100, 200].map(n => (
                <button
                  key={n}
                  onClick={() => setGiftAmount(n)}
                  style={{
                    padding: '8px 12px', borderRadius: 9999, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                    background: giftAmount === n ? 'rgba(255,230,0,0.16)' : '#F3F3F6',
                    border: giftAmount === n ? '1px solid rgba(255,230,0,0.5)' : '1px solid #EDEDF1',
                    color: giftAmount === n ? '#FFE600' : '#65656A', fontSize: 13, fontWeight: 700,
                  }}
                >
                  {n} <CoinsIcon size={12} color={giftAmount === n ? '#FFE600' : '#8A8A8A'} />
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px 10px' }}>
              <input
                type="number" min={1} value={giftAmount}
                onChange={(e) => setGiftAmount(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                placeholder="Custom"
                style={{ width: 90, background: '#F3F3F6', border: '1px solid #EDEDF1', borderRadius: 10, padding: '8px 10px', color: '#151515', fontSize: 14, outline: 'none' }}
              />
              <Button title={gifting ? 'Sending…' : 'Send Gift'} variant="gradient" size="sm" loading={gifting} disabled={gifting} onPress={handleGift} />
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#8A8A8F', fontWeight: 600 }}>You have {myCoins.toLocaleString()} coins</span>
            </div>
          </div>
        )}

        {isRecording ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 15px calc(10px + env(safe-area-inset-bottom,0px))', borderTop: '1px solid #f3f3f3', background: '#FFFFFF' }}>
            <button
              onClick={() => stopRecording(false)}
              title="Cancel"
              style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(217,27,112,0.12)', border: '1px solid rgba(217,27,112,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <CloseCircleIcon size={20} color="#d91b70" />
            </button>
            <div style={{ flex: 1, minWidth: 0, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#f6f6f7', border: '1px solid #e5e5e8', borderRadius: 9999, padding: '0 12px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#d91b70', boxShadow: '0 0 12px #d91b70', animation: 'pulse 1s infinite', flexShrink: 0 }} />
              <span style={{ fontSize: 15, color: '#171717', fontWeight: 700, fontVariant: 'tabular-nums', flexShrink: 0 }}>{formatDuration(recordingDuration)}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 26, overflow: 'hidden' }}>
                {recBars.map((h, i) => (
                  <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: i % 3 === 0 ? '#d91b70' : '#ff8ab4', transformOrigin: 'center', animation: `equalizer 0.8s ease-in-out ${(i % 6) * 0.1}s infinite`, flexShrink: 0 }} />
                ))}
              </div>
            </div>
            <button
              onClick={() => stopRecording(true)}
              title="Send"
              style={{ width: 40, height: 40, borderRadius: '50%', background: '#d91b70', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(217,27,112,0.4)' }}
            >
              <SendIcon size={18} color="white" />
            </button>
          </div>
        ) : (
          <div className="ch-composer">
            <div className="ch-composer-box">
              <button className="ch-plus" aria-label="Add" onClick={() => attachRef.current?.click()}>+</button>
              <input ref={attachRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAttach} />

              <input
                className="ch-input"
                placeholder={sendingImage ? 'Uploading photo…' : 'Type a message...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                maxLength={1000}
                disabled={sendingImage}
              />

              {inputText.length > 0 && (
                <button onClick={() => setInputText('')} className="ch-ico" style={{ display: 'flex' }}>
                  <CloseCircleIcon size={16} color="#8A8A8F" />
                </button>
              )}
              <button
                onClick={toggleGift}
                title="Send coins"
                className="ch-ico"
              >
                <CoinsIcon size={20} color={showGift ? '#FFE600' : '#A8842C'} />
              </button>
              <button
                onClick={() => { setShowEmoji(!showEmoji); if (!showEmoji) setShowGift(false); }}
                className="ch-ico"
              >
                {showEmoji ? <KeypadIcon size={20} color="#d91b70" /> : <HappyIcon size={20} color={inputText ? '#856' : '#8f8f95'} />}
              </button>

              {inputText.trim() ? (
                <button
                  onClick={handleSend}
                  disabled={sending}
                  className="ch-send"
                  aria-label="Send"
                >
                  <SendIcon size={17} color="white" />
                </button>
              ) : (
                <button
                  className="ch-ico ch-mic"
                  aria-label="Record"
                  onPointerDown={handleMicPointerDown}
                  onPointerUp={handleMicPointerUp}
                  onPointerLeave={handleMicPointerLeave}
                  style={{ userSelect: 'none', touchAction: 'none' }}
                >
                  <svg viewBox="0 0 24 28">
                    <rect x="8" y="2" width="8" height="15" rx="4"></rect>
                    <path d="M5 13a7 7 0 0 0 14 0M12 20v5M9 25h6"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== Image lightbox ===== */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
        >
          <img
            src={lightbox}
            alt=""
            decoding="async"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '92vw', maxHeight: '88vh', borderRadius: 16, boxShadow: '0 20px 80px rgba(0,0,0,0.8)' }}
          />
          <button
            onClick={() => setLightbox(null)}
            style={{ position: 'absolute', top: 18, right: 18, width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <CloseCircleIcon size={24} color="white" />
          </button>
        </div>
      )}
    </div>
  );
}