export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'non-binary' | 'other';
  interestedIn: 'male' | 'female' | 'both' | 'non-binary';
  bio: string;
  photos: string[];
  latitude: number;
  longitude: number;
  city: string;
  isPremium: boolean;
  verified: boolean;
  age: number;
  lastActive?: string;
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
  type: 'text' | 'image' | 'voice' | 'video';
  mediaUrl?: string;
  replyTo?: {
    id: string;
    text: string;
    senderId: string;
  };
  editedAt?: string;
  createdAt: string;
  readAt?: string;
}

export interface CallSignal {
  type: 'offer' | 'answer' | 'ice-candidate';
  data: any;
  from: string;
  to: string;
  callType: 'audio' | 'video';
}

export type PremiumPlan = 'plus' | 'gold' | 'platinum';

export interface PremiumFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
}
