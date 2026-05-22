import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../theme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from './OnboardingContext';

export default function NameScreen() {
  const { data, updateData, currentStep, totalSteps, nextStep } = useOnboarding();
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!data.fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (data.fullName.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    setError('');
    nextStep();
  };

  return (
    <LinearGradient colors={['#0D0D0D', '#1A0A1A', '#0D0D0D']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />

        <View style={styles.iconContainer}>
          <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.iconBg}>
            <Ionicons name="person-outline" size={36} color="white" />
          </LinearGradient>
        </View>

        <Text style={styles.title}>What's your full name?</Text>
        <Text style={styles.subtitle}>This is how you'll appear on your profile</Text>

        <View style={styles.inputWrapper}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={data.fullName}
            onChangeText={(t) => { updateData({ fullName: t }); setError(''); }}
            error={error}
            autoFocus
          />
        </View>

        <View style={styles.spacer} />
        <Button title="Continue" onPress={handleNext} variant="gradient" size="lg" style={styles.button} />
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  iconContainer: { alignItems: 'center', marginBottom: 24 },
  iconBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputWrapper: { marginBottom: 24 },
  spacer: { flex: 1 },
  button: { width: '100%', marginBottom: 40 },
});
