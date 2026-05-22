import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../theme';
import { useAuth } from '../store/AuthContext';

import LoginScreen from '../screens/auth/LoginScreen';
import { OnboardingProvider } from '../screens/onboarding/OnboardingContext';
import NameScreen from '../screens/onboarding/NameScreen';
import DOBScreen from '../screens/onboarding/DOBScreen';
import GenderScreen from '../screens/onboarding/GenderScreen';
import InterestScreen from '../screens/onboarding/InterestScreen';
import LocationScreen from '../screens/onboarding/LocationScreen';
import PhotoScreen from '../screens/onboarding/PhotoScreen';
import DiscoveryScreen from '../screens/discovery/DiscoveryScreen';
import MatchesScreen from '../screens/matches/MatchesScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import CallScreen from '../screens/chat/CallScreen';
import PremiumScreen from '../screens/premium/PremiumScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function OnboardingStack() {
  return (
    <OnboardingProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Name" component={NameScreen} />
        <Stack.Screen name="DOB" component={DOBScreen} />
        <Stack.Screen name="Gender" component={GenderScreen} />
        <Stack.Screen name="Interest" component={InterestScreen} />
        <Stack.Screen name="Location" component={LocationScreen} />
        <Stack.Screen name="Photo" component={PhotoScreen} />
      </Stack.Navigator>
    </OnboardingProvider>
  );
}

function TabIcon({ name, focused, color }: { name: any; focused: boolean; color: string }) {
  return (
    <View style={[tabStyles.iconContainer, focused && tabStyles.iconContainerActive]}>
      {focused ? (
        <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={tabStyles.gradientIcon}>
          <Ionicons name={name} size={22} color="white" />
        </LinearGradient>
      ) : (
        <Ionicons name={`${name as string}-outline` as any} size={22} color={color} />
      )}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0D0D0D',
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: any = 'flame';
          if (route.name === 'Discover') iconName = 'flame';
          else if (route.name === 'MatchesTab') iconName = 'chatbubbles';
          else if (route.name === 'PremiumTab') iconName = 'diamond';
          else if (route.name === 'Profile') iconName = 'person';
          return <TabIcon name={iconName as any} focused={focused} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Discover" component={DiscoveryScreen} />
      <Tab.Screen name="MatchesTab" component={MatchesScreen} options={{ title: 'Matches' }} />
      <Tab.Screen name="PremiumTab" component={PremiumScreen} options={{ title: 'Premium' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { loading, isAuthenticated, isOnboarded } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D0D0D', alignItems: 'center', justifyContent: 'center' }}>
        <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={{ width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="flame" size={40} color="white" />
        </LinearGradient>
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : !isOnboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingStack} />
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ presentation: 'card' }} />
          <Stack.Screen name="Call" component={CallScreen} options={{ presentation: 'modal', gestureEnabled: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    width: 36,
    height: 36,
    borderRadius: 12,
  },
  gradientIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
