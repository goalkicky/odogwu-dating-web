import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../theme';
import AnimatedCard from '../../components/AnimatedCard';
import ActionButton from '../../components/ActionButton';
import GradientBackground from '../../components/GradientBackground';

const { width } = Dimensions.get('window');

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
  const [users, setUsers] = useState(MOCK_USERS);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleSwipeLeft = useCallback(() => {
    setLastAction('dislike');
    setTimeout(() => {
      setUsers(prev => prev.slice(1));
      setLastAction(null);
      if (users.length <= 1) {
        setUsers(MOCK_USERS);
      }
    }, 300);
  }, [users.length]);

  const handleSwipeRight = useCallback(() => {
    setLastAction('like');
    setTimeout(() => {
      setUsers(prev => prev.slice(1));
      setLastAction(null);
      if (users.length <= 1) {
        setUsers(MOCK_USERS);
      }
    }, 300);
  }, [users.length]);

  const handleSuperLike = useCallback(() => {
    setLastAction('superlike');
    setTimeout(() => {
      setUsers(prev => prev.slice(1));
      setLastAction(null);
      if (users.length <= 1) {
        setUsers(MOCK_USERS);
      }
    }, 300);
  }, [users.length]);

  const handleReload = useCallback(() => {
    setUsers(MOCK_USERS.sort(() => Math.random() - 0.5));
  }, []);

  const handleInfo = useCallback((user: any) => {
    Alert.alert(user.fullName, `${user.bio}\n\n📍 ${user.city}`);
  }, []);

  if (users.length === 0) {
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
      <View style={styles.header}>
        <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.logoSmall}>
          <Ionicons name="flame" size={22} color="white" />
        </LinearGradient>
        <Text style={styles.headerTitle}>Discover</Text>
        <View style={styles.headerRight}>
          <Ionicons name="options-outline" size={24} color={theme.colors.textSecondary} />
        </View>
      </View>

      <View style={styles.cardContainer}>
        {users.slice(0, 3).reverse().map((user, index) => (
          <AnimatedCard
            key={user.id}
            user={user}
            isFirst={index === users.slice(0, 3).length - 1}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onSuperLike={handleSuperLike}
            onInfoPress={() => handleInfo(user)}
          />
        ))}
      </View>

      <View style={styles.actionsContainer}>
        <ActionButton variant="secondary" size={50} onPress={handleReload}>
          <Ionicons name="refresh" size={24} color={theme.colors.accent} />
        </ActionButton>

        <ActionButton variant="danger" size={60} onPress={handleSwipeLeft}>
          <Ionicons name="close" size={30} color="white" />
        </ActionButton>

        <ActionButton variant="superlike" size={50} onPress={handleSuperLike}>
          <Ionicons name="star" size={24} color="white" />
        </ActionButton>

        <ActionButton variant="primary" size={60} onPress={handleSwipeRight}>
          <Ionicons name="heart" size={30} color="white" />
        </ActionButton>

        <ActionButton variant="boost" size={50} onPress={() => Alert.alert('Boost', 'Get seen by more people!')}>
          <Ionicons name="flash" size={24} color="white" />
        </ActionButton>
      </View>

      {lastAction && (
        <View style={styles.actionLabel}>
          <Text style={styles.actionLabelText}>
            {lastAction === 'like' ? 'Liked!' : lastAction === 'dislike' ? 'Nope' : 'Super Like!'}
          </Text>
        </View>
      )}
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
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
    paddingVertical: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingBottom: 40,
    paddingHorizontal: 20,
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
  actionLabel: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: theme.colors.glass,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
  },
  actionLabelText: {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
});
