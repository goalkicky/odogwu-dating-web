import { account, databases, storage, realtime, APPWRITE_CONFIG } from './config';
import { ID, Query, OAuthProvider, Permission, Role } from 'appwrite';
import { UserProfile, Match, Message } from '../types';

function checkInit() {
  if (!account || !databases || !storage) throw new Error('Appwrite not initialized. Set NEXT_PUBLIC_APPWRITE_* env vars.');
}

export const authService = {
  loginWithGoogle: async () => {
    checkInit();
    account!.createOAuth2Token({
      provider: OAuthProvider.Google,
      success: `${window.location.origin}/api/auth/callback`,
      failure: `${window.location.origin}/oauth`
    });
  },

  getCurrentUser: async () => {
    checkInit();
    return account!.get();
  },

  logout: async () => {
    checkInit();
    return account!.deleteSession('current');
  },
};

export const userService = {
  createProfile: async (userId: string, data: Partial<UserProfile>) => {
    checkInit();
    return databases!.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.usersCollectionId,
      userId,
      data,
      [
        Permission.read(Role.any()),
        Permission.write(Role.user(userId)),
      ]
    );
  },

  updateProfile: async (userId: string, data: Partial<UserProfile>) => {
    checkInit();
    return databases!.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.usersCollectionId,
      userId,
      data
    );
  },

  getProfile: async (userId: string) => {
    checkInit();
    return databases!.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.usersCollectionId,
      userId
    );
  },

  getDiscoverUsers: async (currentUserId: string, preferences: { gender: string; minAge: number; maxAge: number }) => {
    checkInit();
    const queries = [
      Query.notEqual('$id', currentUserId),
      Query.equal('gender', preferences.gender),
      Query.greaterThanEqual('age', preferences.minAge),
      Query.lessThanEqual('age', preferences.maxAge),
    ];
    return databases!.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.usersCollectionId,
      queries
    );
  },
};

export const matchService = {
  createMatch: async (userId: string, matchedUserId: string) => {
    checkInit();
    return databases!.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.matchesCollectionId,
      ID.unique(),
      { userId, matchedUserId, matchedAt: new Date().toISOString() }
    );
  },

  getUserMatches: async (userId: string) => {
    checkInit();
    const [matches1, matches2] = await Promise.all([
      databases!.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.matchesCollectionId,
        [Query.equal('userId', userId)]
      ),
      databases!.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.matchesCollectionId,
        [Query.equal('matchedUserId', userId)]
      ),
    ]);
    return [...matches1.documents, ...matches2.documents] as unknown as Match[];
  },

  checkMatch: async (userId: string, likedUserId: string) => {
    checkInit();
    const result = await databases!.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.matchesCollectionId,
      [
        Query.equal('userId', likedUserId),
        Query.equal('matchedUserId', userId),
      ]
    );
    return result.documents.length > 0;
  },
};

export const messageService = {
  sendMessage: async (matchId: string, senderId: string, data: { text?: string; type: string; mediaUrl?: string; replyTo?: any }) => {
    checkInit();
    return databases!.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.messagesCollectionId,
      ID.unique(),
      {
        matchId,
        senderId,
        text: data.text || '',
        type: data.type,
        mediaUrl: data.mediaUrl || '',
        replyTo: data.replyTo ? JSON.stringify(data.replyTo) : '',
        createdAt: new Date().toISOString(),
        readAt: '',
      }
    );
  },

  editMessage: async (messageId: string, text: string) => {
    checkInit();
    return databases!.updateDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.messagesCollectionId,
      messageId,
      { text, editedAt: new Date().toISOString() }
    );
  },

  getMessages: async (matchId: string) => {
    checkInit();
    return databases!.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.messagesCollectionId,
      [Query.equal('matchId', matchId), Query.orderAsc('createdAt')]
    );
  },

  subscribeToMessages: (matchId: string, callback: (message: Message) => void) => {
    checkInit();
    return realtime!.subscribe(
      `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.messagesCollectionId}.documents`,
      (response: any) => {
        const payload = response.payload as any;
        if (payload.matchId === matchId) {
          callback(payload as Message);
        }
      }
    );
  },
};

export const storageService = {
  uploadFile: async (file: File) => {
    checkInit();
    return storage!.createFile(
      APPWRITE_CONFIG.storageBucketId,
      ID.unique(),
      file
    );
  },

  uploadPhoto: async (uri: string) => {
    checkInit();
    const response = await fetch(uri);
    const blob = await response.blob();
    const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
    return storage!.createFile(
      APPWRITE_CONFIG.storageBucketId,
      ID.unique(),
      file
    );
  },

  uploadVoiceNote: async (uri: string) => {
    checkInit();
    const response = await fetch(uri);
    const blob = await response.blob();
    const file = new File([blob], `voice_${Date.now()}.m4a`, { type: 'audio/m4a' });
    return storage!.createFile(
      APPWRITE_CONFIG.storageBucketId,
      ID.unique(),
      file
    );
  },

  getFilePreview: (fileId: string) => {
    checkInit();
    return storage!.getFilePreview(APPWRITE_CONFIG.storageBucketId, fileId, 400, 600);
  },

  getFileView: (bucketId: string, fileId: string) => {
    checkInit();
    return storage!.getFileView(bucketId, fileId);
  },
};
