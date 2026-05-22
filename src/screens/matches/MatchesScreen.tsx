import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../theme';
import GradientBackground from '../../components/GradientBackground';

const MOCK_MATCHES = [
  {
    id: '1',
    name: 'Sarah Johnson',
    age: 26,
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    lastMessage: 'Hey! How are you?',
    timestamp: '2m ago',
    online: true,
  },
  {
    id: '2',
    name: 'Michael Chen',
    age: 28,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    lastMessage: 'That sounds great!',
    timestamp: '1h ago',
    online: false,
  },
  {
    id: '3',
    name: 'Emily Davis',
    age: 24,
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    lastMessage: 'Would love to meet up!',
    timestamp: '3h ago',
    online: true,
  },
];

export default function MatchesScreen({ navigation }: any) {
  const renderMatch = ({ item }: any) => (
    <TouchableOpacity
      style={styles.matchCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('Chat', { match: item })}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.photo }} style={styles.avatar} />
        {item.online && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.matchInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.matchName}>{item.name}</Text>
          <Text style={styles.matchAge}>{item.age}</Text>
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </TouchableOpacity>
  );

  return (
    <GradientBackground>
      <View style={styles.header}>
        <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.logoSmall}>
          <Ionicons name="flame" size={22} color="white" />
        </LinearGradient>
        <Text style={styles.headerTitle}>Matches</Text>
        <TouchableOpacity>
          <Ionicons name="filter-outline" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.newMatchesRow}>
        <Text style={styles.sectionTitle}>New Matches</Text>
        <FlatList
          horizontal
          data={MOCK_MATCHES}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.newMatchesList}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.newMatchItem} activeOpacity={0.8}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.newMatchBorder}
              >
                <Image source={{ uri: item.photo }} style={styles.newMatchAvatar} />
              </LinearGradient>
              <Text style={styles.newMatchName} numberOfLines={1}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.messagesSection}>
        <Text style={styles.sectionTitle}>Messages</Text>
        <FlatList
          data={MOCK_MATCHES}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={renderMatch}
          contentContainerStyle={styles.messagesList}
        />
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
  newMatchesRow: {
    paddingLeft: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 14,
  },
  newMatchesList: {
    gap: 16,
    paddingRight: 20,
  },
  newMatchItem: {
    alignItems: 'center',
    gap: 8,
    width: 80,
  },
  newMatchBorder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    padding: 3,
  },
  newMatchAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  newMatchName: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  messagesSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesList: {
    gap: 2,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: theme.borderRadius.lg,
    gap: 14,
    backgroundColor: theme.colors.glass,
    marginBottom: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  matchInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'baseline',
  },
  matchName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  matchAge: {
    fontSize: 14,
    color: theme.colors.textTertiary,
  },
  lastMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  timestamp: {
    fontSize: 11,
    color: theme.colors.textTertiary,
  },
});
