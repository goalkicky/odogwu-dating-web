import { apiFetch, getToken, setToken, clearToken, WS_URL } from './config';
import { UserProfile, Match, Message } from '../types';

export const authService = {
  loginWithGoogle: async () => {
    window.location.href = '/api/auth/google';
  },

  getCurrentUser: async () => {
    const { user } = await apiFetch('/api/me');
    return user;
  },

  register: async (email: string, password: string, fullName: string) => {
    const data = await apiFetch('/api/auth/register', { method: 'POST', json: { email, password, fullName } });
    setToken(data.token);
    return data;
  },

  login: async (email: string, password: string) => {
    const data = await apiFetch('/api/auth/login', { method: 'POST', json: { email, password } });
    setToken(data.token);
    return data;
  },

  createSession: async (_userId: string, secret: string) => {
    setToken(secret);
    const { user } = await apiFetch('/api/me');
    return user;
  },

  createJWT: async () => ({ jwt: getToken() || 'session' }),

  logout: async () => {
    try { await apiFetch('/api/auth/logout', { method: 'POST' }); } catch {}
    clearToken();
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

  getDiscoverUsers: async (currentUserId: string, preferences: { gender: string; minAge: number; maxAge: number; maxDistance?: number }) => {
    void currentUserId;
    const q = new URLSearchParams({ gender: preferences.gender, minAge: String(preferences.minAge), maxAge: String(preferences.maxAge) });
    if (preferences.maxDistance) q.set('maxDistance', String(preferences.maxDistance));
    const data = await apiFetch(`/api/discover?${q.toString()}`);
    return data?.documents || [];
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
    const data = await apiFetch('/api/matches');
    return data?.documents || [];
  },

  getWhoLikedMe: async (userId: string) => {
    void userId;
    const data = await apiFetch('/api/likes?whoLikedMe=1');
    return data?.documents || [];
  },

  checkMatch: async (userId: string, likedUserId: string) => {
    const r = await apiFetch(`/api/likes?user=${encodeURIComponent(likedUserId)}&other=${encodeURIComponent(userId)}`);
    return !!r.likedByA;
  },
};

export const blockService = {
  list: async () => {
    const data = await apiFetch('/api/blocks');
    return data?.documents || [];
  },

  block: async (blockedId: string) => {
    return apiFetch('/api/blocks', { method: 'POST', json: { blockedId } });
  },

  unblock: async (blockedId: string) => {
    return apiFetch(`/api/blocks/${encodeURIComponent(blockedId)}`, { method: 'DELETE' });
  },
};

function wsUrl(path: string): string {
  const token = getToken();
  return `${WS_URL}${path}${path.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
}

function normalizeMessage(payload: any): Message {
  if (payload && payload.$id && !payload.id) payload = { ...payload, id: payload.$id };
  return payload as Message;
}

function subscribeWs(url: string, onMessage: (data: any) => void): { unsubscribe: () => Promise<void> } {
  let closed = false;
  let ws: WebSocket | null = null;
  let retry = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const scheduleRetry = () => {
    if (closed || timer) return;
    const delay = Math.min(1000 * Math.pow(2, retry++), 15000);
    timer = setTimeout(() => { timer = null; connect(); }, delay);
  };

  const connect = () => {
    if (closed) return;
    let s: WebSocket;
    try {
      s = new WebSocket(url);
    } catch {
      scheduleRetry();
      return;
    }
    ws = s;
    s.onopen = () => { retry = 0; console.log('[WS] open:', url.split('token=')[0]); };
    s.onmessage = (ev) => {
      try { onMessage(JSON.parse(ev.data as string)); } catch {}
    };
    s.onerror = () => { try { s.close(); } catch {} };
    s.onclose = (ev) => {
      console.log('[WS] close:', url.split('token=')[0], 'code=' + ev.code, ev.reason || '');
      if (!closed) scheduleRetry();
    };
  };

  connect();

  return {
    unsubscribe: () => new Promise<void>((resolve) => {
      closed = true;
      if (timer) clearTimeout(timer);
      if (ws) { try { ws.close(); } catch {} }
      setTimeout(resolve, 300);
    }),
  };
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
    let lastTs = '';
    const emit = (m: Message) => {
      if (!m?.id) return;
      if (m.createdAt && m.createdAt > lastTs) lastTs = m.createdAt;
      callback(m);
    };
    const ws = subscribeWs(wsUrl(`/ws/chat?matchId=${encodeURIComponent(matchId)}`), (data) => {
      if (data.type === 'message') emit(normalizeMessage(data.message));
    });

    const poll = async () => {
      try {
        const res = await apiFetch(`/api/messages?matchId=${encodeURIComponent(matchId)}`);
        const docs: any[] = res?.documents || [];
        if (lastTs === '' && docs.length > 30) docs.splice(0, docs.length - 30);
        for (const d of docs) {
          if (lastTs !== '' && (!d.createdAt || d.createdAt <= lastTs)) continue;
          emit(normalizeMessage(d));
        }
      } catch {}
    };
    poll();
    const pollTimer = setInterval(poll, 5000);

    const unsub = ws.unsubscribe;
    return {
      unsubscribe: async () => {
        clearInterval(pollTimer);
        await unsub();
      },
    };
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
    const ws = subscribeWs(wsUrl(`/ws/call?userId=${encodeURIComponent(userId)}`), (data) => {
      if (data && data.to) callback(data);
    });
    return ws;
  },

  getSignals: async (userId: string) => {
    const data = await apiFetch(`/api/call-signals?to=${encodeURIComponent(userId)}`);
    return data?.documents || [];
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
    const data = await apiFetch('/api/call-logs?user=1');
    return data?.documents || [];
  },
};

export const turnService = {
  getIceServers: async (): Promise<RTCIceServer[]> => {
    const data = await apiFetch('/api/call-turn');
    return data?.iceServers || [];
  },
};

export const walletService = {
  getWallet: async () => {
    return apiFetch('/api/wallet');
  },

  purchase: async (coinQty: number) => {
    return apiFetch('/api/wallet/purchase', { method: 'POST', json: { coinQty } });
  },

  verifyPurchase: async (reference: string) => {
    return apiFetch('/api/wallet/verify', { method: 'POST', json: { reference } });
  },

  gift: async (toUserId: string, coins: number) => {
    return apiFetch('/api/wallet/gift', { method: 'POST', json: { toUserId, coins } });
  },

  payPremium: async (planId: string) => {
    return apiFetch('/api/wallet/premium', { method: 'POST', json: { planId } });
  },
};

export const superlikeService = {
  getStatus: async () => {
    return apiFetch('/api/superlikes');
  },

  send: async (matchedUserId: string) => {
    return apiFetch('/api/superlikes', { method: 'POST', json: { matchedUserId } });
  },
};

export const likeService = {
  getStatus: async () => {
    return apiFetch('/api/likes/status');
  },

  send: async (matchedUserId: string) => {
    return apiFetch('/api/likes', { method: 'POST', json: { matchedUserId } });
  },
};

export const feedService = {
  getFeed: async (interest: string, cursor?: string) => {
    const params = new URLSearchParams({ interest });
    if (cursor) params.set('cursor', cursor);
    return apiFetch(`/api/feed?${params.toString()}`);
  },

  createPost: async (images: string[], caption: string, interest: string) => {
    return apiFetch('/api/feed', { method: 'POST', json: { images, caption, interest } });
  },

  deletePost: async (postId: string) => {
    return apiFetch(`/api/feed/${encodeURIComponent(postId)}`, { method: 'DELETE' });
  },

  likePost: async (postId: string) => {
    return apiFetch(`/api/feed/${encodeURIComponent(postId)}/like`, { method: 'POST' });
  },

  unlikePost: async (postId: string) => {
    return apiFetch(`/api/feed/${encodeURIComponent(postId)}/like`, { method: 'DELETE' });
  },

  getComments: async (postId: string, cursor?: string) => {
    const params = new URLSearchParams({ postId });
    if (cursor) params.set('cursor', cursor);
    return apiFetch(`/api/feed/comments?${params.toString()}`);
  },

  addComment: async (postId: string, text: string) => {
    return apiFetch('/api/feed/comments', { method: 'POST', json: { postId, text } });
  },

  deleteComment: async (commentId: string) => {
    return apiFetch(`/api/feed/comments/${encodeURIComponent(commentId)}`, { method: 'DELETE' });
  },

  savePost: async (postId: string) => {
    return apiFetch(`/api/feed/${encodeURIComponent(postId)}/save`, { method: 'POST' });
  },

  unsavePost: async (postId: string) => {
    return apiFetch(`/api/feed/${encodeURIComponent(postId)}/save`, { method: 'DELETE' });
  },

  getPostCounts: async (interests: string[]) => {
    if (interests.length === 0) return {};
    const params = new URLSearchParams({ interests: interests.join(',') });
    const data = await apiFetch(`/api/feed/counts?${params.toString()}`);
    return data.counts as Record<string, number>;
  },
};

async function compressImage(file: File, maxBytes = 15360): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  let img: HTMLImageElement | null = null;
  try {
    img = await new Promise<HTMLImageElement | null>((resolve) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => resolve(null);
      i.src = URL.createObjectURL(file);
    });
  } catch {
    return file;
  }
  if (!img) return file;
  const attempt = (w: number, q: number): Promise<Blob | null> => new Promise(r => {
    const c = document.createElement('canvas');
    const h = Math.max(1, Math.round((img.height / img.width) * w));
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d');
    if (!ctx) { r(null); return; }
    ctx.drawImage(img, 0, 0, w, h);
    c.toBlob(b => r(b), 'image/jpeg', q / 100);
  });
  for (let w = Math.min(img.width || 800, 800); w >= 100; w -= 50) {
    for (let q = 80; q >= 10; q -= 10) {
      const blob = await attempt(w, q);
      if (blob && blob.size <= maxBytes) return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
    }
  }
  const blob = await attempt(80, 10);
  if (blob) return new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
  return file;
}

export const storageService = {
  uploadFile: async (file: File, maxBytes?: number) => {
    file = await compressImage(file, maxBytes);
    const form = new FormData();
    form.append('file', file, file.name);
    const data = await apiFetch('/api/media', { method: 'POST', body: form });
    return { $id: data.key, key: data.key };
  },

  uploadPhoto: async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const file = await compressImage(new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' }));
    const form = new FormData();
    form.append('file', file, file.name);
    const data = await apiFetch('/api/media', { method: 'POST', body: form });
    return { $id: data.key, key: data.key };
  },

  uploadVoiceNote: async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const file = new File([blob], `voice_${Date.now()}.m4a`, { type: 'audio/m4a' });
    const form = new FormData();
    form.append('file', file, file.name);
    const data = await apiFetch('/api/media', { method: 'POST', body: form });
    return { $id: data.key, key: data.key };
  },

  ensurePublicRead: async (fileId: string) => {
    void fileId;
    return { $permissions: ['read("any")'] };
  },

  getFilePreview: (fileId: string) => {
    return `/api/backend/media/${encodeURIComponent(fileId)}`;
  },

  getFileView: (_bucketId: string, fileId: string) => {
    return `/api/backend/media/${encodeURIComponent(fileId)}`;
  },
};
