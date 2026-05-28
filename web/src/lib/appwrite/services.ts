import { account, databases, storage, realtime, APPWRITE_CONFIG } from './config';
import { ID, Query, OAuthProvider, Permission, Role } from 'appwrite';
import { UserProfile, Match, Message } from '../types';

function checkInit() {
  if (!account || !databases || !storage) throw new Error('Appwrite not initialized. Set NEXT_PUBLIC_APPWRITE_* env vars.');
}

export const authService = {
  loginWithGoogle: async () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (clientId) {
      window.location.href = '/api/auth/google';
      return;
    }
    checkInit();
    account!.createOAuth2Token({
      provider: OAuthProvider.Google,
      success: `${window.location.origin}/api/auth/callback`,
      failure: `${window.location.origin}/oauth`
    });
  },

  getCurrentUser: async () => {
    checkInit();
    return retryOnRateLimit(() => account!.get());
  },

  createSession: async (userId: string, secret: string) => {
    checkInit();
    return retryOnRateLimit(() => account!.createSession(userId, secret));
  },

  createJWT: async () => {
    checkInit();
    return retryOnRateLimit(() => account!.createJWT());
  },

  logout: async () => {
    checkInit();
    return retryOnRateLimit(() => account!.deleteSession('current'));
  },
};

async function getProfileDoc(userId: string) {
  checkInit();
  return retryOnRateLimit(async () => {
    const result = await databases!.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.usersCollectionId,
      [Query.equal('$id', userId)]
    );
    if (result.documents.length === 0) throw new Error('Profile not found');
    return result.documents[0];
  });
}

export const userService = {
  createProfile: async (userId: string, data: Partial<UserProfile>) => {
    checkInit();
    return databases!.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.usersCollectionId,
      userId,
      data,
      [Permission.read(Role.any()), Permission.write(Role.user(userId))]
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

  getProfile: async (userId: string) => getProfileDoc(userId),

  getDiscoverUsers: async (currentUserId: string, preferences: { gender: string; minAge: number; maxAge: number }) => {
    checkInit();
    const base = [Query.notEqual('$id', currentUserId), Query.greaterThanEqual('age', preferences.minAge), Query.lessThanEqual('age', preferences.maxAge)];
    if (preferences.gender === 'both') {
      const [male, female] = await Promise.all([
        databases!.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.usersCollectionId, [...base, Query.equal('gender', 'male')]),
        databases!.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.usersCollectionId, [...base, Query.equal('gender', 'female')]),
      ]);
      return [...male.documents, ...female.documents];
    }
    return (await databases!.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.usersCollectionId, [...base, Query.equal('gender', preferences.gender)])).documents;
  },

  likeUser: async (userId: string, likedUserId: string) => {
    checkInit();
    return databases!.createDocument(
      APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.matchesCollectionId, ID.unique(),
      { userId, matchedUserId: likedUserId, matchedAt: new Date().toISOString() }
    );
  },

  likeExists: async (fromUserId: string, toUserId: string) => {
    checkInit();
    const r = await databases!.listDocuments(
      APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.matchesCollectionId,
      [Query.equal('userId', fromUserId), Query.equal('matchedUserId', toUserId)]
    );
    return r.documents.length > 0;
  },

  isMutualMatch: async (userId: string, otherUserId: string) => {
    checkInit();
    const [a, b] = await Promise.all([
      databases!.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.matchesCollectionId, [Query.equal('userId', userId), Query.equal('matchedUserId', otherUserId)]),
      databases!.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.matchesCollectionId, [Query.equal('userId', otherUserId), Query.equal('matchedUserId', userId)]),
    ]);
    return a.documents.length > 0 && b.documents.length > 0;
  },
};

