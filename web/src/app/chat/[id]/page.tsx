'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronBackIcon, CallIcon, VideoIcon, MicIcon, SendIcon, PencilIcon, CloseCircleIcon, HappyIcon, KeypadIcon, StopIcon, CheckmarkDoneIcon } from '@/components/Icons';
import GradientBackground from '@/components/GradientBackground';
import { useAuth } from '@/store/AuthContext';
import { messageService, storageService, matchService, userService } from '@/lib/appwrite/services';
import { account } from '@/lib/appwrite/config';
import type { Message } from '@/lib/types';

const EMOJIS = ['😀', '😂', '❤️', '🔥', '😍', '🥰', '😘', '💕', '😊', '😎', '🙌', '👋', '💪', '✨', '🌟', '🎉', '🎂', '🍕', '☕', '🌮'];

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
  const [swipeToCancel, setSwipeToCancel] = useState(false);
  const [matchName, setMatchName] = useState('User');
  const [otherUserId, setOtherUserId] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const unsubRef = useRef<{ unsubscribe: () => Promise<void> } | null>(null);

  const userId = (profile as any)?.$id || user?.$id;

  useEffect(() => {
    if (!matchId || !userId) return;
    matchService.getMatch(matchId).then(doc => {
      const other = (doc as any).userId === userId ? (doc as any).matchedUserId : (doc as any).userId;
      setOtherUserId(other);
      userService.getProfile(other).then(p => {
        setMatchName((p as any).displayName || (p as any).fullName || 'User');
      }).catch(() => {});
    }).catch(() => {});
    messageService.getMessages(matchId).then(res => {
      const msgs = res.documents.map(d => ({
        id: d.$id,
        matchId: d.matchId,
        senderId: d.senderId,
        text: d.text,
        type: d.type,
        mediaUrl: d.mediaUrl,
        replyTo: d.replyTo ? (typeof d.replyTo === 'string' ? JSON.parse(d.replyTo) : d.replyTo) : undefined,
        editedAt: d.editedAt,
        createdAt: d.createdAt,
        readAt: d.readAt,
      })) as Message[];
      setMessages(msgs);
    }).catch(() => {});

    messageService.subscribeToMessages(matchId, (msg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    }).then(sub => { unsubRef.current = sub; });
    return () => { if (unsubRef.current) unsubRef.current.unsubscribe(); };
  }, [matchId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        await messageService.sendMessage(matchId, userId, { text, type: 'text', replyTo: replyTo || undefined });
      }
      setInputText('');
      setReplyTo(null);
      setShowEmoji(false);
    } catch {}
    setSending(false);
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
      setSwipeToCancel(false);
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
    setSwipeToCancel(false);
    setRecordingDuration(0);
  };

  const cancelRecording = () => {
    stopRecording(false);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleMicPointerDown = async () => {
    await startRecording();
  };

  const handleMicPointerUp = () => {
    if (!recordingLocked && isRecording) {
      stopRecording(true);
    }
  };

  const handleMicPointerLeave = () => {
    if (!recordingLocked && isRecording) {
      stopRecording(false);
    }
  };

  const handleRecordingSwipe = (clientY: number, clientX: number) => {
    if (!isRecording || !recordingLocked) return;
  };

  const toggleRecordingLock = () => {
    if (isRecording && !recordingLocked) {
      setRecordingLocked(true);
    }
  };

  const handleEmojiPick = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  const handleReply = (msg: Message) => {
    setReplyTo({ id: msg.id, text: msg.text, senderId: msg.senderId });
  };

  const handleEdit = (msg: Message) => {
    setEditingId(msg.id);
    setInputText(msg.text);
  };

  const formatTime = (iso: string) => {
    try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return iso; }
  };

  return (
    <GradientBackground style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '56px 12px 12px', gap: 12, borderBottom: '1px solid #2A2A2A' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ChevronBackIcon size={28} color="white" />
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #FF375F, #FF3B30)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>{matchName[0]}</span>
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'white' }}>{matchName}</div>
            <div style={{ fontSize: 12, color: '#34C759' }}>Online</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => router.push(`/call/${matchId}?type=audio&otherId=${otherUserId}`)} style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CallIcon size={22} color="#34C759" />
          </button>
          <button onClick={() => router.push(`/call/${matchId}?type=video&otherId=${otherUserId}`)} style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <VideoIcon size={22} color="#FF375F" />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {messages.map((msg) => {
          const isMe = msg.senderId === userId;
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginBottom: 4, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div onDoubleClick={() => handleReply(msg)} style={{ maxWidth: '78%', padding: '10px 14px', borderRadius: 20, backgroundColor: isMe ? '#FF375F' : '#1A1A1A', borderBottomRightRadius: isMe ? 4 : 20, borderBottomLeftRadius: isMe ? 20 : 4 }}>
                {msg.replyTo && (
                  <div style={{ borderLeft: '2px solid rgba(255,255,255,0.4)', paddingLeft: 8, marginBottom: 6 }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Replying to {msg.replyTo.senderId === userId ? 'yourself' : 'them'}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{msg.replyTo.text}</div>
                  </div>
                )}
                {msg.type === 'voice' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MicIcon size={18} color={isMe ? 'white' : '#FF375F'} />
                    <span style={{ fontSize: 13, color: isMe ? 'rgba(255,255,255,0.7)' : '#ABABAB' }}>Voice message</span>
                  </div>
                ) : msg.type === 'image' ? (
                  msg.mediaUrl && <img src={storageService.getFilePreview(msg.mediaUrl)} alt="" style={{ maxWidth: 200, borderRadius: 8 }} />
                ) : (
                  <div style={{ fontSize: 15, color: isMe ? 'white' : '#ABABAB', lineHeight: '20px' }}>{msg.text}</div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, alignSelf: 'flex-end', justifyContent: 'flex-end' }}>
                  {msg.editedAt && <span style={{ fontSize: 10, color: isMe ? 'rgba(255,255,255,0.5)' : '#6B6B6B', fontStyle: 'italic' }}>edited</span>}
                  <span style={{ fontSize: 10, color: isMe ? 'rgba(255,255,255,0.5)' : '#6B6B6B' }}>{formatTime(msg.createdAt)}</span>
                  {isMe && <CheckmarkDoneIcon size={14} color="rgba(255,255,255,0.5)" />}
                </div>
              </div>
              {isMe && (
                <button onClick={() => handleEdit(msg)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <PencilIcon size={12} color="#6B6B6B" />
                </button>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {replyTo && (
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', backgroundColor: '#1A1A1A', borderTop: '1px solid #2A2A2A', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: '#FF375F', fontWeight: 600 }}>Replying</div>
            <div style={{ fontSize: 13, color: '#ABABAB', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{replyTo.text}</div>
          </div>
          <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <CloseCircleIcon size={20} color="#ABABAB" />
          </button>
        </div>
      )}

      {showEmoji && (
        <div style={{ backgroundColor: '#1A1A1A', borderTop: '1px solid #2A2A2A', paddingBottom: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', padding: 8, gap: 4 }}>
            {EMOJIS.map((emoji, i) => (
              <button key={i} onClick={() => handleEmojiPick(emoji)} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: 26 }}>
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {isRecording ? (
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: 8, borderTop: '1px solid #2A2A2A', backgroundColor: '#0D0D0D' }}>
          <button onClick={() => setShowEmoji(!showEmoji)} style={{ background: 'none', border: 'none', cursor: 'pointer', visibility: 'hidden' }}>
            <HappyIcon size={26} color="#ABABAB" />
          </button>
          <div
            onPointerDown={toggleRecordingLock}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '10px 16px' }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#FF3B30', animation: 'pulse 1s infinite' }} />
            <span style={{ fontSize: 15, color: '#ABABAB', fontVariant: 'tabular-nums' }}>{formatDuration(recordingDuration)}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 24 }}>
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 3,
                    height: Math.random() * 20 + 4,
                    backgroundColor: i % 3 === 0 ? '#FF375F' : '#FF3B30',
                    borderRadius: 2,
                    opacity: 0.7 + Math.random() * 0.3,
                  }}
                />
              ))}
            </div>
            {!recordingLocked && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ABABAB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"/>
                </svg>
                <span style={{ fontSize: 9, color: '#6B6B6B' }}>Lock</span>
              </div>
            )}
            {recordingLocked && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF375F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span style={{ fontSize: 9, color: '#FF375F' }}>Locked</span>
              </div>
            )}
          </div>
          {recordingLocked ? (
            <>
              <button onClick={() => cancelRecording()} style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,59,48,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CloseCircleIcon size={20} color="#FF3B30" />
              </button>
              <button onClick={() => stopRecording(true)} style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #FF375F, #FF3B30)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SendIcon size={18} color="white" />
              </button>
            </>
          ) : (
            <button onClick={() => stopRecording(false)} style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CloseCircleIcon size={20} color="#ABABAB" />
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: 8, borderTop: '1px solid #2A2A2A', backgroundColor: '#0D0D0D' }}>
          <button onClick={() => setShowEmoji(!showEmoji)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            {showEmoji ? <KeypadIcon size={26} color="#ABABAB" /> : <HappyIcon size={26} color="#ABABAB" />}
          </button>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 9999, padding: '0 16px' }}>
            <input
              style={{ flex: 1, color: 'white', fontSize: 15, background: 'none', border: 'none', outline: 'none', padding: '10px 0' }}
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              maxLength={1000}
            />
            {inputText.length > 0 && (
              <button onClick={() => setInputText('')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <CloseCircleIcon size={16} color="#6B6B6B" />
              </button>
            )}
          </div>
          {inputText.trim() ? (
            <button onClick={handleSend} style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #FF375F, #FF3B30)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: sending ? 0.5 : 1 }} disabled={sending}>
              <SendIcon size={18} color="white" />
            </button>
          ) : (
            <button
              onPointerDown={handleMicPointerDown}
              onPointerUp={handleMicPointerUp}
              onPointerLeave={handleMicPointerLeave}
              style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #242424, #1A1A1A)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none', touchAction: 'none' }}
            >
              <MicIcon size={18} color="#ABABAB" />
            </button>
          )}
        </div>
      )}
    </GradientBackground>
  );
}
