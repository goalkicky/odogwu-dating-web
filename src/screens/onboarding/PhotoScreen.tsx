import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import theme from '../../theme';
import Button from '../../components/Button';
import OnboardingProgress from '../../components/OnboardingProgress';
import { useOnboarding } from './OnboardingContext';
import { useAuth } from '../../store/AuthContext';

const MAX_PHOTOS = 6;

export default function PhotoScreen({ navigation }: any) {
  const { data, updateData, currentStep, totalSteps } = useOnboarding();
  const { setOnboarded } = useAuth();
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    if (data.photos.length >= MAX_PHOTOS) {
      Alert.alert('Limit reached', 'You can upload up to 6 photos');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const newPhotos = [...data.photos, result.assets[0].uri];
      updateData({ photos: newPhotos });
    }
  };

  const takePhoto = async () => {
    if (data.photos.length >= MAX_PHOTOS) {
      Alert.alert('Limit reached', 'You can upload up to 6 photos');
      return;
    }
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Camera access is required to take photos');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const newPhotos = [...data.photos, result.assets[0].uri];
      updateData({ photos: newPhotos });
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = data.photos.filter((_, i) => i !== index);
    updateData({ photos: newPhotos });
  };

  const handleComplete = async () => {
    if (data.photos.length === 0) {
      Alert.alert('Required', 'Please upload at least one photo');
      return;
    }
    setUploading(true);
    try {
      const { userService, storageService } = await import('../../appwrite/services');
      const { account } = await import('../../appwrite/config');
      const user = await account.get();
      const uploadedUrls = await Promise.all(
        data.photos.map((uri) => storageService.uploadPhoto(uri).then((f) => f.$id))
      );
      const age = data.dateOfBirth
        ? new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear()
        : 0;
      await userService.createProfile(user.$id, {
        email: user.email,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender!,
        interestedIn: data.interestedIn!,
        photos: uploadedUrls,
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city,
        bio: data.bio,
        age,
        isPremium: false,
        verified: false,
      } as any);
      setOnboarded();
    } catch (err) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
    setUploading(false);
  };

  return (
    <LinearGradient colors={['#0D0D0D', '#0D0A1A', '#0D0D0D']} style={styles.container}>
      <View style={styles.content}>
        <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />

        <View style={styles.iconContainer}>
          <LinearGradient colors={['#AF52DE', '#FF375F']} style={styles.iconBg}>
            <Ionicons name="camera-outline" size={36} color="white" />
          </LinearGradient>
        </View>

        <Text style={styles.title}>Add your photos</Text>
        <Text style={styles.subtitle}>Upload at least one photo to continue</Text>

        <View style={styles.photoGrid}>
          {Array.from({ length: MAX_PHOTOS }).map((_, i) => {
            const hasPhoto = i < data.photos.length;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.photoSlot, hasPhoto && styles.photoSlotFilled]}
                onPress={hasPhoto ? () => removePhoto(i) : (i === 0 ? takePhoto : pickImage)}
                activeOpacity={0.7}
              >
                {hasPhoto ? (
                  <>
                    <Image source={{ uri: data.photos[i] }} style={styles.photo} />
                    <View style={styles.removeOverlay}>
                      <Ionicons name="close-circle" size={22} color="white" />
                    </View>
                  </>
                ) : (
                  <View style={styles.placeholder}>
                    <Ionicons name={i === 0 ? 'camera' : 'images-outline'} size={24} color={theme.colors.textTertiary} />
                    <Text style={styles.placeholderText}>{i === 0 ? 'Selfie' : `${i + 1}`}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.hint}>Tap to add • Tap again to remove</Text>

        <View style={styles.spacer} />
        <Button
          title={uploading ? 'Saving...' : data.photos.length === 0 ? 'Add a photo first' : 'Complete Profile'}
          onPress={handleComplete}
          variant="gradient"
          size="lg"
          style={styles.button}
          disabled={data.photos.length === 0 || uploading}
          loading={uploading}
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
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  photoSlot: {
    width: 100,
    height: 130,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  photoSlotFilled: {
    borderStyle: 'solid',
    borderColor: theme.colors.primary,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 2,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  placeholderText: {
    color: theme.colors.textTertiary,
    fontSize: 12,
    fontWeight: '600',
  },
  hint: {
    color: theme.colors.textTertiary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
  spacer: { flex: 1 },
  button: { width: '100%', marginBottom: 40 },
});
