'use client';
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ChevronBackIcon, CallIcon, VideoIcon, MicIcon, SendIcon, PencilIcon,
  CloseCircleIcon, HappyIcon, KeypadIcon, CheckmarkIcon, CheckmarkDoneIcon, ImagesIcon,
  SearchIcon, CoinsIcon,
} from '@/components/Icons';
import GradientBackground from '@/components/GradientBackground';
import { useAuth } from '@/store/AuthContext';
import { messageService, storageService, matchService, userService, walletService } from '@/lib/cloudflare/services';
import { account } from '@/lib/cloudflare/config';
import Button from '@/components/Button';
import type { Message } from '@/lib/types';

const EMOJIS = ['😀', '😂', '❤️', '🔥', '😍', '🥰', '😘', '💕', '😊', '😎', '🙌', '👋', '💪', '✨', '🌟', '🎉', '🎂', '🍕', '☕', '🌮'];
const QUICK_REPLIES = ['Hey 😊', 'How are you?', "You're gorgeous 🔥", 'Coffee sometime? ☕', 'LOL 😂', '💕'];
const REACTIONS = ['❤️', '😂', '🔥', '😍', '👍', '😮'];
const GROUP_GAP_MS = 5 * 60 * 1000;

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
      <mark style={{ background: 'rgba(255,215,0,0.3)', color: 'inherit', borderRadius: 3, padding: '0 2px' }}>{text.slice(idx, idx + query.length)}</mark>
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 190 }}>
      <button
        onClick={toggle}
        style={{
          width: 36, height: 36, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
          background: isMe ? 'rgba(255,255,255,0.22)' : 'linear-gradient(135deg, #FF375F, #FF3B30)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isMe ? 'none' : '0 4px 16px rgba(255,55,95,0.35)',
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
              background: isMe ? 'rgba(255,255,255,0.9)' : '#FF6B8A',
              transformOrigin: 'center',
              animation: playing ? `equalizer 0.9s ease-in-out ${(i % 6) * 0.12}s infinite` : 'none',
              opacity: playing ? 0.9 : 0.45,
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 12, color: isMe ? 'rgba(255,255,255,0.75)' : '#ABABAB', fontVariant: 'tabular-nums', minWidth: 34 }}>{formatDuration(Math.round(elapsed))}</span>
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
  const { profile, user } = useAuth();
  const matchId = params.id as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; text: string; senderId: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingLocked, setRecordingLocked] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [matchName, setMatchName] = useState('User');
  const [otherUserId, setOtherUserId] = useState('');
  const [otherOnline, setOtherOnline] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingImage, setSendingImage] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const recBars = useMemo(() => Array.from({ length: 16 }, (_, i) => 6 + ((i * 13) % 18)), []);

  useEffect(() => {
    if (!matchId || !userId) return;
    matchService.getMatch(matchId).then(doc => {
      const other = (doc as any).userId === userId ? (doc as any).matchedUserId : (doc as any).userId;
      setOtherUserId(other);
      userService.getProfile(other).then(p => {
        setMatchName((p as any).displayName || (p as any).fullName || 'User');
        const lastActive = (p as any).lastActive;
        setOtherOnline(!!lastActive && Date.now() - new Date(lastActive).getTime() < 120000);
      }).catch(() => {});
    }).catch(() => {});
    messageService.getMessages(matchId).then(res => {
      const msgs = (res.documents || []).map(docToMessage);
      setMessages(msgs);
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const visibleMessages = useMemo(() => {
    if (!searchOpen || !searchQuery.trim()) return messages;
    const q = searchQuery.trim().toLowerCase();
    return messages.filter(m => m.type === 'text' && m.text.toLowerCase().includes(q));
  }, [messages, searchOpen, searchQuery]);

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

  const toggleRecordingLock = () => {
    if (isRecording && !recordingLocked) setRecordingLocked(true);
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

  const roundBtn = (active: boolean) => ({
    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
    border: active ? '1px solid rgba(255,55,95,0.35)' : '1px solid rgba(255,255,255,0.1)',
    background: active ? 'rgba(255,55,95,0.12)' : 'rgba(255,255,255,0.06)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  });

  return (
    <GradientBackground className="chat-screen" style={{ minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="chat-screen" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, position: 'relative' }}>
      {/* ===== Header ===== */}
      <header style={{
        flexShrink: 0, padding: '50px 12px 10px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30,
        background: 'linear-gradient(180deg, rgba(8,8,12,0.85), rgba(13,13,13,0.7))',
        backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button onClick={() => router.back()} style={{ ...roundBtn(false), background: 'rgba(255,255,255,0.05)' }}>
          <ChevronBackIcon size={20} color="white" />
        </button>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div className="grad-ring" style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: 19 }}>{(matchName[0] || 'U').toUpperCase()}</span>
            </div>
            <span style={{
              position: 'absolute', right: 0, bottom: 0, width: 12, height: 12, borderRadius: '50%',
              border: '2px solid #0D0D0D', background: otherOnline ? '#34C759' : '#6B6B6B',
              boxShadow: otherOnline ? '0 0 8px #34C759' : 'none',
            }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{matchName}</div>
            <div style={{ fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, color: otherOnline ? '#34C759' : '#6B6B6B' }}>
              {otherOnline && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34C759', animation: 'pulse 1.4s infinite' }} />}
              {otherOnline ? 'Online now' : 'Offline'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setSearchOpen(o => !o)} style={roundBtn(searchOpen)}>
            {searchOpen ? <CloseCircleIcon size={18} color="#FF6B8A" /> : <SearchIcon size={18} color={searchOpen ? '#FF6B8A' : '#D0D0D0'} />}
          </button>
          <button onClick={() => router.push(`/call/${matchId}?type=audio&otherId=${otherUserId}`)} style={{ ...roundBtn(false), border: '1px solid rgba(52,199,89,0.25)', background: 'rgba(52,199,89,0.08)' }}>
            <CallIcon size={18} color="#34C759" />
          </button>
          <button onClick={() => router.push(`/call/${matchId}?type=video&otherId=${otherUserId}`)} style={{ ...roundBtn(false), border: '1px solid rgba(255,55,95,0.3)', background: 'rgba(255,55,95,0.1)' }}>
            <VideoIcon size={18} color="#FF375F" />
          </button>
        </div>
      </header>

      {/* ===== Search ===== */}
      {searchOpen && (
        <div style={{
          position: 'fixed', top: 104, left: 0, right: 0, zIndex: 25,
          padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(20,20,26,0.96)', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <SearchIcon size={16} color="#6B6B6B" />
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', fontSize: 14 }}
          />
          {searchQuery.trim() && (
            <span style={{ fontSize: 12, color: '#6B6B6B', whiteSpace: 'nowrap' }}>
              {visibleMessages.length} {visibleMessages.length === 1 ? 'match' : 'matches'}
            </span>
          )}
        </div>
      )}

      {/* ===== Messages ===== */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflowY: 'auto', padding: `${searchOpen ? 150 : 110}px 12px 120px`, display: 'flex', flexDirection: 'column' }}>
        {messages.length === 0 && !searchOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12, textAlign: 'center', padding: 24 }}>
            <div className="grad-ring" style={{ width: 76, height: 76, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 44px rgba(255,55,95,0.35)' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: 30 }}>{(matchName[0] || 'U').toUpperCase()}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>You matched with {matchName}!</div>
            <div style={{ fontSize: 13, color: '#6B6B6B', maxWidth: 260, lineHeight: '20px' }}>
              Say hi and start the conversation — compliments go a long way ✨
            </div>
          </div>
        )}

        {visibleMessages.map((msg, i) => {
          const prev = visibleMessages[i - 1];
          const next = visibleMessages[i + 1];
          const isMe = msg.senderId === userId;
          const showDivider = !prev || !sameDay(prev.createdAt, msg.createdAt);
          const sameGroupAsPrev = !!prev && prev.senderId === msg.senderId && sameDay(prev.createdAt, msg.createdAt)
            && new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() < GROUP_GAP_MS;
          const sameGroupAsNext = !!next && next.senderId === msg.senderId && sameDay(next.createdAt, msg.createdAt)
            && new Date(next.createdAt).getTime() - new Date(msg.createdAt).getTime() < GROUP_GAP_MS;
          const showSender = !isMe && !sameGroupAsPrev;
          const showTime = !sameGroupAsNext;
          const isImage = msg.type === 'image';
          const isVoice = msg.type === 'voice';
          const isGift = msg.type === 'gift';
          const mediaUrl = msg.mediaUrl;
          const metaColor = isMe ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.4)';
          const bubbleStyle: React.CSSProperties = isImage
            ? { maxWidth: '100%', padding: 0, background: 'transparent', border: 'none', borderRadius: 16, overflow: 'hidden' }
            : isGift
              ? {
                  maxWidth: '100%', padding: '10px 14px',
                  background: 'linear-gradient(135deg, rgba(255,215,0,0.16), rgba(255,150,0,0.07))',
                  border: '1px solid rgba(255,215,0,0.35)',
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  boxShadow: '0 4px 18px rgba(255,215,0,0.12)',
                }
              : {
                  maxWidth: '100%', padding: '9px 13px',
                  background: isMe ? 'linear-gradient(135deg, #FF375F, #FF3B30)' : 'rgba(255,255,255,0.06)',
                  border: isMe ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  boxShadow: isMe ? '0 4px 18px rgba(255,55,95,0.22)' : 'none',
                };

          return (
            <div key={msg.id}>
              {showDivider && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0 14px' }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#7A7A7A', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', padding: '4px 12px', borderRadius: 9999 }}>{dateDivider(msg.createdAt)}</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: sameGroupAsPrev ? 2 : 12 }}>
                {showSender && <span style={{ fontSize: 11, color: '#7A7A7A', fontWeight: 700, margin: '0 6px 4px' }}>{matchName}</span>}

                <div
                  style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, maxWidth: '84%' }}
                  onMouseEnter={() => setHoveredId(msg.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onDoubleClick={() => toggleReaction(msg, '❤️')}
                >
                  {/* Hover reaction / action bar */}
                  <div style={{
                    position: 'absolute', bottom: '100%', marginBottom: 6,
                    left: isMe ? 'auto' : 0, right: isMe ? 0 : 'auto',
                    display: hoveredId === msg.id ? 'flex' : 'none', alignItems: 'center', gap: 2,
                    background: 'rgba(20,20,28,0.96)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 9999, padding: '4px 8px', boxShadow: '0 10px 30px rgba(0,0,0,0.55)',
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
                    <span style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.12)', margin: '0 4px' }} />
                    <button
                      onClick={() => handleReply(msg)}
                      title="Reply"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', display: 'flex', alignItems: 'center' }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ABABAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></svg>
                    </button>
                    {isMe && (
                      <button
                        onClick={() => handleEdit(msg)}
                        title="Edit"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 5px', display: 'flex', alignItems: 'center' }}
                      >
                        <PencilIcon size={14} color="#ABABAB" />
                      </button>
                    )}
                  </div>

                  <div style={bubbleStyle}>
                    {msg.replyTo && (
                      <div style={{
                        borderLeft: '3px solid ' + (isMe ? 'rgba(255,255,255,0.5)' : '#FF6B8A'),
                        background: isMe ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.04)',
                        borderRadius: 8, padding: '4px 8px', marginBottom: 6,
                      }}>
                        <div style={{ fontSize: 11, color: isMe ? 'rgba(255,255,255,0.75)' : '#FF6B8A', fontWeight: 700 }}>
                          {msg.replyTo.senderId === userId ? 'You' : matchName}
                        </div>
                        <div style={{ fontSize: 12, color: isMe ? 'rgba(255,255,255,0.85)' : '#ABABAB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>{msg.replyTo.text}</div>
                      </div>
                    )}

                    {isVoice && mediaUrl ? (
                      <VoiceBubble url={resolveMediaUrl(mediaUrl)} isMe={isMe} />
                    ) : isImage && mediaUrl ? (
                      <div>
                        <img
                          src={resolveMediaUrl(mediaUrl)}
                          alt=""
                          onClick={(e) => { e.stopPropagation(); setLightbox(resolveMediaUrl(mediaUrl)); }}
                          style={{ display: 'block', maxWidth: 240, maxHeight: 280, borderRadius: 12, cursor: 'zoom-in', objectFit: 'cover' }}
                        />
                        {(showTime || msg.editedAt) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, justifyContent: 'flex-end', padding: '2px 8px 4px' }}>
                            {msg.editedAt && <span style={{ fontSize: 10, color: metaColor, fontStyle: 'italic' }}>edited</span>}
                            <span style={{ fontSize: 10, color: metaColor, fontVariant: 'tabular-nums' }}>{formatTime(msg.createdAt)}</span>
                            {isMe && (msg.readAt ? <CheckmarkDoneIcon size={13} color="#7CFFA0" /> : <CheckmarkIcon size={13} color="rgba(255,255,255,0.55)" />)}
                          </div>
                        )}
                      </div>
                    ) : isGift ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '2px 2px' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, #FFD700, #FF9500)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(255,200,0,0.35)',
                        }}>
                          <CoinsIcon size={18} color="#1A1A1A" />
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#FFD700' }}>{isMe ? 'Gift sent' : 'Gift received'}</div>
                          <div style={{ fontSize: 13, color: isMe ? 'rgba(255,255,255,0.9)' : '#E8E8E8', fontWeight: 600 }}>{msg.text} coins</div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: 15, lineHeight: '21px', color: isMe ? 'white' : '#E8E8E8', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        <Highlight text={msg.text} query={searchOpen ? searchQuery : ''} />
                      </div>
                    )}

                    {!isImage && (showTime || msg.editedAt) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, justifyContent: 'flex-end' }}>
                        {msg.editedAt && <span style={{ fontSize: 10, color: metaColor, fontStyle: 'italic' }}>edited</span>}
                        <span style={{ fontSize: 10, color: metaColor, fontVariant: 'tabular-nums' }}>{formatTime(msg.createdAt)}</span>
                        {isMe && (msg.readAt ? <CheckmarkDoneIcon size={13} color="#7CFFA0" /> : <CheckmarkIcon size={13} color="rgba(255,255,255,0.55)" />)}
                      </div>
                    )}
                  </div>
                </div>

                {(msg.reactions || []).length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 4, marginLeft: isMe ? 0 : 8, marginRight: isMe ? 8 : 0 }}>
                    {(msg.reactions || []).map((r, ri) => (
                      <span key={ri} style={{ fontSize: 13, lineHeight: 1.3, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 9999, padding: '3px 8px' }}>{r}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {searchOpen && searchQuery.trim() && visibleMessages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#6B6B6B', fontSize: 14, padding: 40 }}>
            No messages match “{searchQuery}”
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ===== Fixed footer ===== */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 20, background: 'linear-gradient(180deg, rgba(13,13,13,0.85), #0D0D0D 45%)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', boxShadow: '0 -8px 24px rgba(0,0,0,0.35)' }}>
      {/* ===== Quick replies ===== */}
      {!searchOpen && !isRecording && messages.length > 0 && inputText.trim() === '' && (
        <div style={{ display: 'flex', gap: 8, padding: '4px 12px 8px', overflowX: 'auto' }}>
          {QUICK_REPLIES.map(q => (
            <button
              key={q}
              onClick={() => setInputText(q)}
              style={{ whiteSpace: 'nowrap', fontSize: 13, color: '#D0D0D0', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9999, padding: '6px 13px', cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* ===== Composer ===== */}
      <div>
        {editingId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: 'rgba(255,215,0,0.06)', borderTop: '1px solid rgba(255,215,0,0.15)' }}>
            <PencilIcon size={14} color="#FFD700" />
            <span style={{ flex: 1, fontSize: 13, color: '#FFD700', fontWeight: 700 }}>Editing message</span>
            <button onClick={() => { setEditingId(null); setInputText(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <CloseCircleIcon size={18} color="#ABABAB" />
            </button>
          </div>
        )}

        {replyTo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: 'rgba(255,55,95,0.07)', borderTop: '1px solid rgba(255,55,95,0.15)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: '#FF6B8A', fontWeight: 700 }}>Replying to {replyTo.senderId === userId ? 'yourself' : matchName}</div>
              <div style={{ fontSize: 13, color: '#ABABAB', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{replyTo.text}</div>
            </div>
            <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <CloseCircleIcon size={20} color="#ABABAB" />
            </button>
          </div>
        )}

        {showEmoji && (
          <div style={{ background: 'rgba(20,20,28,0.96)', borderTop: '1px solid rgba(255,255,255,0.08)', maxHeight: '40vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px 0' }}>
              <span style={{ fontSize: 12, color: '#6B6B6B', fontWeight: 700, letterSpacing: 1 }}>EMOJIS</span>
              <button onClick={() => setShowEmoji(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <CloseCircleIcon size={18} color="#6B6B6B" />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', padding: 8, gap: 4 }}>
              {EMOJIS.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => handleEmojiPick(emoji)}
                  style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: 27, borderRadius: 10, transition: 'transform 0.12s ease, background 0.12s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'scale(1.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {showGift && (
          <div style={{ background: 'rgba(20,20,28,0.96)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px 0' }}>
              <span style={{ fontSize: 12, color: '#FFD700', fontWeight: 700, letterSpacing: 1 }}>GIFT COINS</span>
              <button onClick={() => setShowGift(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <CloseCircleIcon size={18} color="#6B6B6B" />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', padding: 10, gap: 8 }}>
              {[1, 5, 10, 25, 50, 100, 200].map(n => (
                <button
                  key={n}
                  onClick={() => setGiftAmount(n)}
                  style={{
                    padding: '8px 12px', borderRadius: 9999, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
                    background: giftAmount === n ? 'rgba(255,215,0,0.16)' : 'rgba(255,255,255,0.05)',
                    border: giftAmount === n ? '1px solid rgba(255,215,0,0.5)' : '1px solid rgba(255,255,255,0.1)',
                    color: giftAmount === n ? '#FFD700' : '#D0D0D0', fontSize: 13, fontWeight: 700,
                  }}
                >
                  {n} <CoinsIcon size={12} color={giftAmount === n ? '#FFD700' : '#8A8A8A'} />
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px 10px' }}>
              <input
                type="number" min={1} value={giftAmount}
                onChange={(e) => setGiftAmount(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
                placeholder="Custom"
                style={{ width: 90, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 10px', color: 'white', fontSize: 14, outline: 'none' }}
              />
              <Button title={gifting ? 'Sending…' : 'Send Gift'} variant="gradient" size="sm" loading={gifting} disabled={gifting} onPress={handleGift} />
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#6B6B6B', fontWeight: 600 }}>You have {myCoins.toLocaleString()} coins</span>
            </div>
          </div>
        )}

        {isRecording ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px 12px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(13,13,13,0.9)' }}>
            <button
              onClick={() => stopRecording(false)}
              title="Cancel"
              style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,59,48,0.15)', border: '1px solid rgba(255,59,48,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <CloseCircleIcon size={20} color="#FF3B30" />
            </button>
            <div style={{ flex: 1, minWidth: 0, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9999, padding: '0 12px' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FF3B30', boxShadow: '0 0 12px #FF3B30', animation: 'pulse 1s infinite', flexShrink: 0 }} />
              <span style={{ fontSize: 15, color: 'white', fontWeight: 700, fontVariant: 'tabular-nums', flexShrink: 0 }}>{formatDuration(recordingDuration)}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 26, overflow: 'hidden' }}>
                {recBars.map((h, i) => (
                  <div key={i} style={{ width: 3, height: h, borderRadius: 2, background: i % 3 === 0 ? '#FF375F' : '#FF6B8A', transformOrigin: 'center', animation: `equalizer 0.8s ease-in-out ${(i % 6) * 0.1}s infinite`, flexShrink: 0 }} />
                ))}
              </div>
            </div>
            {!recordingLocked && (
              <button
                onPointerDown={toggleRecordingLock}
                title="Lock"
                style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </button>
            )}
            <button
              onClick={() => stopRecording(true)}
              title="Send"
              style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #FF375F, #FF3B30)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(255,55,95,0.4)' }}
            >
              <SendIcon size={18} color="white" />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px 12px' }}>
            <button
              onClick={() => attachRef.current?.click()}
              title="Send a photo"
              style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >
              <ImagesIcon size={20} color="#FF6B8A" />
            </button>
            <input ref={attachRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAttach} />

            <div style={{ flex: 1, height: 40, minWidth: 0, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9999, padding: '0 6px 0 16px' }}>
              <input
                style={{ flex: 1, minWidth: 0, color: 'white', fontSize: 15, background: 'none', border: 'none', outline: 'none', padding: 0 }}
                placeholder={sendingImage ? 'Uploading photo…' : 'Type a message...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                maxLength={1000}
                disabled={sendingImage}
              />
              {inputText.length > 0 && (
                <button onClick={() => setInputText('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, display: 'flex', flexShrink: 0 }}>
                  <CloseCircleIcon size={16} color="#6B6B6B" />
                </button>
              )}
              <button
                onClick={toggleGift}
                title="Send coins"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                <CoinsIcon size={20} color={showGift ? '#FFD700' : '#A8842C'} />
              </button>
              <button
                onClick={() => { setShowEmoji(!showEmoji); if (!showEmoji) setShowGift(false); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 5, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                {showEmoji ? <KeypadIcon size={20} color="#FF6B8A" /> : <HappyIcon size={20} color={inputText ? '#D0D0D0' : '#6B6B6B'} />}
              </button>
            </div>

            {inputText.trim() ? (
              <button
                onClick={handleSend}
                disabled={sending}
                style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #FF375F, #FF3B30)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 6px 20px rgba(255,55,95,0.4)', opacity: sending ? 0.5 : 1 }}
              >
                <SendIcon size={18} color="white" />
              </button>
            ) : (
              <button
                onPointerDown={handleMicPointerDown}
                onPointerUp={handleMicPointerUp}
                onPointerLeave={handleMicPointerLeave}
                style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #2A2A2A, #1A1A1A)', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, userSelect: 'none', touchAction: 'none' }}
              >
                <MicIcon size={18} color="#D0D0D0" />
              </button>
            )}
          </div>
        )}
      </div>
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
    </GradientBackground>
  );
}
