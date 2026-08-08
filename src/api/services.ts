import { apiFetch, getToken, setToken, clearToken, WS_URL, API_URL, openGoogleOAuth } from './config';
import { UserProfile, Match, Message } from '../types';

export const authService = {
  loginWithGoogle: async () => {
    await openGoogleOAuth();
  },

  getCurrentUser: async () => {
    const { user } = await apiFetch('/api/me');
    return user;
  },

  register: async (email: string, password: string, fullName: string) => {
    const data = await apiFetch('/api/auth/register', { method: 'POST', json: { email, password, fullName } });
    await setToken(data.token);
    return data;
  },

  login: async (email: string, password: string) => {
    const data = await apiFetch('/api/auth/login', { method: 'POST', json: { email, password } });
    await setToken(data.token);
    return data;
  },

  createSession: async (_userId: string, secret: string) => {
    await setToken(secret);
    const { user } = await apiFetch('/api/me');
    return user;
  },

  createJWT: async () => ({ jwt: (await getToken()) || 'session' }),

  logout: async () => {
    try { await apiFetch('/api/auth/logout', { method: 'POST' }); } catch {}
    await clearToken();
  },
};

async function getProfileDoc(userId: string) {
  return apiFetch(`/api/profile/${encodeURIComponent(userId)}`);
}

export const userService = {
  createProfile: async (userId: string, data: Partial<UserProfile>) => {
    return apiFetch('/api/profile', { method: 'POST', json: { ...data, _userId: userId } });
  },

  updateProfile: async (userId: string, data: Partial<UserProfile>) => {
    return apiFetch('/api/profile', { method: 'PUT', json: data }).catch((e: any) => {
      if (e?.status === 404) return null;
      throw e;
    });
  },

  getProfile: async (userId: string) => getProfileDoc(userId),

  getDiscoverUsers: async (currentUserId: string, preferences: { gender: string; minAge: number; maxAge: number }) => {
    void currentUserId;
    const q = new URLSearchParams({ gender: preferences.gender, minAge: String(preferences.minAge), maxAge: String(preferences.maxAge) });
    return apiFetch(`/api/discover?${q.toString()}`);
  },

  likeUser: async (_userId: string, likedUserId: string) => {
    return apiFetch('/api/likes', { method: 'POST', json: { matchedUserId: likedUserId } });
  },

  likeExists: async (fromUserId: string, toUserId: string) => {
    const r = await apiFetch(`/api/likes?user=${encodeURIComponent(fromUserId)}&other=${encodeURIComponent(toUserId)}`);
    return !!r.likedByA;
  },

  isMutualMatch: async (userId: string, otherUserId: string) => {
    const r = await apiFetch(`/api/likes?user=${encodeURIComponent(userId)}&other=${encodeURIComponent(otherUserId)}`);
    return !!(r.likedByA && r.likedByB);
  },

  getLikedUserIds: async (userId: string) => {
    const r = await apiFetch(`/api/likes?user=${encodeURIComponent(userId)}`);
    return r.documents.map((d: any) => d.matchedUserId);
  },
};

export const matchService = {
  getMatch: async (matchId: string) => {
    return apiFetch(`/api/matches/${encodeURIComponent(matchId)}`);
  },

  createMatch: async (userId: string, matchedUserId: string) => {
    return apiFetch('/api/matches', { method: 'POST', json: { userId, matchedUserId } });
  },

  getUserMatches: async (userId: string) => {
    void userId;
    return apiFetch('/api/matches');
  },

  getWhoLikedMe: async (userId: string) => {
    void userId;
    return apiFetch('/api/likes?whoLikedMe=1');
  },

  checkMatch: async (userId: string, likedUserId: string) => {
    const r = await apiFetch(`/api/likes?user=${encodeURIComponent(likedUserId)}&other=${encodeURIComponent(userId)}`);
    return !!r.likedByA;
  },
};

function wsUrl(path: string): string {
  return `${WS_URL}${path}`;
}

