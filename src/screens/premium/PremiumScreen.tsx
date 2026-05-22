import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../theme';
import Button from '../../components/Button';

const PLANS = [
  {
    id: 'plus',
    name: 'Odogwu Plus',
    price: '$9.99',
    period: '/month',
    color: ['#FF375F', '#FF6B8A'] as [string, string, ...string[]],
    features: [
      'Unlimited Likes',
      '5 Super Likes per day',
      '1 Boost per month',
      'Passport (any location)',
      'Hide Ads',
    ],
  },
  {
    id: 'gold',
    name: 'Odogwu Gold',
    price: '$19.99',
    period: '/month',
    color: ['#FFD700', '#FFA500'] as [string, string, ...string[]],
    features: [
      'All Plus features',
      '10 Super Likes per day',
      '3 Boosts per month',
      'See who likes you',
      'Top Picks daily',
      'Message before matching',
    ],
    popular: true,
  },
  {
    id: 'platinum',
    name: 'Odogwu Platinum',
    price: '$29.99',
    period: '/month',
    color: ['#AF52DE', '#6C63FF'] as [string, string, ...string[]],
    features: [
      'All Gold features',
      'Unlimited Super Likes',
      'Unlimited Boosts',
      'Priority likes',
      'Verified badge',
      'Read receipts',
      'Premium support',
    ],
  },
];

const FEATURES = [
  { icon: 'infinite-outline', title: 'Unlimited Likes', desc: 'Like as many profiles as you want' },
  { icon: 'star', title: 'Super Likes', desc: 'Stand out with Super Likes' },
  { icon: 'flash', title: 'Boosts', desc: 'Get 10x more profile views' },
  { icon: 'globe-outline', title: 'Passport', desc: 'Match with people anywhere' },
  { icon: 'eye-outline', title: 'See Likes', desc: 'See who liked you first' },
  { icon: 'chatbubbles-outline', title: 'Priority Chat', desc: 'Message before matching' },
];

export default function PremiumScreen() {
  const [selectedPlan, setSelectedPlan] = useState('gold');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#0D0D0D', '#1A0A1A', '#0D0D0D']}>
        <View style={styles.header}>
          <LinearGradient colors={[theme.colors.accent, theme.colors.primary]} style={styles.crownIcon}>
            <Ionicons name="diamond" size={32} color="white" />
          </LinearGradient>
          <Text style={styles.headerTitle}>Go Premium</Text>
          <Text style={styles.headerSubtitle}>Unlock the full Odogwu experience</Text>
        </View>

        <View style={styles.featuresPreview}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuresScroll}>
            {FEATURES.map((f, i) => (
              <LinearGradient
                key={i}
                colors={[theme.colors.surface, theme.colors.surfaceLight]}
                style={styles.featureCard}
              >
                <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.featureIcon}>
                  <Ionicons name={f.icon as any} size={22} color="white" />
                </LinearGradient>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </LinearGradient>
            ))}
          </ScrollView>
        </View>
      </LinearGradient>

      <View style={styles.plansSection}>
        <Text style={styles.sectionTitle}>Choose your plan</Text>
        <View style={styles.plansContainer}>
          {PLANS.map((plan) => {
            const selected = selectedPlan === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                activeOpacity={0.85}
                onPress={() => setSelectedPlan(plan.id)}
                style={[styles.planCard, selected && styles.planCardSelected]}
              >
                {plan.popular && (
                  <LinearGradient colors={plan.color} style={styles.popularBadge}>
                    <Text style={styles.popularText}>MOST POPULAR</Text>
                  </LinearGradient>
                )}
                <LinearGradient
                  colors={selected ? plan.color : [theme.colors.surface, theme.colors.surfaceLight] as [string, string, ...string[]]}
                  style={[styles.planHeader, selected && { padding: 0 }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {!selected && <View style={styles.planIconPlaceholder} />}
                  <Text style={[styles.planName, selected && { color: 'white' }]}>{plan.name}</Text>
                  <View style={styles.planPriceRow}>
                    <Text style={[styles.planPrice, selected && { color: 'white' }]}>{plan.price}</Text>
                    <Text style={[styles.planPeriod, selected && { color: 'rgba(255,255,255,0.7)' }]}>{plan.period}</Text>
                  </View>
                </LinearGradient>
                <View style={styles.planFeatures}>
                  {plan.features.map((f, i) => (
                    <View key={i} style={styles.planFeature}>
                      <Ionicons name="checkmark-circle" size={18} color={selected ? theme.colors.primary : theme.colors.textTertiary} />
                      <Text style={[styles.planFeatureText, selected && { color: theme.colors.text }]}>{f}</Text>
                    </View>
                  ))}
                </View>
                <Button
                  title={selected ? 'Subscribe Now' : `Get ${plan.name.split(' ')[1]}`}
                  onPress={() => setSelectedPlan(plan.id)}
                  variant={selected ? 'gradient' : 'outline'}
                  size="md"
                  style={styles.planButton}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Subscription automatically renews. Cancel anytime.{'\n'}
          Terms of Service • Privacy Policy
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  crownIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...theme.shadows.glow,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  featuresPreview: {
    marginBottom: 8,
  },
  featuresScroll: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 8,
  },
  featureCard: {
    width: 140,
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    gap: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  featureDesc: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    lineHeight: 16,
  },
  plansSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  plansContainer: { gap: 16 },
  planCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  planCardSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  popularBadge: {
    paddingVertical: 6,
    alignItems: 'center',
  },
  popularText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  planHeader: {
    padding: 20,
    gap: 4,
  },
  planIconPlaceholder: { height: 0 },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
  },
  planPeriod: {
    fontSize: 14,
    color: theme.colors.textTertiary,
  },
  planFeatures: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 12,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  planFeatureText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  planButton: {
    margin: 16,
  },
  footer: {
    padding: 40,
    alignItems: 'center',
  },
  footerText: {
    color: theme.colors.textTertiary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
