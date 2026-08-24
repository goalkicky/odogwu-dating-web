export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'non-binary' | 'other';
  interestedIn: 'male' | 'female' | 'both' | 'non-binary';
  bio: string;
  photos: string[];
  interests: string[];
  latitude: number;
  longitude: number;
  city: string;
  isPremium: boolean;
  verified: boolean;
  age: number;
  premiumPlan?: string;
  premiumExpiresAt?: string;
  coins?: number;
  superlikesRemaining?: number;
  superlikesDailyLimit?: number;
  lastActive?: string;
  showOnlineStatus?: boolean;
  profileVisibility?: 'everyone' | 'matches_only';
  dataAnalytics?: boolean;
  height?: string;
  weight?: string;
  relationshipGoals?: string;
}

export interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  matchedUser: UserProfile;
  matchedAt: string;
  lastMessage?: Message;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  type: 'text' | 'image' | 'voice' | 'video' | 'gift';
  mediaUrl?: string;
  replyTo?: {
    id: string;
    text: string;
    senderId: string;
  };
  editedAt?: string;
  createdAt: string;
  readAt?: string;
  reactions?: string[];
}

export interface CallSignal {
  type: 'offer' | 'answer' | 'ice-candidate';
  data: any;
  from: string;
  to: string;
  callType: 'audio' | 'video';
}

export interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  images: string[];
  caption: string;
  visibility: 'public' | 'friends';
  likesCount: number;
  commentsCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  createdAt: string;
  interest?: string;
}

export interface FeedComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  text: string;
  createdAt: string;
}

export type PremiumPlan = 'premium' | 'surplus' | 'platinum';

export interface PremiumFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
}
