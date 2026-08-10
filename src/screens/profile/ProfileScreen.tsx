import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, Dimensions,
  NativeScrollEvent, NativeSyntheticEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../theme';
import Button from '../../components/Button';
import { useAuth } from '../../store/AuthContext';
import { storageService } from '../../api/services';

const { width } = Dimensions.get('window');
const CAROUSEL_H = Math.min(width * (4 / 3), 640);

export default function ProfileScreen({ navigation }: any) {
  const { profile, user, logout } = useAuth();
  const [photoIndex, setPhotoIndex] = useState(0);

  const photos: string[] = profile?.photos || [];
  const photoUrls = photos.map((id) => storageService.getFilePreview(id));

  const name = profile?.fullName || user?.name || 'User';
  const age = profile?.age;
  const displayName = age ? `${name}, ${age}` : name;

  const onPagerEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const w = e.nativeEvent.layoutMeasurement.width || 1;
    setPhotoIndex(Math.round(x / w));
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { logout(); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); } },
    ]);
  };

  const detailsRows = [
    { label: 'Gender', value: profile?.gender || '-', capitalize: true },
    { label: 'Interested In', value: profile?.interestedIn || '-', capitalize: true },
    { label: 'Age', value: profile?.age ? String(profile.age) : '-' },
    { label: 'Location', value: profile?.city || '-' },
  ];

  const menuItems = [
    { icon: 'pencil-outline' as const, label: 'Edit Profile', onPress: () => {} },
    { icon: 'eye-outline' as const, label: 'Who Likes You', onPress: () => {} },
    { icon: 'call-outline' as const, label: 'Call Log', onPress: () => {} },
    { icon: 'settings-outline' as const, label: 'Settings', onPress: () => {} },
    { icon: 'notifications-outline' as const, label: 'Notifications', onPress: () => {} },
    { icon: 'shield-checkmark-outline' as const, label: 'Privacy', onPress: () => {} },
    { icon: 'help-circle-outline' as const, label: 'Help & Support', onPress: () => {} },
  ];

  return (
    <LinearGradient colors={['#0D0D0D', '#0D0A1A', '#0D0D0D']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* Photo pager — Tinder-style hero */}
        <View style={styles.carousel}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onPagerEnd}
          >
            {photoUrls.length > 0 ? (
              photoUrls.map((src, i) => (
                <View key={i} style={[styles.slide, { width, height: CAROUSEL_H }]}>
                  <Image source={{ uri: src }} style={styles.slideImage} resizeMode="cover" />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.85)']}
                    style={styles.slideGradient}
                  />
                  {i === photoIndex && (
                    <View style={styles.nameOverlay}>
                      <View style={styles.nameRow}>
                        <Text style={styles.name}>{displayName}</Text>
                        {profile?.verified && (
                          <LinearGradient colors={['#4FC3F7', '#0288D1']} style={styles.verifiedBadge}>
                            <Ionicons name="checkmark" size={13} color="white" />
                          </LinearGradient>
                        )}
                      </View>
                      {profile?.city && (
                        <View style={styles.cityRow}>
                          <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.85)" />
                          <Text style={styles.city}>{profile.city}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))
            ) : (
              <TouchableOpacity style={[styles.slide, styles.emptySlide, { width, height: CAROUSEL_H }]} activeOpacity={0.8}>
                <LinearGradient colors={['rgba(255,55,95,0.16)', 'rgba(108,99,255,0.1)']} style={[StyleSheet.absoluteFill, styles.emptyGradient]} />
                <View style={styles.emptyPlus}>
                  <Ionicons name="add" size={32} color="white" />
                </View>
                <Text style={styles.emptyName}>{name}</Text>
                <Text style={styles.emptyHint}>Add your photos</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Dots */}
          {photoUrls.length > 1 && (
            <View style={styles.dots}>
              {photoUrls.map((_, i) => (
                <View key={i} style={[styles.dot, i === photoIndex && styles.dotActive]} />
              ))}
            </View>
          )}

          {/* Top controls */}
          <TouchableOpacity style={styles.topBtn} activeOpacity={0.8}>
            <Ionicons name="settings" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.topBtn, styles.topBtnRight]} activeOpacity={0.8}>
            <Ionicons name="camera-outline" size={19} color="white" />
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>About</Text>
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.7}>
              <Ionicons name="pencil" size={14} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.bio, !profile?.bio && styles.bioEmpty]}>
            {profile?.bio || 'Add a bio so people can learn more about you.'}
          </Text>
        </View>

        {/* Details */}
        <View style={[styles.card, styles.detailsCard]}>
          {detailsRows.map((row, i) => (
            <TouchableOpacity key={row.label} style={[styles.detailRow, i < detailsRows.length - 1 && styles.detailRowBorder]} activeOpacity={0.6}>
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={[styles.detailValue, row.capitalize && { textTransform: 'capitalize' }]} numberOfLines={1}>{row.value}</Text>
              <Ionicons name="chevron-forward" size={16} color="#4A4A4A" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Premium CTA */}
        {!profile?.isPremium && (
          <TouchableOpacity style={styles.premiumCta} activeOpacity={0.8}>
            <LinearGradient colors={['#FFD700', '#FF9500']} style={styles.premiumIcon}>
              <Ionicons name="diamond" size={20} color="white" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.premiumTitle}>Go Premium</Text>
              <Text style={styles.premiumSub}>Unlimited likes, rewind & more</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#FFD700" />
          </TouchableOpacity>
        )}

        {/* Menu */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <TouchableOpacity key={item.label} style={styles.menuItem} activeOpacity={0.7} onPress={item.onPress}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={20} color={theme.colors.textSecondary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#4A4A4A" />
            </TouchableOpacity>
          ))}
        </View>

        <Button title="Logout" onPress={handleLogout} variant="outline" size="md" style={styles.logoutButton} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  carousel: {
    borderRadius: 24,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 12,
  },
  slide: { position: 'relative', borderRadius: 24, overflow: 'hidden' },
  slideImage: { width: '100%', height: '100%' },
  slideGradient: { ...StyleSheet.absoluteFillObject },
  nameOverlay: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 26,
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  name: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4FC3F7',
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  city: { fontSize: 15, fontWeight: '500', color: 'rgba(255,255,255,0.92)' },
  dots: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 3,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#fff',
  },
  topBtn: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  topBtnRight: { left: undefined, right: 12 },
  emptySlide: { alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyGradient: {},
  emptyPlus: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  emptyHint: { fontSize: 13, fontWeight: '500', color: '#ABABAB' },
  card: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  editBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bio: { fontSize: 15, color: '#D6D6D6', lineHeight: 23, marginTop: 12 },
  bioEmpty: { color: '#6B6B6B' },
  detailsCard: { padding: 0, overflow: 'hidden' },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 15,
    gap: 12,
  },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  detailLabel: {
    width: 108,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#6B6B6B',
  },
  detailValue: { flex: 1, fontSize: 15, fontWeight: '600', color: theme.colors.text },
  premiumCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    backgroundColor: 'rgba(255,215,0,0.1)',
  },
  premiumIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumTitle: { fontSize: 15, fontWeight: '800', color: theme.colors.text },
  premiumSub: { fontSize: 12.5, color: '#ABABAB', marginTop: 2 },
  menuSection: { marginHorizontal: 16, marginTop: 14, gap: 8 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    gap: 12,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 14.5, fontWeight: '600', color: theme.colors.text },
  logoutButton: { marginHorizontal: 16, marginTop: 28 },
});
