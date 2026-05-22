import { Client, Account, Databases, Storage, Avatars, Realtime } from 'appwrite';

const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
export const realtime = new Realtime(client);

export const APPWRITE_CONFIG = {
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
  usersCollectionId: 'users',
  matchesCollectionId: 'matches',
  messagesCollectionId: 'messages',
  storageBucketId: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_BUCKET_ID!,
};

export default client;
