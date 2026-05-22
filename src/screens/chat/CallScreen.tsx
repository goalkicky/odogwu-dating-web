import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import theme from '../../theme';

const { width, height } = Dimensions.get('window');

export default function CallScreen({ route, navigation }: any) {
  const { match, callType: initialCallType } = route.params;
  const [callType, setCallType] = useState<'audio' | 'video'>(initialCallType || 'audio');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(true);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true });
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isCallActive) {
      interval = setInterval(() => setCallDuration((prev: number) => prev + 1), 1000);
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
    navigation.goBack();
  };

  const toggleCallType = () => {
    setCallType(prev => prev === 'audio' ? 'video' : 'audio');
  };

  return (
    <LinearGradient colors={['#0D0D0D', '#1A0A0A', '#0D0D0D']} style={styles.container}>
      {callType === 'video' && (
        <View style={styles.videoContainer}>
          <View style={styles.remoteVideo}>
            <LinearGradient colors={[theme.colors.surface, theme.colors.surfaceLight]} style={styles.videoPlaceholder}>
              <Text style={styles.videoPlaceholderText}>{match.name[0]}</Text>
            </LinearGradient>
          </View>
          <View style={styles.localVideo}>
            <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.localVideoInner}>
              <Ionicons name="person" size={24} color="white" />
            </LinearGradient>
          </View>
        </View>
      )}

      <View style={styles.mainContent}>
        <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.avatar}>
          <Text style={styles.avatarText}>{match.name[0]}</Text>
        </LinearGradient>

        <Text style={styles.name}>{match.name}</Text>
        <Text style={styles.callStatus}>
          {isCallActive ? formatDuration(callDuration) : 'Call ended'}
        </Text>

        {callType === 'audio' && (
          <View style={styles.waveformContainer}>
            {Array.from({ length: 30 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.waveformBar,
                  { height: Math.random() * 30 + 5 },
                  i % 2 === 0 && { backgroundColor: theme.colors.primary },
                ]}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <View style={styles.controlsRow}>
          {callType === 'video' && (
            <TouchableOpacity
              style={[styles.controlBtn, !isCameraOn && styles.controlBtnActive]}
              onPress={() => setIsCameraOn(!isCameraOn)}
            >
              <Ionicons name={isCameraOn ? 'videocam' : 'videocam-off'} size={24} color="white" />
              <Text style={styles.controlLabel}>{isCameraOn ? 'Camera' : 'Off'}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color="white" />
            <Text style={styles.controlLabel}>{isMuted ? 'Muted' : 'Mute'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, isSpeakerOn && styles.controlBtnActive]}
            onPress={() => setIsSpeakerOn(!isSpeakerOn)}
          >
            <Ionicons name={isSpeakerOn ? 'volume-high' : 'volume-medium'} size={24} color="white" />
            <Text style={styles.controlLabel}>{isSpeakerOn ? 'Speaker' : 'Phone'}</Text>
          </TouchableOpacity>

          {callType === 'audio' && (
            <TouchableOpacity style={styles.controlBtn} onPress={toggleCallType}>
              <Ionicons name="videocam" size={24} color="white" />
              <Text style={styles.controlLabel}>Video</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCall}>
          <LinearGradient colors={['#FF3B30', '#FF6B6B']} style={styles.endCallInner}>
            <Ionicons name="call" size={32} color="white" style={{ transform: [{ rotate: '135deg' }] }} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  remoteVideo: {
    flex: 1,
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholderText: {
    fontSize: 80,
    fontWeight: '800',
    color: theme.colors.text,
    opacity: 0.3,
  },
  localVideo: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 100,
    height: 160,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  localVideoInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '800',
    color: 'white',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
  },
  callStatus: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 8,
    fontVariant: ['tabular-nums'],
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 40,
    marginTop: 40,
  },
  waveformBar: {
    width: 3,
    backgroundColor: theme.colors.textTertiary,
    borderRadius: 2,
  },
  controls: {
    paddingBottom: 60,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 32,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
  },
  controlBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  controlBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  controlLabel: {
    position: 'absolute',
    bottom: -18,
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  endCallBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
  },
  endCallInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
