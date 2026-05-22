'use client';
import React, { useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronBackIcon, CallIcon, VideoIcon, MicIcon, SendIcon, PencilIcon, CloseCircleIcon, HappyIcon, KeypadIcon, StopIcon, CheckmarkDoneIcon } from '@/components/Icons';
import GradientBackground from '@/components/GradientBackground';

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  type: 'text' | 'voice' | 'image';
  mediaUrl?: string;
  replyTo?: { id: string; text: string; senderId: string };
  editedAt?: string;
  createdAt: string;
}

const MOCK_MESSAGES: ChatMessage[] = [
  { id: '1', text: 'Hey there! How are you?', senderId: 'them', type: 'text', createdAt: '10:30 AM' },
  { id: '2', text: "I'm doing great! How about you?", senderId: 'me', type: 'text', createdAt: '10:31 AM' },
  { id: '3', text: 'Would you like to grab coffee sometime?', senderId: 'them', type: 'text', createdAt: '10:32 AM' },
  { id: '4', text: "I'd love that! 😊", senderId: 'me', type: 'text', createdAt: '10:33 AM' },
];

const EMOJIS = ['😀', '😂', '❤️', '🔥', '😍', '🥰', '😘', '💕', '😊', '😎', '🙌', '👋', '💪', '✨', '🌟', '🎉', '🎂', '🍕', '☕', '🌮'];

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; text: string; senderId: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const matchName = 'Sarah Johnson';

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    if (editingId) {
      setMessages(prev => prev.map(m => m.id === editingId ? { ...m, text, editedAt: new Date().toLocaleTimeString() } : m));
      setEditingId(null);
    } else {
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        text,
        senderId: 'me',
        type: 'text',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        replyTo: replyTo || undefined,
      };
      setMessages(prev => [...prev, newMsg]);
    }
    setInputText('');
    setReplyTo(null);
    setShowEmoji(false);
  };

  const handleEmojiPick = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  const handleReply = (msg: ChatMessage) => {
    setReplyTo({ id: msg.id, text: msg.text, senderId: msg.senderId });
  };

  const handleEdit = (msg: ChatMessage) => {
    setEditingId(msg.id);
    setInputText(msg.text);
  };

  return (
    <GradientBackground style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '56px 12px 12px', gap: 12, borderBottom: '1px solid #2A2A2A' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ChevronBackIcon size={28} color="white" />
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #FF375F, #6C63FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>{matchName[0]}</span>
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'white' }}>{matchName}</div>
            <div style={{ fontSize: 12, color: '#34C759' }}>Online</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => router.push(`/call/${params.id}?type=audio`)} style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CallIcon size={22} color="#34C759" />
          </button>
          <button onClick={() => router.push(`/call/${params.id}?type=video`)} style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <VideoIcon size={22} color="#6C63FF" />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {messages.map((msg) => {
          const isMe = msg.senderId === 'me';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: 4,
                marginBottom: 4,
                justifyContent: isMe ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                onDoubleClick={() => handleReply(msg)}
                style={{
                  maxWidth: '78%',
                  padding: '10px 14px',
                  borderRadius: 20,
                  backgroundColor: isMe ? '#FF375F' : '#1A1A1A',
                  borderBottomRightRadius: isMe ? 4 : 20,
                  borderBottomLeftRadius: isMe ? 20 : 4,
                }}
              >
                {msg.replyTo && (
                  <div style={{ borderLeft: '2px solid rgba(255,255,255,0.4)', paddingLeft: 8, marginBottom: 6 }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                      Replying to {msg.replyTo.senderId === 'me' ? 'yourself' : 'them'}
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{msg.replyTo.text}</div>
                  </div>
                )}
                <div style={{ fontSize: 15, color: isMe ? 'white' : '#ABABAB', lineHeight: '20px' }}>{msg.text}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, alignSelf: 'flex-end', justifyContent: 'flex-end' }}>
                  {msg.editedAt && <span style={{ fontSize: 10, color: isMe ? 'rgba(255,255,255,0.5)' : '#6B6B6B', fontStyle: 'italic' }}>edited</span>}
                  <span style={{ fontSize: 10, color: isMe ? 'rgba(255,255,255,0.5)' : '#6B6B6B' }}>{msg.createdAt}</span>
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

      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', gap: 8, borderTop: '1px solid #2A2A2A', backgroundColor: '#0D0D0D' }}>
        <button onClick={() => setShowEmoji(!showEmoji)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          {showEmoji ? <KeypadIcon size={26} color="#ABABAB" /> : <HappyIcon size={26} color="#ABABAB" />}
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', backgroundColor: '#1A1A1A', borderRadius: 9999, padding: '0 16px' }}>
          <input
            style={{ flex: 1, color: 'white', fontSize: 15, background: 'none', border: 'none', outline: 'none', padding: '10px 0' }}
            placeholder={isRecording ? 'Recording...' : 'Type a message...'}
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
          <button onClick={handleSend} style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #FF375F, #6C63FF)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SendIcon size={18} color="white" />
          </button>
        ) : (
          <button
            onClick={() => setIsRecording(!isRecording)}
            style={{ width: 40, height: 40, borderRadius: '50%', background: isRecording ? 'linear-gradient(135deg, #FF3B30, #FF6B6B)' : 'linear-gradient(135deg, #242424, #1A1A1A)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isRecording ? <StopIcon size={18} color="white" /> : <MicIcon size={18} color="#ABABAB" />}
          </button>
        )}
      </div>
    </GradientBackground>
  );
}
