import { Client, Account, Databases, Storage, Avatars, Realtime } from 'appwrite';

function getClient() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  if (!endpoint || !projectId) return null;
  return new Client().setEndpoint(endpoint).setProject(projectId);
}

const client = getClient();

export const account = client ? new Account(client) : null;
export const databases = client ? new Databases(client) : null;
export const storage = client ? new Storage(client) : null;
export const avatars = client ? new Avatars(client) : null;
export const realtime = client ? new Realtime(client) : null;

export const APPWRITE_CONFIG = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
  usersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || 'users',
  matchesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_MATCHES_COLLECTION_ID || 'matches',
  messagesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID || 'messages',
  storageBucketId: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID || '',
};

export default client;
