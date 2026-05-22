import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  PanResponder,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.72;

interface UserCard {
  id: string;
  photos: string[];
  fullName: string;
  age: number;
  bio: string;
  city?: string;
}

interface AnimatedCardProps {
  user: UserCard;
  isFirst: boolean;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSuperLike: () => void;
  onInfoPress: () => void;
}

export default function AnimatedCard({
  user,
  isFirst,
  onSwipeLeft,
  onSwipeRight,
  onSuperLike,
  onInfoPress,
}: AnimatedCardProps) {
  const position = useRef(new Animated.ValueXY()).current;
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const isFirstRef = useRef(isFirst);
  isFirstRef.current = isFirst;

  const onSwipeLeftRef = useRef(onSwipeLeft);
  onSwipeLeftRef.current = onSwipeLeft;
  const onSwipeRightRef = useRef(onSwipeRight);
  onSwipeRightRef.current = onSwipeRight;
  const onSuperLikeRef = useRef(onSuperLike);
  onSuperLikeRef.current = onSuperLike;

  const rotate = position.x.interpolate({
    inputRange: [-CARD_WIDTH / 2, 0, CARD_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, CARD_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-CARD_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const superLikeOpacity = position.y.interpolate({
    inputRange: [-CARD_HEIGHT / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => isFirstRef.current,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 120) {
          Animated.timing(position, {
            toValue: { x: CARD_WIDTH * 1.5, y: 0 },
            duration: 300,
            useNativeDriver: true,
          }).start(() => onSwipeRightRef.current());
        } else if (gesture.dx < -120) {
          Animated.timing(position, {
            toValue: { x: -CARD_WIDTH * 1.5, y: 0 },
            duration: 300,
            useNativeDriver: true,
          }).start(() => onSwipeLeftRef.current());
        } else if (gesture.dy < -120) {
          Animated.timing(position, {
            toValue: { x: 0, y: -CARD_HEIGHT * 1.5 },
            duration: 300,
            useNativeDriver: true,
          }).start(() => onSuperLikeRef.current());
        } else {
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const photoUri = user.photos?.[currentPhotoIndex] || 'https://via.placeholder.com/400x600';

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [...position.getTranslateTransform(), { rotate }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: photoUri }} style={styles.image} />

        <View style={styles.photoDots}>
          {user.photos?.slice(0, 5).map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setCurrentPhotoIndex(i)}
              style={[styles.dot, i === currentPhotoIndex && styles.activeDot]}
            />
          ))}
        </View>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={styles.gradient}
        />

        <View style={styles.likeContainer}>
          <Animated.View style={[styles.likeBadge, { opacity: likeOpacity }]}>
            <LinearGradient
              colors={['#34C759', '#30D158']}
              style={styles.badgeInner}
            >
              <Text style={styles.badgeText}>LIKE</Text>
            </LinearGradient>
          </Animated.View>
        </View>

        <View style={styles.nopeContainer}>
          <Animated.View style={[styles.nopeBadge, { opacity: nopeOpacity }]}>
            <LinearGradient
              colors={['#FF3B30', '#FF453A']}
              style={styles.badgeInner}
            >
              <Text style={styles.badgeText}>NOPE</Text>
            </LinearGradient>
          </Animated.View>
        </View>

        <Animated.View style={[styles.superLikeBadge, { opacity: superLikeOpacity }]}>
          <LinearGradient
            colors={['#007AFF', '#00D4FF']}
            style={styles.badgeInner}
          >
            <Text style={styles.badgeText}>SUPER LIKE</Text>
          </LinearGradient>
        </Animated.View>
      </View>

      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.age}>{user.age}</Text>
          <TouchableOpacity onPress={onInfoPress} style={styles.infoButton}>
            <Ionicons name="information-circle-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
        {user.bio && (
          <Text style={styles.bio} numberOfLines={2}>
            {user.bio}
          </Text>
        )}
        {user.city && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.location}>{user.city}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.card,
    position: 'absolute',
    ...theme.shadows.lg,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '72%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoDots: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  activeDot: {
    backgroundColor: 'white',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  likeContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  nopeContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  likeBadge: {
    transform: [{ rotate: '-15deg' }],
  },
  nopeBadge: {
    transform: [{ rotate: '15deg' }],
  },
  superLikeBadge: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
  },
  badgeInner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 28,
    letterSpacing: 2,
  },
  userInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  age: {
    fontSize: 22,
    fontWeight: '400',
    color: theme.colors.textSecondary,
  },
  infoButton: {
    marginLeft: 'auto',
  },
  bio: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  location: {
    color: theme.colors.textTertiary,
    fontSize: 13,
  },
});
