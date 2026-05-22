import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
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
}

const MOCK_MESSAGES: Message[] = [
  { id: '1', text: 'Hey there! How are you?', senderId: 'them', type: 'text', createdAt: '10:30 AM' },
  { id: '2', text: "I'm doing great! How about you?", senderId: 'me', type: 'text', createdAt: '10:31 AM' },
  { id: '3', text: 'Would you like to grab coffee sometime?', senderId: 'them', type: 'text', createdAt: '10:32 AM' },
  { id: '4', text: "I'd love that! 😊", senderId: 'me', type: 'text', createdAt: '10:33 AM' },
];

const EMOJIS = ['😀', '😂', '❤️', '🔥', '😍', '🥰', '😘', '💕', '😊', '😎', '🙌', '👋', '💪', '✨', '🌟', '🎉', '🎂', '🍕', '☕', '🌮'];

export default function ChatScreen({ route, navigation }: any) {
  const { match } = route.params;
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; text: string; senderId: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    Audio.requestPermissionsAsync();
  }, []);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text) return;
    if (editingId) {
      setMessages(prev =>
        prev.map(m => m.id === editingId ? { ...m, text, editedAt: new Date().toLocaleTimeString() } : m)
      );
      setEditingId(null);
    } else {
      const newMsg: Message = {
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

  const handleReply = (msg: Message) => {
    setReplyTo({ id: msg.id, text: msg.text, senderId: msg.senderId });
    inputRef.current?.focus();
  };

  const handleEdit = (msg: Message) => {
    setEditingId(msg.id);
    setInputText(msg.text);
    inputRef.current?.focus();
  };

  const startRecording = async () => {
    try {
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    if (uri) {
      const newMsg: Message = {
        id: Date.now().toString(),
        text: 'Voice message',
        senderId: 'me',
        type: 'voice',
        mediaUrl: uri,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, newMsg]);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === 'me';
    return (
      <TouchableOpacity
        onLongPress={() => handleReply(item)}
        activeOpacity={0.8}
        style={[styles.messageRow, isMe && styles.messageRowMe]}
      >
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
          {item.replyTo && (
            <View style={styles.replyPreview}>
              <Text style={styles.replyLabel}>
                Replying to {item.replyTo.senderId === 'me' ? 'yourself' : 'them'}
              </Text>
              <Text style={styles.replyText} numberOfLines={1}>{item.replyTo.text}</Text>
            </View>
          )}
          {item.type === 'voice' ? (
            <View style={styles.voiceContainer}>
              <Ionicons name="mic" size={18} color={isMe ? 'white' : theme.colors.primary} />
              <View style={styles.voiceWave}>
                {[1, 2, 3, 4, 3, 2, 1].map((h, i) => (
                  <View key={i} style={[styles.waveBar, { height: h * 3 }, isMe && styles.waveBarMe]} />
                ))}
              </View>
              <Text style={[styles.voiceDuration, isMe && { color: 'rgba(255,255,255,0.7)' }]}>0:12</Text>
            </View>
          ) : (
            <Text style={[styles.messageText, isMe && styles.myMessageText]}>{item.text}</Text>
          )}
          <View style={styles.messageMeta}>
            {item.editedAt && <Text style={[styles.edited, isMe && { color: 'rgba(255,255,255,0.5)' }]}>edited</Text>}
            <Text style={[styles.time, isMe && { color: 'rgba(255,255,255,0.5)' }]}>{item.createdAt}</Text>
            {isMe && <Ionicons name="checkmark-done" size={14} color="rgba(255,255,255,0.5)" />}
          </View>
        </View>
        {isMe && (
          <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
            <Ionicons name="pencil" size={12} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <GradientBackground>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerUser} onPress={() => {}}>
          <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{match.name[0]}</Text>
          </LinearGradient>
          <View>
            <Text style={styles.headerName}>{match.name}</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerAction} onPress={() => navigation.navigate('Call', { match, callType: 'audio' })}>
            <Ionicons name="call" size={22} color={theme.colors.success} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAction} onPress={() => navigation.navigate('Call', { match, callType: 'video' })}>
            <Ionicons name="videocam" size={22} color={theme.colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        {replyTo && (
          <View style={styles.replyBar}>
            <View style={styles.replyBarContent}>
              <Text style={styles.replyBarLabel}>Replying</Text>
              <Text style={styles.replyBarText} numberOfLines={1}>{replyTo.text}</Text>
            </View>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        {showEmoji && (
          <View style={styles.emojiContainer}>
            <FlatList
              data={EMOJIS}
              keyExtractor={item => item}
              numColumns={8}
              contentContainerStyle={styles.emojiGrid}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleEmojiPick(item)} style={styles.emojiItem}>
                  <Text style={styles.emoji}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={() => setShowEmoji(!showEmoji)}>
            <Ionicons name={showEmoji ? 'keypad-outline' : 'happy-outline'} size={26} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder={isRecording ? 'Recording...' : 'Type a message...'}
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
          </View>
          {inputText.trim() ? (
            <TouchableOpacity onPress={handleSend}>
              <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.sendBtn}>
                <Ionicons name="send" size={18} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
            >
              <LinearGradient
                colors={isRecording ? ['#FF3B30', '#FF6B6B'] : [theme.colors.surfaceLight, theme.colors.surface]}
                style={styles.micBtn}
              >
                <Ionicons name={isRecording ? 'stop' : 'mic'} size={18} color={isRecording ? 'white' : theme.colors.textSecondary} />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
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
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerUser: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: { color: 'white', fontWeight: '700', fontSize: 18 },
  headerName: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
  headerStatus: { fontSize: 12, color: theme.colors.success },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerAction: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    marginBottom: 4,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  myBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 4,
  },
  replyPreview: {
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(255,255,255,0.4)',
    paddingLeft: 8,
    marginBottom: 6,
  },
  replyLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  replyText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  messageText: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 20,
  },
  myMessageText: {
    color: 'white',
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  edited: {
    fontSize: 10,
    color: theme.colors.textTertiary,
    fontStyle: 'italic',
  },
  time: {
    fontSize: 10,
    color: theme.colors.textTertiary,
  },
  editButton: {
    padding: 4,
  },
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voiceWave: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  waveBar: {
    width: 2,
    backgroundColor: theme.colors.textTertiary,
    borderRadius: 1,
  },
  waveBarMe: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  voiceDuration: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 12,
  },
  replyBarContent: { flex: 1 },
  replyBarLabel: { fontSize: 11, color: theme.colors.primary, fontWeight: '600' },
  replyBarText: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  emojiContainer: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: 12,
  },
  emojiGrid: {
    padding: 8,
    gap: 4,
  },
  emojiItem: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 26 },
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
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    maxHeight: 100,
    paddingVertical: 10,
  },
  clearBtn: { marginLeft: 4 },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
