import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';

interface ActionButtonProps {
  onPress: () => void;
  size?: number;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'superlike' | 'boost';
  disabled?: boolean;
}

export default function ActionButton({
  onPress,
  size = 60,
  children,
  variant = 'primary',
  disabled,
}: ActionButtonProps) {
  const getGradientColors = (): readonly [string, string, ...string[]] => {
    switch (variant) {
      case 'danger': return ['#FF3B30', '#FF6B6B'] as const;
      case 'superlike': return ['#007AFF', '#00D4FF'] as const;
      case 'boost': return ['#AF52DE', '#FF375F'] as const;
      case 'primary': return [theme.colors.primary, theme.colors.secondary] as const;
      default: return [theme.colors.surfaceLight, theme.colors.surface] as const;
    }
  };

  const getBorderColor = () => {
    switch (variant) {
      case 'danger': return '#FF3B30';
      case 'superlike': return '#007AFF';
      case 'boost': return '#AF52DE';
      case 'primary': return theme.colors.primary;
      default: return theme.colors.border;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.7}>
      <LinearGradient
        colors={[theme.colors.surface, theme.colors.surfaceLight]}
        style={[
          styles.outerCircle,
          {
            width: size + 8,
            height: size + 8,
            borderRadius: (size + 8) / 2,
            borderColor: getBorderColor(),
          },
        ]}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.innerCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          <View style={styles.iconContainer}>{children}</View>
        </LinearGradient>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...theme.shadows.md,
  },
  innerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
