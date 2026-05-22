import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import theme from '../../theme';
import Button from '../../components/Button';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from './OnboardingContext';

export default function LocationScreen() {
  const { data, updateData, currentStep, totalSteps, nextStep } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const requestLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const geocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      const city = geocode[0]?.city || geocode[0]?.region || 'Unknown';
      updateData({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        city,
      });
    } catch (err) {
      setPermissionDenied(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return (
    <LinearGradient colors={['#0D0D0D', '#0A0A1A', '#0D0D0D']} style={styles.container}>
      <View style={styles.content}>
        <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />

        <View style={styles.iconContainer}>
          <LinearGradient colors={['#007AFF', '#00D4FF']} style={styles.iconBg}>
            <Ionicons name="location-outline" size={36} color="white" />
          </LinearGradient>
        </View>

        <Text style={styles.title}>Your location</Text>
        <Text style={styles.subtitle}>We'll show people near you</Text>

        <View style={styles.locationBox}>
          {loading ? (
            <View style={styles.loadingState}>
              <Ionicons name="locate-outline" size={40} color={theme.colors.textTertiary} />
              <Text style={styles.loadingText}>Detecting your location...</Text>
            </View>
          ) : data.city ? (
            <>
              <Ionicons name="checkmark-circle" size={40} color={theme.colors.success} />
              <Text style={styles.cityText}>{data.city}</Text>
              <Text style={styles.coordText}>
                {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}
              </Text>
            </>
          ) : (
            <View style={styles.loadingState}>
              <Ionicons name="location-outline" size={40} color={theme.colors.error} />
              <Text style={styles.errorText}>Location access denied</Text>
              <Button title="Try Again" onPress={requestLocation} variant="secondary" size="sm" />
            </View>
          )}
        </View>

        <View style={styles.spacer} />
        <Button
          title="Continue"
          onPress={nextStep}
          variant="gradient"
          size="lg"
          style={styles.button}
          disabled={!data.city}
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
  locationBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  loadingState: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: theme.colors.textTertiary,
    fontSize: 15,
  },
  cityText: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
  },
  coordText: {
    color: theme.colors.textTertiary,
    fontSize: 13,
    marginTop: 4,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 15,
  },
  spacer: { flex: 1 },
  button: { width: '100%', marginBottom: 40 },
});
