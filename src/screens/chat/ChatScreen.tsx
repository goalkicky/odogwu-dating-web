import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import theme from '../../theme';
import GradientBackground from '../../components/GradientBackground';

interface Message {
  id: string;
  text: string;
  senderId: string;
  type: 'text' | 'voice' | 'image';
  mediaUrl?: string;
  replyTo?: { id: string; text: string; senderId: string };
  editedAt?: string;
  createdAt: string;
  readAt?: string;
  reactions?: string[];
}

const MOCK_MESSAGES: Message[] = [
  { id: '1', text: 'Hey there! How are you?', senderId: 'them', type: 'text', createdAt: new Date(Date.now() - 3600e3).toISOString() },
  { id: '2', text: "I'm doing great! How about you?", senderId: 'me', type: 'text', createdAt: new Date(Date.now() - 3500e3).toISOString(), readAt: new Date().toISOString() },
  { id: '3', text: 'Would you like to grab coffee sometime? ☕', senderId: 'them', type: 'text', createdAt: new Date(Date.now() - 3400e3).toISOString() },
  { id: '4', text: "I'd love that! 😊", senderId: 'me', type: 'text', createdAt: new Date(Date.now() - 3300e3).toISOString(), readAt: new Date().toISOString() },
];

const EMOJIS = ['😀', '😂', '❤️', '🔥', '😍', '🥰', '😘', '💕', '😊', '😎', '🙌', '👋', '💪', '✨', '🌟', '🎉', '🎂', '🍕', '☕', '🌮'];
const QUICK_REPLIES = ['Hey 😊', 'How are you?', "You're gorgeous 🔥", 'Coffee sometime? ☕', 'LOL 😂', '💕'];
const REACTIONS = ['❤️', '😂', '🔥', '😍', '👍', '😮'];
const GROUP_GAP_MS = 5 * 60 * 1000;
const REC_BARS = [6, 12, 8, 16, 10, 18, 12, 20, 8, 14, 10, 18, 12, 16, 8, 14];

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  return `${m}:${(seconds % 60).toString().padStart(2, '0')}`;
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function sameDay(a: string, b: string) {
  const x = new Date(a);
  const y = new Date(b);
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

function HighlightText({ text, query, style }: { text: string; query: string; style: any }) {
  if (!query) return <Text style={style}>{text}</Text>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return <Text style={style}>{text}</Text>;
  return (
    <Text style={style}>
      {text.slice(0, idx)}
      <Text style={styles.highlight}>{text.slice(idx, idx + query.length)}</Text>
      {text.slice(idx + query.length)}
    </Text>
  );
}

function VoiceBubble({ url, isMe }: { url: string; isMe: boolean }) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const bars = useMemo(() => [16, 22, 12, 26, 18, 28, 20, 24, 14, 22, 18, 26, 16, 24, 20, 28], []);
  const barValues = useRef(bars.map(() => new Animated.Value(1))).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (playing) {
      animRef.current = Animated.loop(
        Animated.stagger(
          90,
          barValues.map(v =>
            Animated.sequence([
              Animated.timing(v, { toValue: 0.3, duration: 200, useNativeDriver: true }),
              Animated.timing(v, { toValue: 1, duration: 200, useNativeDriver: true }),
            ])
          )
        )
      );
      animRef.current.start();
    } else if (animRef.current) {
      animRef.current.stop();
      animRef.current = null;
      barValues.forEach(v => v.setValue(1));
    }
  }, [playing]);

  const toggle = async () => {
    try {
      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync({ uri: url }, undefined, status => {
          if (status.isLoaded) {
            setElapsed(status.positionMillis / 1000);
            if (status.didJustFinish) {
              setPlaying(false);
              setElapsed(0);
            }
          }
        });
        soundRef.current = sound;
      }
      const sound = soundRef.current;
      if (!sound) return;
      if (playing) {
        await sound.pauseAsync();
        setPlaying(false);
      } else {
        await sound.playAsync();
        setPlaying(true);
      }
    } catch {}
  };

  useEffect(() => () => { soundRef.current?.unloadAsync(); }, []);

  return (
    <View style={styles.voiceContainer}>
      <TouchableOpacity onPress={toggle} style={[styles.voiceBtn, isMe ? styles.voiceBtnMe : styles.voiceBtnThem]}>
        <Ionicons name={playing ? 'pause' : 'play'} size={13} color="white" />
      </TouchableOpacity>
      <View style={styles.voiceWave}>
        {bars.map((h, i) => (
          <Animated.View
            key={i}
            style={{
              width: 3,
              height: h,
              borderRadius: 2,
              backgroundColor: isMe ? 'rgba(255,255,255,0.9)' : '#FF6B8A',
              opacity: playing ? barValues[i] : 0.45,
            }}
          />
        ))}
      </View>
      <Text style={[styles.voiceDuration, isMe && { color: 'rgba(255,255,255,0.75)' }]}>
        {formatDuration(Math.round(elapsed))}
      </Text>
    </View>
  );
}

