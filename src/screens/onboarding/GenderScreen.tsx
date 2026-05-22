import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../theme';
import Button from '../../components/Button';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from './OnboardingContext';
import { UserProfile } from '../../types';

const genders: { value: UserProfile['gender']; icon: string; label: string }[] = [
  { value: 'male', icon: 'man-outline', label: 'Male' },
  { value: 'female', icon: 'woman-outline', label: 'Female' },
  { value: 'non-binary', icon: 'people-outline', label: 'Non-binary' },
  { value: 'other', icon: 'ellipsis-horizontal-circle-outline', label: 'Other' },
];

export default function GenderScreen() {
  const { data, updateData, currentStep, totalSteps, nextStep } = useOnboarding();

  const handleNext = () => {
    if (!data.gender) return;
    nextStep();
  };

  return (
    <LinearGradient colors={['#0D0D0D', '#1A0A0A', '#0D0D0D']} style={styles.container}>
      <View style={styles.content}>
        <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />

        <View style={styles.iconContainer}>
          <LinearGradient colors={['#FF375F', '#FF6B8A']} style={styles.iconBg}>
            <Ionicons name="transgender-outline" size={36} color="white" />
          </LinearGradient>
        </View>

        <Text style={styles.title}>What's your gender?</Text>
        <Text style={styles.subtitle}>Select the option that best describes you</Text>

        <View style={styles.optionsContainer}>
          {genders.map((g) => {
            const selected = data.gender === g.value;
            return (
              <TouchableOpacity
                key={g.value}
                style={[styles.option, selected && styles.optionSelected]}
                onPress={() => updateData({ gender: g.value })}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={selected ? [theme.colors.primary, theme.colors.secondary] : [theme.colors.surface, theme.colors.surfaceLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.optionGradient}
                >
                  <Ionicons name={g.icon as any} size={28} color={selected ? 'white' : theme.colors.textSecondary} />
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{g.label}</Text>
                  {selected && <Ionicons name="checkmark-circle" size={22} color="white" />}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.spacer} />
        <Button
          title="Continue"
          onPress={handleNext}
          variant="gradient"
          size="lg"
          style={styles.button}
          disabled={!data.gender}
        />
      </View>
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
  optionsContainer: { gap: 12 },
  option: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  optionSelected: {
    borderWidth: 0,
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
    borderRadius: theme.borderRadius.lg,
  },
  optionText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  optionTextSelected: {
    color: theme.colors.text,
  },
  spacer: { flex: 1 },
  button: { width: '100%', marginBottom: 40 },
});
