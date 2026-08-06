import React, { useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
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
import theme from '../theme';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');

export interface AnimatedCardHandle {
  swipeLeft: () => void;
  swipeRight: () => void;
  superLike: () => void;
}

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
  width?: number;
  height?: number;
}

const AnimatedCard = forwardRef<AnimatedCardHandle, AnimatedCardProps>(function AnimatedCard(
  { user, isFirst, onSwipeLeft, onSwipeRight, onSuperLike, width, height },
  ref
) {
  const cardWidth = width ?? WINDOW_WIDTH * 0.9;
  const cardHeight = height ?? WINDOW_HEIGHT * 0.72;
  const widthRef = useRef(cardWidth);
  widthRef.current = cardWidth;
  const heightRef = useRef(cardHeight);
  heightRef.current = cardHeight;

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
    inputRange: [-cardWidth / 2, 0, cardWidth / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, cardWidth / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-cardWidth / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const superLikeOpacity = position.y.interpolate({
    inputRange: [-cardHeight / 4, 0],
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
        const w = widthRef.current;
        const h = heightRef.current;
        if (gesture.dx > 120) {
          Animated.timing(position, {
            toValue: { x: w * 1.5, y: 0 },
            duration: 300,
            useNativeDriver: true,
          }).start(() => onSwipeRightRef.current());
        } else if (gesture.dx < -120) {
          Animated.timing(position, {
            toValue: { x: -w * 1.5, y: 0 },
            duration: 300,
            useNativeDriver: true,
          }).start(() => onSwipeLeftRef.current());
        } else if (gesture.dy < -120) {
          Animated.timing(position, {
            toValue: { x: 0, y: -h * 1.5 },
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

  const swipeLeft = useCallback(() => {
    Animated.timing(position, {
      toValue: { x: -widthRef.current * 1.5, y: 0 },
      duration: 300,
      useNativeDriver: true,
    }).start(() => onSwipeLeftRef.current());
  }, [position]);

  const swipeRight = useCallback(() => {
    Animated.timing(position, {
      toValue: { x: widthRef.current * 1.5, y: 0 },
      duration: 300,
      useNativeDriver: true,
    }).start(() => onSwipeRightRef.current());
  }, [position]);

  const superLike = useCallback(() => {
    Animated.timing(position, {
      toValue: { x: 0, y: -heightRef.current * 1.5 },
      duration: 300,
      useNativeDriver: true,
    }).start(() => onSuperLikeRef.current());
  }, [position]);

  useImperativeHandle(
    ref,
    () => ({ swipeLeft, swipeRight, superLike }),
    [swipeLeft, swipeRight, superLike]
  );

  const photoUri = user.photos?.[currentPhotoIndex] || 'https://via.placeholder.com/400x600';

  return (
    <Animated.View
      style={[
        styles.card,
        { width: cardWidth, height: cardHeight },
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
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.card,
    position: 'absolute',
    ...theme.shadows.lg,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoDots: {
    position: 'absolute',
    top: 10,
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
    height: 140,
  },
  likeContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  nopeContainer: {
    position: 'absolute',
    top: 50,
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
    top: 100,
    alignSelf: 'center',
  },
  badgeInner: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 26,
    letterSpacing: 2,
  },
});

export default AnimatedCard;
