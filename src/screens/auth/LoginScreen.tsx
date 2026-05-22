import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
import Button from '../../components/Button';
import { useAuth } from '../../store/AuthContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }: any) {
  const { refreshUser } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleRedirect = (event: { url: string }) => {
      if (event.url?.startsWith('odogwu-dating://oauth')) {
        refreshUser();
      }
    };
    const subscription = Linking.addEventListener('url', handleRedirect);
    return () => subscription.remove();
  }, [refreshUser]);

  const handleGoogleLogin = async () => {
    try {
      setError('');
      const { authService } = await import('../../appwrite/services');
      await authService.loginWithGoogle();
    } catch (error) {
      console.error('Login error:', error);
      setError('Google sign-in failed.');
    }
  };

  return (
    <LinearGradient
      colors={['#0D0D0D', '#1A0A0A', '#0D0D0D']}
      style={styles.container}
    >
      <View style={styles.topSection}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.secondary]}
          style={styles.logoContainer}
        >
          <Ionicons name="flame" size={60} color="white" />
        </LinearGradient>
        <Text style={styles.title}>odogwu</Text>
        <Text style={styles.subtitle}>Find your perfect match</Text>
      </View>

      <View style={styles.featuresList}>
        {[
          { icon: 'sparkles-outline', text: 'Smart Matching Algorithm' },
          { icon: 'shield-checkmark-outline', text: 'Verified Profiles Only' },
          { icon: 'chatbubbles-outline', text: 'Real-time Chat & Calls' },
        ].map((feature, i) => (
          <View key={i} style={styles.featureItem}>
            <Ionicons name={feature.icon as any} size={20} color={theme.colors.primary} />
            <Text style={styles.featureText}>{feature.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.bottomSection}>
        <Button
          title="Continue with Google"
          onPress={handleGoogleLogin}
          variant="gradient"
          size="lg"
          icon={<Ionicons name="logo-google" size={20} color="white" />}
          style={styles.googleButton}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Text style={styles.disclaimer}>
          By signing up, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>

      <View style={styles.decorations}>
        <View style={[styles.dot, styles.dot1]} />
        <View style={[styles.dot, styles.dot2]} />
        <View style={[styles.dot, styles.dot3]} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...theme.shadows.glow,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  featuresList: {
    paddingVertical: 32,
    gap: 16,
    alignItems: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
  },
  bottomSection: {
    paddingBottom: 60,
    alignItems: 'center',
  },
  googleButton: {
    width: '100%',
    marginBottom: 16,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  disclaimer: {
    color: theme.colors.textTertiary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  decorations: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  dot: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.08,
  },
  dot1: {
    top: -50,
    right: -80,
    backgroundColor: theme.colors.primary,
  },
  dot2: {
    bottom: 100,
    left: -100,
    backgroundColor: theme.colors.secondary,
  },
  dot3: {
    top: height * 0.4,
    right: -60,
    width: 150,
    height: 150,
    backgroundColor: theme.colors.accent,
  },
});
