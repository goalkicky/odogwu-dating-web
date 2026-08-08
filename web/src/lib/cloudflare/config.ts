'use client';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
export const WS_URL = (API_URL.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:'));

export function getToken(): string {
  if (typeof window === 'undefined') return '';
  try { return window.localStorage.getItem('cf_token') || ''; } catch { return ''; }
}

export function setToken(token: string) {
  try { window.localStorage.setItem('cf_token', token); } catch {}
}

export function clearToken() {
  try { window.localStorage.removeItem('cf_token'); } catch {}
}

export function me(): Promise<{ user: any; profile: any }> {
  return apiFetch('/api/me');
}

export async function apiFetch(path: string, opts: { method?: string; body?: any; json?: any; headers?: Record<string, string> } = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = { ...(opts.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (opts.body !== undefined) {
    body = opts.body;
  } else if (opts.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.json);
  }

  const res = await fetch(`/api/backend${path}`, {
    method: opts.method || 'GET',
    headers,
    body,
    cache: 'no-store',
  });

  if (res.status === 401 && typeof window !== 'undefined') {
    clearToken();
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

// `account` is a compatibility shim so pages that call account.get() /
// account.createJWT() / account!.deleteSession() keep working unchanged.
export const account = {
  get: async () => {
    const { user } = await me();
    return { $id: user.$id, email: user.email, name: user.name };
  },
  createJWT: async () => ({ jwt: getToken() || 'session' }),
  deleteSession: async () => {
    try { await apiFetch('/api/auth/logout', { method: 'POST' }); } catch {}
    clearToken();
  },
  client: {
    setSession: (id: string) => setToken(id),
    setJWT: (jwt: string) => setToken(jwt),
  },
};

export default {};
