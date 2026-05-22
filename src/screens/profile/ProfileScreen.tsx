import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../theme';
import GradientBackground from '../../components/GradientBackground';
import Button from '../../components/Button';
import { useAuth } from '../../store/AuthContext';

export default function ProfileScreen({ navigation }: any) {
  const { profile, user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { logout(); navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); } },
    ]);
  };

  return (
    <GradientBackground>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.avatarBorder}>
            <Image
              source={{ uri: profile?.photos?.[0] ? `https://via.placeholder.com/200x200` : undefined }}
              style={styles.avatar}
            />
          </LinearGradient>
          <Text style={styles.name}>{profile?.fullName || user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          {profile?.isPremium && (
            <LinearGradient colors={['#FFD700', '#FFA500']} style={styles.premiumBadge}>
              <Ionicons name="diamond" size={12} color="white" />
              <Text style={styles.premiumText}>PREMIUM</Text>
            </LinearGradient>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile?.age || '-'}</Text>
            <Text style={styles.statLabel}>Age</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile?.gender || '-'}</Text>
            <Text style={styles.statLabel}>Gender</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{profile?.city || '-'}</Text>
            <Text style={styles.statLabel}>Location</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>{profile?.bio || 'No bio yet'}</Text>
        </View>

        {profile?.photos && profile.photos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <View style={styles.photosRow}>
              {profile.photos.map((photo, i) => (
                <Image key={i} source={{ uri: `https://via.placeholder.com/150x200` }} style={styles.photoThumb} />
              ))}
            </View>
          </View>
        )}

        <View style={styles.menuSection}>
          {[
            { icon: 'settings-outline', label: 'Settings', onPress: () => {} },
            { icon: 'notifications-outline', label: 'Notifications', onPress: () => {} },
            { icon: 'shield-checkmark-outline', label: 'Privacy', onPress: () => {} },
            { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {} },
          ].map((item, i) => (
            <TouchableOpacity key={i} style={styles.menuItem} activeOpacity={0.7}>
              <Ionicons name={item.icon as any} size={22} color={theme.colors.textSecondary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          size="md"
          style={styles.logoutButton}
        />

        <View style={{ height: 80 }} />
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 24,
  },
  avatarBorder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    marginBottom: 16,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: theme.colors.surface,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
  },
  email: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    marginTop: 10,
  },
  premiumText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginHorizontal: 24,
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.lg,
    gap: 0,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.border,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    textTransform: 'capitalize',
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  bio: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  photosRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoThumb: {
    width: 100,
    height: 130,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  menuSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.md,
    gap: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
  },
  logoutButton: {
    marginHorizontal: 24,
    marginTop: 32,
  },
});