function normalizeMessage(payload: any): Message {
  if (payload && payload.$id && !payload.id) payload = { ...payload, id: payload.$id };
  return payload as Message;
}

export const messageService = {
  sendMessage: async (matchId: string, senderId: string, data: { text?: string; type: string; mediaUrl?: string; replyTo?: any }) => {
    return apiFetch('/api/messages', {
      method: 'POST',
      json: { matchId, senderId, text: data.text || '', type: data.type, mediaUrl: data.mediaUrl || '', replyTo: data.replyTo || undefined },
    });
  },

  editMessage: async (messageId: string, text: string) => {
    return apiFetch(`/api/messages/${encodeURIComponent(messageId)}`, { method: 'PUT', json: { text } });
  },

  reactToMessage: async (messageId: string, reactions: string[]) => {
    return apiFetch(`/api/messages/${encodeURIComponent(messageId)}/reactions`, { method: 'POST', json: { reactions } });
  },

  getMessages: async (matchId: string) => {
    return apiFetch(`/api/messages?matchId=${encodeURIComponent(matchId)}`);
  },

  subscribeToMessages: async (matchId: string, callback: (message: Message) => void) => {
    const token = await getToken();
    const ws = new WebSocket(`${wsUrl(`/ws/chat?matchId=${encodeURIComponent(matchId)}`)}&token=${encodeURIComponent(token)}`);
    const unsubscribe = () => new Promise<void>((resolve) => {
      if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) { resolve(); return; }
      ws.onclose = () => resolve();
      ws.close();
      setTimeout(resolve, 500);
    });
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data as string);
        if (data.type === 'message') callback(normalizeMessage(data.message));
      } catch {}
    };
    return { unsubscribe };
  },
};

export const callService = {
  sendSignal: async (data: {
    from: string;
    to: string;
    matchId: string;
    type: 'offer' | 'answer' | 'ice-candidate' | 'end';
    callType?: 'audio' | 'video';
    data: string;
  }) => {
    return apiFetch('/api/call-signals', { method: 'POST', json: data });
  },

  subscribeToSignals: async (userId: string, callback: (signal: any) => void) => {
    const token = await getToken();
    const ws = new WebSocket(`${wsUrl(`/ws/call?userId=${encodeURIComponent(userId)}`)}&token=${encodeURIComponent(token)}`);
    const unsubscribe = () => new Promise<void>((resolve) => {
      if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) { resolve(); return; }
      ws.onclose = () => resolve();
      ws.close();
      setTimeout(resolve, 500);
    });
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data as string);
        if (data && data.to) callback(data);
      } catch {}
    };
    return { unsubscribe };
  },

  getSignals: async (userId: string) => {
    return apiFetch(`/api/call-signals?to=${encodeURIComponent(userId)}`);
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
    return apiFetch('/api/call-logs', { method: 'POST', json: data });
  },

  getCallLogs: async (userId: string) => {
    void userId;
    return apiFetch('/api/call-logs?user=1');
  },
};

export const storageService = {
  uploadPhoto: async (uri: string) => {
    const form = new FormData();
    const name = `photo_${Date.now()}.jpg`;
    form.append('file', { uri, name, type: 'image/jpeg' } as any);
    const data = await apiFetch('/api/media', { method: 'POST', body: form });
    return { $id: data.key, key: data.key };
  },

  uploadVoiceNote: async (uri: string) => {
    const form = new FormData();
    const name = `voice_${Date.now()}.m4a`;
    form.append('file', { uri, name, type: 'audio/m4a' } as any);
    const data = await apiFetch('/api/media', { method: 'POST', body: form });
    return { $id: data.key, key: data.key };
  },

  ensurePublicRead: async (fileId: string) => {
    void fileId;
    return { $permissions: ['read("any")'] };
  },

  getFilePreview: (fileId: string) => {
    return `${API_URL}/media/${encodeURIComponent(fileId)}`;
  },

  getFileView: (_bucketId: string, fileId: string) => {
    return `${API_URL}/media/${encodeURIComponent(fileId)}`;
  },
};