export default function ChatScreen({ route, navigation }: any) {
  const { match } = route.params;
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; text: string; senderId: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingLocked, setRecordingLocked] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<Message | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Audio.requestPermissionsAsync();
  }, []);

  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => setRecordingDuration(prev => prev + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const visibleMessages = useMemo(() => {
    if (!searchOpen || !searchQuery.trim()) return messages;
    const q = searchQuery.trim().toLowerCase();
    return messages.filter(m => m.type === 'text' && m.text.toLowerCase().includes(q));
  }, [messages, searchOpen, searchQuery]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    if (editingId) {
      setMessages(prev =>
        prev.map(m => m.id === editingId ? { ...m, text, editedAt: new Date().toISOString() } : m)
      );
      setEditingId(null);
    } else {
      const newMsg: Message = {
        id: Date.now().toString(),
        text,
        senderId: 'me',
        type: 'text',
        createdAt: new Date().toISOString(),
        readAt: new Date().toISOString(),
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

  const handleReply = (msg: Message) => {
    setReplyTo({ id: msg.id, text: msg.text, senderId: msg.senderId });
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const handleEdit = (msg: Message) => {
    setEditingId(msg.id);
    setInputText(msg.text);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const toggleReaction = (msg: Message, emoji: string) => {
    setMessages(prev =>
      prev.map(m => {
        if (m.id !== msg.id) return m;
        const reactions = [...(m.reactions || [])];
        const i = reactions.indexOf(emoji);
        if (i >= 0) reactions.splice(i, 1);
        else reactions.push(emoji);
        return { ...m, reactions };
      })
    );
    setActionMsg(null);
  };

  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'] as ImagePicker.MediaType[],
        quality: 0.8,
      });
      if (!res.canceled && res.assets && res.assets[0]) {
        const asset = res.assets[0];
        const newMsg: Message = {
          id: Date.now().toString(),
          text: '',
          senderId: 'me',
          type: 'image',
          mediaUrl: asset.uri,
          createdAt: new Date().toISOString(),
          readAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, newMsg]);
      }
    } catch {}
  };

  const startRecording = async () => {
    if (recording) return;
    try {
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setIsRecording(true);
      setRecordingDuration(0);
      setRecordingLocked(false);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async (send = true) => {
    if (!recording) return;
    let uri: string | null = null;
    try {
      await recording.stopAndUnloadAsync();
      uri = recording.getURI();
    } catch {}
    setRecording(null);
    setIsRecording(false);
    setRecordingDuration(0);
    setRecordingLocked(false);
    if (send && uri) {
      const newMsg: Message = {
        id: Date.now().toString(),
        text: '',
        senderId: 'me',
        type: 'voice',
        mediaUrl: uri,
        createdAt: new Date().toISOString(),
        readAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMsg]);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const data = visibleMessages;
    const prev = data[index - 1];
    const next = data[index + 1];
    const isMe = item.senderId === 'me';
    const showDivider = !prev || !sameDay(prev.createdAt, item.createdAt);
    const sameGroupAsPrev =
      !!prev &&
      prev.senderId === item.senderId &&
      sameDay(prev.createdAt, item.createdAt) &&
      new Date(item.createdAt).getTime() - new Date(prev.createdAt).getTime() < GROUP_GAP_MS;
    const sameGroupAsNext =
      !!next &&
      next.senderId === item.senderId &&
      sameDay(next.createdAt, item.createdAt) &&
      new Date(next.createdAt).getTime() - new Date(item.createdAt).getTime() < GROUP_GAP_MS;
    const showSender = !isMe && !sameGroupAsPrev;
    const showTime = !sameGroupAsNext;
    const isImage = item.type === 'image';
    const isVoice = item.type === 'voice';
    const metaColor = isMe ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.4)';

    return (
      <View key={item.id}>
        {showDivider && (
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{dateDivider(item.createdAt)}</Text>
            <View style={styles.dividerLine} />
          </View>
        )}

        <View style={[styles.msgColumn, isMe ? styles.msgColumnMe : styles.msgColumnThem, { marginBottom: sameGroupAsPrev ? 2 : 12 }]}>
          {showSender && <Text style={styles.senderLabel}>{match.name}</Text>}

          <TouchableOpacity
            activeOpacity={0.85}
            onLongPress={() => setActionMsg(item)}
            onPress={() => { if (isImage && item.mediaUrl) setLightbox(item.mediaUrl); }}
            style={isImage ? styles.imageBubbleWrap : undefined}
          >
            <View style={isImage ? styles.imageBubble : [styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
              {item.replyTo && (
                <View style={[styles.replyPreview, { borderLeftColor: isMe ? 'rgba(255,255,255,0.5)' : '#FF6B8A' }]}>
                  <Text style={[styles.replyLabel, { color: isMe ? 'rgba(255,255,255,0.75)' : '#FF6B8A' }]}>
                    {item.replyTo.senderId === 'me' ? 'You' : match.name}
                  </Text>
                  <Text style={[styles.replyText, { color: isMe ? 'rgba(255,255,255,0.85)' : '#ABABAB' }]} numberOfLines={1}>
                    {item.replyTo.text}
                  </Text>
                </View>
              )}

              {isVoice && item.mediaUrl ? (
                <VoiceBubble url={item.mediaUrl} isMe={isMe} />
              ) : isImage && item.mediaUrl ? (
                <View>
                  <Image source={{ uri: item.mediaUrl }} style={styles.imageMsg} resizeMode="cover" />
                  {(showTime || item.editedAt) && (
                    <View style={styles.imageMeta}>
                      {item.editedAt && <Text style={[styles.edited, { color: metaColor }]}>edited</Text>}
                      <Text style={[styles.time, { color: metaColor }]}>{formatTime(item.createdAt)}</Text>
                      {isMe && <Ionicons name="checkmark-done" size={13} color={item.readAt ? '#7CFFA0' : 'rgba(255,255,255,0.55)'} />}
                    </View>
                  )}
                </View>
              ) : (
                <HighlightText
                  text={item.text}
                  query={searchOpen ? searchQuery : ''}
                  style={[styles.messageText, isMe && styles.myMessageText]}
                />
              )}

              {!isImage && (showTime || item.editedAt) && (
                <View style={styles.messageMeta}>
                  {item.editedAt && <Text style={[styles.edited, { color: metaColor }]}>edited</Text>}
                  <Text style={[styles.time, { color: metaColor }]}>{formatTime(item.createdAt)}</Text>
                  {isMe && <Ionicons name="checkmark-done" size={13} color={item.readAt ? '#7CFFA0' : 'rgba(255,255,255,0.55)'} />}
                </View>
              )}
            </View>
          </TouchableOpacity>

          {(item.reactions || []).length > 0 && (
            <View style={[styles.reactionChips, isMe ? styles.reactionChipsMe : styles.reactionChipsThem]}>
              {(item.reactions || []).map((r, ri) => (
                <View key={ri} style={styles.reactionChip}>
                  <Text style={styles.reactionChipText}>{r}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <GradientBackground>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconBtn}>
          <Ionicons name="chevron-back" size={20} color="white" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerUser} activeOpacity={0.8}>
          <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.headerAvatarRing}>
            <View style={styles.headerAvatarInner}>
              <Text style={styles.headerAvatarText}>{(match.name[0] || 'U').toUpperCase()}</Text>
            </View>
          </LinearGradient>
          <View style={styles.onlineDotWrap}>
            <Animated.View style={[styles.onlineDot, { opacity: pulseAnim }]} />
          </View>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.headerName} numberOfLines={1}>{match.name}</Text>
            <View style={styles.headerStatusRow}>
              <Animated.View style={[styles.statusPulseDot, { opacity: pulseAnim }]} />
              <Text style={styles.headerStatus}>Online now</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerAction, searchOpen && styles.headerActionActive]}
            onPress={() => { setSearchOpen(o => !o); setSearchQuery(''); }}
          >
            <Ionicons name={searchOpen ? 'close' : 'search'} size={18} color={searchOpen ? '#FF6B8A' : '#D0D0D0'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerAction, styles.callBtn]}
            onPress={() => navigation.navigate('Call', { match, callType: 'audio' })}
          >
            <Ionicons name="call" size={18} color={theme.colors.success} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerAction, styles.videoBtn]}
            onPress={() => navigation.navigate('Call', { match, callType: 'video' })}
          >
            <Ionicons name="videocam" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {searchOpen && (
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={theme.colors.textTertiary} />
          <TextInput
            autoFocus
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search messages..."
            placeholderTextColor={theme.colors.textTertiary}
            style={styles.searchInput}
          />
          {searchQuery.trim().length > 0 && (
            <Text style={styles.searchCount}>
              {visibleMessages.length} {visibleMessages.length === 1 ? 'match' : 'matches'}
            </Text>
          )}
        </View>
      )}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <FlatList
          ref={flatListRef}
          data={visibleMessages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          onContentSizeChange={() => {
            if (!searchOpen) flatListRef.current?.scrollToEnd({ animated: true });
          }}
          ListEmptyComponent={
            !searchOpen ? (
              <View style={styles.emptyState}>
                <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.emptyAvatar}>
                  <Text style={styles.emptyAvatarText}>{(match.name[0] || 'U').toUpperCase()}</Text>
                </LinearGradient>
                <Text style={styles.emptyTitle}>You matched with {match.name}!</Text>
                <Text style={styles.emptySubtitle}>
                  Say hi and start the conversation — compliments go a long way ✨
                </Text>
              </View>
            ) : searchQuery.trim().length > 0 ? (
              <Text style={styles.noResults}>No messages match “{searchQuery}”</Text>
            ) : null
          }
        />

        {!searchOpen && !isRecording && messages.length > 0 && inputText.trim() === '' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickReplies}
            keyboardShouldPersistTaps="handled"
          >
            {QUICK_REPLIES.map(q => (
              <TouchableOpacity key={q} style={styles.quickReply} onPress={() => setInputText(q)}>
                <Text style={styles.quickReplyText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={{ flexShrink: 0 }}>
          {editingId && (
            <View style={[styles.editBar, styles.editBarGold]}>
              <Ionicons name="pencil" size={14} color={theme.colors.accent} />
              <Text style={[styles.editBarLabel, { color: theme.colors.accent }]}>Editing message</Text>
              <TouchableOpacity onPress={() => { setEditingId(null); setInputText(''); }}>
                <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {replyTo && (
            <View style={[styles.editBar, styles.editBarPink]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.editBarLabel, { color: '#FF6B8A' }]}>
                  Replying to {replyTo.senderId === 'me' ? 'yourself' : match.name}
                </Text>
                <Text style={styles.replyBarText} numberOfLines={1}>{replyTo.text}</Text>
              </View>
              <TouchableOpacity onPress={() => setReplyTo(null)}>
                <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {showEmoji && (
            <View style={styles.emojiContainer}>
              <View style={styles.emojiHeader}>
                <Text style={styles.emojiTitle}>EMOJIS</Text>
                <TouchableOpacity onPress={() => setShowEmoji(false)}>
                  <Ionicons name="close" size={18} color={theme.colors.textTertiary} />
                </TouchableOpacity>
              </View>
              <View style={styles.emojiGrid}>
                {EMOJIS.map((emoji, i) => (
                  <TouchableOpacity key={i} style={styles.emojiItem} onPress={() => handleEmojiPick(emoji)}>
                    <Text style={styles.emoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {isRecording ? (
            <View style={styles.recordingBar}>
              <View style={styles.recordingInfo}>
                <Animated.View style={[styles.recDot, { opacity: pulseAnim }]} />
                <Text style={styles.recTime}>{formatDuration(recordingDuration)}</Text>
                <View style={styles.recWave}>
                  {REC_BARS.map((h, i) => (
                    <View key={i} style={[styles.recBar, { height: h, backgroundColor: i % 3 === 0 ? theme.colors.primary : '#FF6B8A' }]} />
                  ))}
                </View>
              </View>
              {recordingLocked ? (
                <>
                  <TouchableOpacity style={[styles.recBtn, styles.recBtnCancel]} onPress={() => stopRecording(false)}>
                    <Ionicons name="close" size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.recBtn, styles.recBtnSend]} onPress={() => stopRecording(true)}>
                    <Ionicons name="send" size={18} color="white" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.lockBtn} onPress={() => setRecordingLocked(true)}>
                    <Ionicons name="lock-closed" size={16} color="#FF6B8A" />
                    <Text style={styles.lockText}>Lock</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.recBtn, styles.recBtnGhost]} onPress={() => stopRecording(false)}>
                    <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
                <Ionicons name="image-outline" size={20} color="#FF6B8A" />
              </TouchableOpacity>

              <View style={styles.inputWrapper}>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder="Type a message..."
                  placeholderTextColor={theme.colors.textTertiary}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  maxLength={1000}
                />
                {inputText.length > 0 && (
                  <TouchableOpacity onPress={() => setInputText('')} style={styles.clearBtn}>
                    <Ionicons name="close-circle" size={16} color={theme.colors.textTertiary} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setShowEmoji(!showEmoji)} style={styles.emojiToggle}>
                  <Ionicons name={showEmoji ? 'keypad-outline' : 'happy-outline'} size={20} color={inputText ? '#D0D0D0' : theme.colors.textTertiary} />
                </TouchableOpacity>
              </View>

              {inputText.trim() ? (
                <TouchableOpacity onPress={handleSend}>
                  <LinearGradient colors={[theme.colors.primary, '#FF3B30']} style={styles.sendBtn}>
                    <Ionicons name="send" size={18} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={startRecording}>
                  <LinearGradient colors={['#2A2A2A', '#1A1A1A']} style={styles.micBtn}>
                    <Ionicons name="mic" size={18} color="#D0D0D0" />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      <Modal transparent visible={!!lightbox} animationType="fade" onRequestClose={() => setLightbox(null)}>
        <TouchableOpacity style={styles.lightboxBackdrop} activeOpacity={1} onPress={() => setLightbox(null)}>
          {lightbox && <Image source={{ uri: lightbox }} style={styles.lightboxImage} resizeMode="contain" />}
          <View style={styles.lightboxClose} pointerEvents="none">
            <Ionicons name="close" size={24} color="white" />
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent visible={!!actionMsg} animationType="fade" onRequestClose={() => setActionMsg(null)}>
        <TouchableOpacity style={styles.sheetBackdrop} activeOpacity={1} onPress={() => setActionMsg(null)}>
          {actionMsg && (
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>React to message</Text>
              <View style={styles.sheetReactions}>
                {REACTIONS.map(r => (
                  <TouchableOpacity key={r} onPress={() => toggleReaction(actionMsg, r)} style={styles.sheetReaction}>
                    <Text style={[styles.sheetReactionEmoji, { opacity: (actionMsg.reactions || []).includes(r) ? 1 : 0.55 }]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.sheetDivider} />
              <TouchableOpacity style={styles.sheetAction} onPress={() => { handleReply(actionMsg); setActionMsg(null); }}>
                <Ionicons name="arrow-undo" size={18} color={theme.colors.textSecondary} />
                <Text style={styles.sheetActionText}>Reply</Text>
              </TouchableOpacity>
              {actionMsg.senderId === 'me' && (
                <TouchableOpacity style={styles.sheetAction} onPress={() => { handleEdit(actionMsg); setActionMsg(null); }}>
                  <Ionicons name="pencil" size={18} color={theme.colors.textSecondary} />
                  <Text style={styles.sheetActionText}>Edit message</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.sheetAction, styles.sheetCancel]} onPress={() => setActionMsg(null)}>
                <Text style={[styles.sheetActionText, { color: theme.colors.error }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 56,
    paddingBottom: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(13,13,13,0.7)',
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerUser: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  headerAvatarRing: { width: 44, height: 44, borderRadius: 22, padding: 3 },
  headerAvatarInner: {
    flex: 1,
    borderRadius: 19,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: { color: 'white', fontWeight: '800', fontSize: 18 },
  onlineDotWrap: { position: 'absolute', left: 34, bottom: 2 },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0D0D0D',
    backgroundColor: theme.colors.success,
  },
  headerName: { fontSize: 17, fontWeight: '800', color: theme.colors.text },
  headerStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 },
  statusPulseDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: theme.colors.success },
  headerStatus: { fontSize: 12, fontWeight: '600', color: theme.colors.success },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerAction: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionActive: { borderColor: 'rgba(255,55,95,0.35)', backgroundColor: 'rgba(255,55,95,0.12)' },
  callBtn: { borderColor: 'rgba(52,199,89,0.25)', backgroundColor: 'rgba(52,199,89,0.08)' },
  videoBtn: { borderColor: 'rgba(255,55,95,0.3)', backgroundColor: 'rgba(255,55,95,0.1)' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  searchInput: { flex: 1, color: theme.colors.text, fontSize: 14, paddingVertical: 4 },
  searchCount: { fontSize: 12, color: theme.colors.textTertiary },
  messagesList: { paddingHorizontal: 12, paddingVertical: 12, flexGrow: 1 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#7A7A7A',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  msgColumn: { flexDirection: 'column' },
  msgColumnMe: { alignItems: 'flex-end' },
  msgColumnThem: { alignItems: 'flex-start' },
  senderLabel: {
    fontSize: 11,
    color: '#7A7A7A',
    fontWeight: '700',
    marginHorizontal: 6,
    marginBottom: 4,
  },
  imageBubbleWrap: { maxWidth: '80%' },
  imageBubble: { borderRadius: 16, overflow: 'hidden' },
  bubble: { maxWidth: '100%', paddingHorizontal: 13, paddingVertical: 9, borderRadius: 18 },
  myBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  theirBubble: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderBottomLeftRadius: 4,
  },
  replyPreview: {
    borderLeftWidth: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  replyLabel: { fontSize: 11, fontWeight: '700' },
  replyText: { fontSize: 12, marginTop: 2, maxWidth: 220 },
  messageText: { fontSize: 15, color: '#E8E8E8', lineHeight: 21 },
  myMessageText: { color: 'white' },
  highlight: { backgroundColor: 'rgba(255,215,0,0.3)', borderRadius: 3 },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    justifyContent: 'flex-end',
  },
  imageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  edited: { fontSize: 10, fontStyle: 'italic' },
  time: { fontSize: 10 },
  imageMsg: { width: 220, height: 250, borderRadius: 12 },
  reactionChips: { flexDirection: 'row', gap: 4, marginTop: 4 },
  reactionChipsMe: { marginRight: 8 },
  reactionChipsThem: { marginLeft: 8 },
  reactionChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  reactionChipText: { fontSize: 13, lineHeight: 18 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  emptyAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  emptyAvatarText: { color: 'white', fontWeight: '800', fontSize: 30 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  emptySubtitle: {
    fontSize: 13,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 20,
  },
  noResults: { textAlign: 'center', color: theme.colors.textTertiary, fontSize: 14, padding: 40 },
  quickReplies: { flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingVertical: 4, paddingBottom: 8 },
  quickReply: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 9999,
    paddingHorizontal: 13,
    paddingVertical: 6,
  },
  quickReplyText: { fontSize: 13, color: '#D0D0D0' },
  editBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  editBarGold: { backgroundColor: 'rgba(255,215,0,0.06)', borderTopColor: 'rgba(255,215,0,0.15)' },
  editBarPink: { backgroundColor: 'rgba(255,55,95,0.07)', borderTopColor: 'rgba(255,55,95,0.15)' },
  editBarLabel: { flex: 1, fontSize: 13, fontWeight: '700' },
  replyBarText: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  emojiContainer: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: 12,
  },
  emojiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  emojiTitle: { fontSize: 12, color: theme.colors.textTertiary, fontWeight: '700', letterSpacing: 1 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8, gap: 4 },
  emojiItem: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 27 },
  recordingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(13,13,13,0.9)',
  },
  recordingInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.error,
    shadowColor: theme.colors.error,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  recTime: { fontSize: 15, color: 'white', fontWeight: '700' },
  recWave: { flexDirection: 'row', alignItems: 'center', gap: 2, height: 26 },
  recBar: { width: 3, borderRadius: 2 },
  recBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recBtnCancel: { backgroundColor: 'rgba(255,59,48,0.15)', borderColor: 'rgba(255,59,48,0.3)' },
  recBtnSend: { backgroundColor: theme.colors.primary, borderColor: 'transparent' },
  recBtnGhost: { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.1)' },
  lockBtn: { alignItems: 'center', gap: 2, paddingHorizontal: 8 },
  lockText: { fontSize: 9, color: '#FF6B8A', fontWeight: '700' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  attachBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 16,
  },
  input: { flex: 1, color: theme.colors.text, fontSize: 15, maxHeight: 100, paddingVertical: 10 },
  clearBtn: { marginLeft: 4 },
  emojiToggle: { padding: 6, borderRadius: 18 },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 6,
  },
  micBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 190 },
  voiceBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceBtnMe: { backgroundColor: 'rgba(255,255,255,0.22)' },
  voiceBtnThem: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  voiceWave: { flexDirection: 'row', alignItems: 'center', gap: 2, height: 26 },
  voiceDuration: { fontSize: 12, color: '#ABABAB', minWidth: 34 },
  lightboxBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxImage: { width: '92%', height: '82%', borderRadius: 16 },
  lightboxClose: {
    position: 'absolute',
    top: 50,
    right: 18,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    width: '82%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  sheetTitle: {
    textAlign: 'center',
    fontSize: 13,
    color: theme.colors.textTertiary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  sheetReactions: { flexDirection: 'row', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  sheetReaction: { padding: 6 },
  sheetReactionEmoji: { fontSize: 30 },
  sheetDivider: { height: 1, backgroundColor: theme.colors.border, marginBottom: 8 },
  sheetAction: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 13 },
  sheetActionText: { fontSize: 16, color: theme.colors.text },
  sheetCancel: { borderTopWidth: 1, borderTopColor: theme.colors.border, justifyContent: 'center' },
});
