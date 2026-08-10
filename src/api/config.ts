import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || '';
export const WS_URL = API_URL.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:');

const TOKEN_KEY = 'cf_token';

export async function getToken(): Promise<string> {
  try {
    return (await AsyncStorage.getItem(TOKEN_KEY)) || '';
  } catch {
    return '';
  }
}

export async function setToken(token: string) {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch {}
}

export async function clearToken() {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export async function me(): Promise<{ user: any; profile: any }> {
  return apiFetch('/api/me');
}

export async function apiFetch(
  path: string,
  opts: { method?: string; body?: any; json?: any; headers?: Record<string, string> } = {}
): Promise<any> {
  const token = await getToken();
  const headers: Record<string, string> = { ...(opts.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: any;
  if (opts.body !== undefined) {
    body = opts.body;
  } else if (opts.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.json);
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method || 'GET',
    headers,
    body,
  });

  if (res.status === 401) {
    await clearToken();
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      detail = data?.error || data?.message || detail;
    } catch {}
    const err: any = new Error(detail);
    err.status = res.status;
    throw err;
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res;
}

export async function openGoogleOAuth(): Promise<void> {
  await Linking.openURL(`${API_URL}/api/auth/google/start?redirectTo=${encodeURIComponent('odogwu-dating://oauth')}`);
}

// Compatibility shim so screens calling account.get() keep working unchanged.
export const account = {
  get: async () => {
    const { user } = await me();
    return { $id: user.$id, email: user.email, name: user.name };
  },
  createJWT: async () => ({ jwt: (await getToken()) || 'session' }),
  deleteSession: async (_sessionId?: string) => {
    try { await apiFetch('/api/auth/logout', { method: 'POST' }); } catch {}
    await clearToken();
  },
  client: {
    setSession: (id: string) => setToken(id),
    setJWT: (jwt: string) => setToken(jwt),
  },
};

export default {};
