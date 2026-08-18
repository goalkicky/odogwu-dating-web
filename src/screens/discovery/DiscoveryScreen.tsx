import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, Modal, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import theme from '../../theme';
import AnimatedCard, { AnimatedCardHandle } from '../../components/AnimatedCard';
import ActionButton from '../../components/ActionButton';
import GradientBackground from '../../components/GradientBackground';
import { superlikeService, likeService, matchService } from '../../api/services';
import { useAuth } from '../../store/AuthContext';

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

const PLAN_BADGES = [
  { name: 'Premium', count: '2/day', color: '#FF375F' },
  { name: 'Surplus', count: '5/day', color: '#FFD700', popular: true },
  { name: 'Platinum', count: '7/day', color: '#AF52DE' },
];

const LIKE_PLAN_BADGES = [
  { name: 'Premium', count: '∞', color: '#FF375F' },
  { name: 'Surplus', count: '∞', color: '#FFD700', popular: true },
  { name: 'Platinum', count: '∞', color: '#AF52DE' },
];

const MESSAGE_PLAN_BADGES = [
  { name: 'Premium', count: 'Message', color: '#FF375F' },
  { name: 'Surplus', count: 'Message', color: '#FFD700', popular: true },
  { name: 'Platinum', count: 'Message', color: '#AF52DE' },
];

