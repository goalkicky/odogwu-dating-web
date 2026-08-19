export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  SESSION_SECRET: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  PAYSTACK_SECRET_KEY?: string;
  PAYSTACK_CALLBACK_URL?: string;
  TURN_KEY_ID?: string;
  TURN_KEY_TOKEN?: string;
  ChatRoom: DurableObjectNamespace;
  CallSignals: DurableObjectNamespace;
}

export interface UserRow {
  id: string;
  email: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  interested_in: string;
  bio: string;
  photos: string;
  interests: string;
  latitude: number;
  longitude: number;
  city: string;
  is_premium: number;
  verified: number;
  age: number;
  premium_plan: string;
  premium_expires_at: string;
  coins: number;
  show_online_status: number;
  profile_visibility: string;
  data_analytics: number;
  superlikes_remaining: number;
  superlikes_date: string;
  likes_remaining: number;
  likes_date: string;
  google_sub: string | null;
  password_hash: string;
  password_salt: string;
  last_active: string;
  height: string;
  weight: string;
  relationship_goals: string;
  created_at: string;
  updated_at: string;
}

export interface MatchRow {
  id: string;
  user_id: string;
  matched_user_id: string;
  matched_at: string;
}

export interface MessageRow {
  id: string;
  match_id: string;
  sender_id: string;
  text: string;
  type: string;
  media_url: string;
  reply_to: string;
  edited_at: string;
  created_at: string;
  read_at: string;
  reactions: string;
}
