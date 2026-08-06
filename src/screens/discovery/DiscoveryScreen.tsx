import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../../theme';
import AnimatedCard, { AnimatedCardHandle } from '../../components/AnimatedCard';
import ActionButton from '../../components/ActionButton';
import GradientBackground from '../../components/GradientBackground';

const TAB_BAR_HEIGHT = 85;
const HEADER_HEIGHT = 52;

const MOCK_USERS = [
  {
    id: '1',
    photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'],
    fullName: 'Sarah Johnson',
    age: 26,
    bio: 'Adventure seeker & coffee addict ☕️',
    city: 'Lagos, Nigeria',
  },
  {
    id: '2',
    photos: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'],
    fullName: 'Michael Chen',
    age: 28,
    bio: 'Software engineer by day, chef by night',
    city: 'Abuja, Nigeria',
  },
  {
    id: '3',
    photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'],
    fullName: 'Emily Davis',
    age: 24,
    bio: 'Music lover & yoga enthusiast 🧘‍♀️',
    city: 'Port Harcourt, Nigeria',
  },
  {
    id: '4',
    photos: ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400'],
    fullName: 'James Wilson',
    age: 30,
    bio: 'Traveling the world 🌍',
    city: 'Nairobi, Kenya',
  },
];

export default function DiscoveryScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [users, setUsers] = useState(MOCK_USERS);
  const cardRef = useRef<AnimatedCardHandle>(null);

  const cardWidth = width * 0.9;
  const cardHeight = height - insets.top - HEADER_HEIGHT - TAB_BAR_HEIGHT - 12;

  const currentUser = users[0];

  const removeCurrent = useCallback(() => {
    setUsers(prev => {
      const next = prev.slice(1);
      return next.length === 0 ? [...MOCK_USERS].sort(() => Math.random() - 0.5) : next;
    });
  }, []);

  const handleSwipeLeft = useCallback(() => removeCurrent(), [removeCurrent]);
  const handleSwipeRight = useCallback(() => removeCurrent(), [removeCurrent]);
  const handleSuperLike = useCallback(() => removeCurrent(), [removeCurrent]);

  const handleReload = useCallback(() => {
    setUsers([...MOCK_USERS].sort(() => Math.random() - 0.5));
  }, []);

  if (!currentUser) {
    return (
      <GradientBackground>
        <View style={styles.emptyContainer}>
          <Ionicons name="infinite-outline" size={80} color={theme.colors.textTertiary} />
          <Text style={styles.emptyTitle}>No more profiles</Text>
          <Text style={styles.emptySubtitle}>Check back later for new people</Text>
        </View>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.logoSmall}>
          <Ionicons name="flame" size={22} color="white" />
        </LinearGradient>
        <Text style={styles.headerTitle}>Discover</Text>
        <View style={styles.headerRight}>
          <Ionicons name="options-outline" size={24} color={theme.colors.textSecondary} />
        </View>
      </View>

      <View style={styles.cardContainer}>
        <AnimatedCard
          key={currentUser.id}
          ref={cardRef}
          user={currentUser}
          isFirst
          width={cardWidth}
          height={cardHeight}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onSuperLike={handleSuperLike}
        />

        <View style={styles.overlayActions}>
          <ActionButton variant="secondary" size={50} onPress={handleReload}>
            <Ionicons name="refresh" size={24} color={theme.colors.accent} />
          </ActionButton>

          <ActionButton variant="danger" size={60} onPress={() => cardRef.current?.swipeLeft()}>
            <Ionicons name="close" size={30} color="white" />
          </ActionButton>

          <ActionButton variant="superlike" size={50} onPress={() => cardRef.current?.superLike()}>
            <Ionicons name="star" size={24} color="white" />
          </ActionButton>

          <ActionButton variant="primary" size={60} onPress={() => cardRef.current?.swipeRight()}>
            <Ionicons name="heart" size={30} color="white" />
          </ActionButton>
        </View>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  logoSmall: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  headerRight: {
    width: 36,
    alignItems: 'center',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayActions: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});