export default function DiscoveryScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { user } = useAuth();
  const [users, setUsers] = useState(MOCK_USERS);
  const cardRef = useRef<AnimatedCardHandle>(null);
  const [superlikes, setSuperlikes] = useState({ remaining: 0, used: 0, dailyLimit: 0, refillsAt: '', isPremium: false });
  const [showUpsell, setShowUpsell] = useState(false);
  const [likes, setLikes] = useState({ remaining: 0, used: 0, dailyLimit: 0, refillsAt: '', isPremium: false });
  const [showLikeUpsell, setShowLikeUpsell] = useState(false);
  const [showMessageUpsell, setShowMessageUpsell] = useState(false);
  const [proof, setProof] = useState<string | null>(null);

  useEffect(() => {
    superlikeService.getStatus().then(setSuperlikes).catch(() => {});
    likeService.getStatus().then(setLikes).catch(() => {});
  }, []);

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
  const handleSwipeRight = useCallback(async () => {
    const liked = users[0];
    const isMock = !liked || (liked.id?.length ?? 0) < 20;
    if (!likes.isPremium && (likes.remaining ?? 0) <= 0) {
      setShowLikeUpsell(true);
      removeCurrent();
      return;
    }
    if (!isMock) {
      try {
        const res = await likeService.send(liked.id);
        if (res && typeof res.remaining === 'number') setLikes(res);
      } catch {
        setShowLikeUpsell(true);
      }
    } else {
      setLikes(prev => ({ ...prev, remaining: Math.max(0, prev.remaining - 1), used: prev.used + 1 }));
    }
    removeCurrent();
  }, [users, likes, removeCurrent]);

  const handleSuperLike = useCallback(async () => {
    const liked = users[0];
    const isMock = !liked || (liked.id?.length ?? 0) < 20;
    if (!isMock) {
      try {
        const res = await superlikeService.send(liked.id);
        setSuperlikes(res);
      } catch {
        setShowUpsell(true);
      }
    } else {
      setSuperlikes(prev => ({ ...prev, remaining: Math.max(0, prev.remaining - 1), used: prev.used + 1 }));
    }
    setProof(`Super Liked ${liked?.fullName?.split(' ')[0] || 'them'}! 💙`);
    setTimeout(() => setProof(null), 1600);
    removeCurrent();
  }, [users, removeCurrent]);

  const handleSuperLikePress = useCallback(() => {
    if (superlikes.remaining <= 0) {
      setShowUpsell(true);
      return;
    }
    cardRef.current?.superLike();
  }, [superlikes.remaining]);

  const handleLikePress = useCallback(() => {
    if (!likes.isPremium && (likes.remaining ?? 0) <= 0) {
      setShowLikeUpsell(true);
      return;
    }
    cardRef.current?.swipeRight();
  }, [likes.isPremium, likes.remaining]);

  const handleReload = useCallback(() => {
    setUsers([...MOCK_USERS].sort(() => Math.random() - 0.5));
  }, []);

  const openChatWith = useCallback((target: any, id: string) => {
    navigation?.navigate('Chat', {
      match: {
        id,
        name: target.fullName,
        age: target.age,
        photo: target.photos?.[0],
        online: false,
        lastMessage: '',
        timestamp: '',
      },
    });
  }, [navigation]);

  const handleMessage = useCallback(async () => {
    const target = users[0];
    const isMock = !target || (target.id?.length ?? 0) < 20;
    if (!likes.isPremium) {
      setShowMessageUpsell(true);
      return;
    }
    if (isMock) {
      openChatWith(target, target.id);
      return;
    }
    try {
      const match = await matchService.createMatch((user as any)?.$id, target.id);
      if (match?.id) openChatWith(target, match.id);
      else setShowMessageUpsell(true);
    } catch {
      setShowMessageUpsell(true);
    }
  }, [users, likes.isPremium, user, openChatWith]);

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
          <ActionButton variant="boost" size={50} onPress={handleMessage}>
            <Ionicons name="chatbubble-ellipses" size={24} color="white" />
          </ActionButton>

          <ActionButton variant="secondary" size={50} onPress={handleReload}>
            <Ionicons name="refresh" size={24} color={theme.colors.accent} />
          </ActionButton>

          <ActionButton variant="danger" size={60} onPress={() => cardRef.current?.swipeLeft()}>
            <Ionicons name="close" size={30} color="white" />
          </ActionButton>

          <View>
            <ActionButton variant="superlike" size={50} onPress={handleSuperLikePress}>
              <Ionicons name="star" size={24} color="white" />
            </ActionButton>
            <View style={[styles.countBadge, { backgroundColor: superlikes.remaining > 0 ? '#0288D1' : '#FF3B30' }]}>
              <Text style={styles.countText}>{superlikes.remaining}</Text>
            </View>
          </View>

          <View>
            <ActionButton variant="primary" size={60} onPress={handleLikePress}>
              <Ionicons name="heart" size={30} color="white" />
            </ActionButton>
            {!likes.isPremium && likes.dailyLimit > 0 && (
              <View style={[styles.countBadge, { backgroundColor: (likes.remaining ?? 0) > 0 ? '#FF375F' : '#FF3B30' }]}>
                <Text style={styles.countText}>{Math.max(0, likes.remaining ?? 0)}</Text>
              </View>
            )}
          </View>
        </View>

        {proof && (
          <View style={styles.proofBanner} pointerEvents="none">
            <LinearGradient colors={['#007AFF', '#00D4FF']} style={styles.proofInner}>
              <Text style={styles.proofText}>{proof}</Text>
            </LinearGradient>
          </View>
        )}

        <Modal visible={showUpsell} transparent animationType="fade" onRequestClose={() => setShowUpsell(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <TouchableOpacity style={styles.modalClose} onPress={() => setShowUpsell(false)} hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}>
                <Ionicons name="close" size={18} color="white" />
              </TouchableOpacity>

              <LinearGradient colors={['#4FC3F7', '#0288D1']} style={styles.modalIcon}>
                <Ionicons name="star" size={38} color="white" />
              </LinearGradient>
              <Text style={styles.modalTitle}>You&apos;re out of Super Likes</Text>
              <Text style={styles.modalBody}>
                Super Likes make you stand out instantly — they show someone you&apos;re seriously interested. Don&apos;t miss your chance to be noticed. 💙
              </Text>

              <View style={styles.modalPlans}>
                {PLAN_BADGES.map((p) => (
                  <View key={p.name} style={[styles.planChip, p.popular && styles.planChipPopular]}>
                    {p.popular && <Text style={styles.planChipPopularTag}>POPULAR</Text>}
                    <View style={styles.planChipRow}>
                      <Ionicons name="star" size={11} color={p.color} />
                      <Text style={styles.planChipName}>{p.name}</Text>
                    </View>
                    <Text style={styles.planChipCount}>{p.count}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => { setShowUpsell(false); navigation?.navigate('PremiumTab'); }}
                style={styles.modalCta}
              >
                <Ionicons name="diamond" size={18} color="white" />
                <Text style={styles.modalCtaText}>Get Super Likes — from N4,900/mo</Text>
              </TouchableOpacity>
              <Text style={styles.modalFine}>Includes unlimited likes, boosts &amp; more · Cancel anytime</Text>
            </View>
          </View>
        </Modal>

        <Modal visible={showLikeUpsell} transparent animationType="fade" onRequestClose={() => setShowLikeUpsell(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <TouchableOpacity style={styles.modalClose} onPress={() => setShowLikeUpsell(false)} hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}>
                <Ionicons name="close" size={18} color="white" />
              </TouchableOpacity>

              <LinearGradient colors={['#FF375F', '#FF3B30']} style={styles.modalIcon}>
                <Ionicons name="heart" size={38} color="white" />
              </LinearGradient>
              <Text style={styles.modalTitle}>You&apos;re out of Likes</Text>
              <Text style={styles.modalBody}>
                You&apos;ve used all 10 of today&apos;s free likes. Premium members get unlimited likes — never miss out on a potential match again. ❤️
              </Text>

              <View style={styles.modalPlans}>
                {LIKE_PLAN_BADGES.map((p) => (
                  <View key={p.name} style={[styles.planChip, p.popular && styles.planChipPopular]}>
                    {p.popular && <Text style={styles.planChipPopularTag}>POPULAR</Text>}
                    <View style={styles.planChipRow}>
                      <Ionicons name="heart" size={11} color={p.color} />
                      <Text style={styles.planChipName}>{p.name}</Text>
                    </View>
                    <Text style={styles.planChipCount}>{p.count} Likes</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => { setShowLikeUpsell(false); navigation?.navigate('PremiumTab'); }}
                style={[styles.modalCta, { backgroundColor: '#FF375F' }]}
              >
                <Ionicons name="diamond" size={18} color="white" />
                <Text style={styles.modalCtaText}>Get Unlimited Likes — from N4,900/mo</Text>
              </TouchableOpacity>
              <Text style={styles.modalFine}>Includes unlimited likes, boosts &amp; more · Cancel anytime</Text>
            </View>
          </View>
        </Modal>

        <Modal visible={showMessageUpsell} transparent animationType="fade" onRequestClose={() => setShowMessageUpsell(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { borderColor: 'rgba(52,199,89,0.35)' }]}>
              <TouchableOpacity style={styles.modalClose} onPress={() => setShowMessageUpsell(false)} hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}>
                <Ionicons name="close" size={18} color="white" />
              </TouchableOpacity>

              <LinearGradient colors={['#34C759', '#00A6FF']} style={styles.modalIcon}>
                <Ionicons name="chatbubble-ellipses" size={38} color="white" />
              </LinearGradient>
              <Text style={styles.modalTitle}>Say Hi Before the Match</Text>
              <Text style={styles.modalBody}>
                Don&apos;t wait for a match to break the ice. Premium members can message anyone first — make the first move and stand out instantly. 💬
              </Text>

              <View style={styles.modalPlans}>
                {MESSAGE_PLAN_BADGES.map((p) => (
                  <View key={p.name} style={[styles.planChip, p.popular && styles.planChipPopular]}>
                    {p.popular && <Text style={styles.planChipPopularTag}>POPULAR</Text>}
                    <View style={styles.planChipRow}>
                      <Ionicons name="chatbubble-ellipses" size={11} color={p.color} />
                      <Text style={styles.planChipName}>{p.name}</Text>
                    </View>
                    <Text style={styles.planChipCount}>{p.count}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => { setShowMessageUpsell(false); navigation?.navigate('PremiumTab'); }}
                style={[styles.modalCta, { backgroundColor: '#34C759' }]}
              >
                <Ionicons name="diamond" size={18} color="white" />
                <Text style={styles.modalCtaText}>Get Premium — from N4,900/mo</Text>
              </TouchableOpacity>
              <Text style={styles.modalFine}>Includes unlimited likes, boosts &amp; more · Cancel anytime</Text>
            </View>
          </View>
        </Modal>
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
    gap: 12,
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
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0D0D0D',
  },
  countText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800',
  },
  proofBanner: {
    position: 'absolute',
    bottom: 92,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  proofInner: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 9999,
    shadowColor: '#007AFF',
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  proofText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#101C2E',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(79,195,247,0.35)',
    paddingVertical: 34,
    paddingHorizontal: 22,
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalClose: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  modalIcon: {
    width: 84,
    height: 84,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.text,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 14.5,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 10,
  },
  modalPlans: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
    alignSelf: 'stretch',
  },
  planChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    gap: 3,
  },
  planChipPopular: {
    borderColor: 'rgba(255,215,0,0.5)',
    backgroundColor: 'rgba(255,215,0,0.06)',
  },
  planChipPopularTag: {
    position: 'absolute',
    top: -9,
    alignSelf: 'center',
    backgroundColor: '#FFD700',
    color: '#1A1A1A',
    fontSize: 8,
    fontWeight: '900',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  planChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  planChipName: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.text,
  },
  planChipCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFD700',
  },
  modalCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    alignSelf: 'stretch',
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#FF375F',
    shadowColor: '#FF375F',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  modalCtaText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  modalFine: {
    marginTop: 14,
    fontSize: 11.5,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
});