export const matchService = {
  getMatch: async (matchId: string) => {
    checkInit();
    return databases!.getDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.matchesCollectionId,
      matchId
    );
  },

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
    const [likedByMe, likedMe] = await Promise.all([
      databases!.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.matchesCollectionId, [Query.equal('userId', userId)]),
      databases!.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.matchesCollectionId, [Query.equal('matchedUserId', userId)]),
    ]);
    const iLiked = new Set(likedByMe.documents.map(d => d.matchedUserId));
    const likedBack = likedMe.documents.filter(d => iLiked.has(d.userId));
    const profiles = await Promise.all(likedBack.map(d => getProfileDoc(d.userId).catch(() => null)));
    return likedBack.map((d, i) => ({ ...d, matchedUser: profiles[i] || null })) as unknown as Match[];
  },

  getWhoLikedMe: async (userId: string) => {
    checkInit();
    const [likedMe, likedByMe] = await Promise.all([
      databases!.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.matchesCollectionId, [Query.equal('matchedUserId', userId)]),
      databases!.listDocuments(APPWRITE_CONFIG.databaseId, APPWRITE_CONFIG.matchesCollectionId, [Query.equal('userId', userId)]),
    ]);
    const iLiked = new Set(likedByMe.documents.map(d => d.matchedUserId));
    const notLikedBack = likedMe.documents.filter(d => !iLiked.has(d.userId));
    const profiles = await Promise.all(notLikedBack.map(d => getProfileDoc(d.userId).catch(() => null)));
    return notLikedBack.map((d, i) => ({ ...d, matchedUser: profiles[i] || null })) as unknown as Match[];
  },

  checkMatch: async (userId: string, likedUserId: string) => {
    checkInit();
    const result = await databases!.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.matchesCollectionId,
      [Query.equal('userId', likedUserId), Query.equal('matchedUserId', userId)]
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

  subscribeToMessages: async (matchId: string, callback: (message: Message) => void) => {
    checkInit();
    const sub = await realtime!.subscribe(
      `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.messagesCollectionId}.documents`,
      (response: any) => {
        const payload = response.payload as any;
        if (payload.matchId === matchId) {
          callback(payload as Message);
        }
      }
    );
    return sub;
  },
};

async function retryOnRateLimit<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      if (err?.message?.includes('Rate limit') && i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
        continue;
      }
      throw err;
    }
  }
  return fn();
}

export const callService = {
  sendSignal: async (data: {
    from: string;
    to: string;
    matchId: string;
    type: 'offer' | 'answer' | 'ice-candidate' | 'end';
    callType?: 'audio' | 'video';
    data: string;
  }) => {
    checkInit();
    return retryOnRateLimit(() => databases!.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.callSignalsCollectionId,
      ID.unique(),
      {
        from: data.from,
        to: data.to,
        matchId: data.matchId,
        type: data.type,
        callType: data.callType || 'audio',
        data: data.data,
        createdAt: new Date().toISOString(),
      },
      [Permission.read(Role.any())]
    ));
  },

  subscribeToSignals: async (userId: string, callback: (signal: any) => void) => {
    checkInit();
    const sub = await realtime!.subscribe(
      `databases.${APPWRITE_CONFIG.databaseId}.collections.${APPWRITE_CONFIG.callSignalsCollectionId}.documents`,
      (response: any) => {
        const p = response.payload;
        if (p.to === userId) {
          callback(p);
        }
      }
    );
    return sub;
  },

  getSignals: async (userId: string) => {
    checkInit();
    return databases!.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.callSignalsCollectionId,
      [Query.equal('to', userId), Query.orderDesc('createdAt'), Query.limit(50)]
    );
  },
};

export const callLogService = {
  createCallLog: async (data: {
    from: string;
    to: string;
    matchId: string;
    callType: 'audio' | 'video';
    status: 'answered' | 'missed' | 'declined';
    duration: number;
  }) => {
    checkInit();
    return retryOnRateLimit(() => databases!.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.callLogsCollectionId,
      ID.unique(),
      {
        from: data.from,
        to: data.to,
        matchId: data.matchId,
        callType: data.callType,
        status: data.status,
        duration: data.duration,
        createdAt: new Date().toISOString(),
      },
      [Permission.read(Role.any())]
    ));
  },

  getCallLogs: async (userId: string) => {
    checkInit();
    const [outgoing, incoming] = await Promise.all([
      databases!.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.callLogsCollectionId,
        [Query.equal('from', userId), Query.orderDesc('createdAt'), Query.limit(100)]
      ),
      databases!.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.callLogsCollectionId,
        [Query.equal('to', userId), Query.orderDesc('createdAt'), Query.limit(100)]
      ),
    ]);
    const all = [...outgoing.documents, ...incoming.documents];
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return all;
  },
};

export const storageService = {
  uploadFile: async (file: File) => {
    checkInit();
    return storage!.createFile(
      APPWRITE_CONFIG.storageBucketId,
      ID.unique(),
      file,
      [Permission.read(Role.any())]
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
      file,
      [Permission.read(Role.any())]
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
      file,
      [Permission.read(Role.any())]
    );
  },

  ensurePublicRead: async (fileId: string) => {
    checkInit();
    const file = await storage!.getFile(APPWRITE_CONFIG.storageBucketId, fileId);
    if (file.$permissions.includes(Permission.read(Role.any()))) return file;
    return storage!.updateFile(
      APPWRITE_CONFIG.storageBucketId,
      fileId,
      undefined,
      [...file.$permissions, Permission.read(Role.any())]
    );
  },

  getFilePreview: (fileId: string) => {
    return `/api/storage/image/${fileId}`;
  },

  getFileView: (bucketId: string, fileId: string) => {
    checkInit();
    return storage!.getFileView(bucketId, fileId);
  },
};
