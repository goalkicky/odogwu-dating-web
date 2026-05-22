import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import theme from '../../theme';
import Button from '../../components/Button';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from './OnboardingContext';

export default function DOBScreen() {
  const { data, updateData, currentStep, totalSteps, nextStep } = useOnboarding();
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState('');

  const date = data.dateOfBirth ? new Date(data.dateOfBirth) : new Date(2000, 0, 1);

  const formatDate = (d: Date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const calculateAge = (d: Date) => {
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age;
  };

  const handleChange = (_: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      updateData({ dateOfBirth: selectedDate.toISOString() });
      setError('');
    }
  };

  const handleNext = () => {
    if (!data.dateOfBirth) {
      setError('Please select your date of birth');
      return;
    }
    const age = calculateAge(new Date(data.dateOfBirth));
    if (age < 18) {
      setError('You must be at least 18 years old');
      return;
    }
    setError('');
    nextStep();
  };

  const age = data.dateOfBirth ? calculateAge(new Date(data.dateOfBirth)) : null;

  return (
    <LinearGradient colors={['#0D0D0D', '#0A0A1A', '#0D0D0D']} style={styles.container}>
      <View style={styles.content}>
        <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />

        <View style={styles.iconContainer}>
          <LinearGradient colors={['#6C63FF', '#5A52E0']} style={styles.iconBg}>
            <Ionicons name="calendar-outline" size={36} color="white" />
          </LinearGradient>
        </View>

        <Text style={styles.title}>Your date of birth?</Text>
        <Text style={styles.subtitle}>This won't be shown publicly</Text>

        <View style={styles.dateBox}>
          <Text style={styles.dateLabel}>Date of Birth</Text>
          <Text style={styles.dateText}>{data.dateOfBirth ? formatDate(new Date(data.dateOfBirth)) : 'Select your birthday'}</Text>
          {age && <Text style={styles.ageText}>{age} years old</Text>}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <Button
          title="Select Date"
          onPress={() => setShowPicker(true)}
          variant="secondary"
          style={styles.dateButton}
        />

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            minimumDate={new Date(1940, 0, 1)}
            onChange={handleChange}
            themeVariant="dark"
          />
        )}

        <View style={styles.spacer} />
        <Button title="Continue" onPress={handleNext} variant="gradient" size="lg" style={styles.button} />
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
  dateBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dateLabel: {
    color: theme.colors.textTertiary,
    fontSize: 13,
    marginBottom: 8,
  },
  dateText: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '600',
  },
  ageText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },
  error: {
    color: theme.colors.error,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
  dateButton: { marginTop: 16 },
  spacer: { flex: 1 },
  button: { width: '100%', marginBottom: 40 },
});
