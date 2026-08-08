import type { Env } from './types';

let seq = 0;

export class ChatRoom {
  state: DurableObjectState;
  env: Env;
  connections: Map<WebSocket, { userId: string }>;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.connections = new Map();
  }

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // Internal broadcast relay (called by the Worker after persisting to D1).
    if (url.pathname === '/broadcast') {
      const body = (await req.text()) || '{}';
      this.broadcast(body);
      return new Response('ok');
    }

    // WebSocket upgrade (worker has already validated token + match membership).
    if (req.headers.get('Upgrade')?.toLowerCase() === 'websocket') {
      const uid = url.searchParams.get('uid') || '';
      const pair = new WebSocketPair();
      const server = pair[1];
      (server as any).__id = ++seq;
      this.state.acceptWebSocket(server);
      this.connections.set(server, { userId: uid });
      return new Response(null, { status: 101, webSocket: pair[0] });
    }

    return new Response('not found', { status: 404 });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== 'string') return;
    try {
      const data = JSON.parse(message);
      if (data.type === 'typing') {
        const conn = this.connections.get(ws);
        if (!conn) return;
        this.broadcast(JSON.stringify({ type: 'typing', userId: conn.userId, matchId: data.matchId }));
      }
    } catch {
      // ignore malformed frames
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    this.connections.delete(ws);
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    this.connections.delete(ws);
  }

  broadcast(data: string): void {
    for (const ws of this.connections.keys()) {
      try {
        ws.send(data);
      } catch {
        // socket already closed — will be cleaned up by webSocketClose
      }
    }
  }
}

export class CallSignals {
  state: DurableObjectState;
  env: Env;
  users: Map<string, Set<WebSocket>>;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.users = new Map();
  }

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    // Internal relay from the Worker after persisting a signal to D1.
    if (url.pathname === '/broadcast') {
      const parsed = JSON.parse(await req.text());
      this.sendTo(parsed.userId, JSON.stringify(parsed.signal));
      return new Response('ok');
    }

    if (req.headers.get('Upgrade')?.toLowerCase() === 'websocket') {
      const uid = url.searchParams.get('uid') || '';
      const pair = new WebSocketPair();
      const server = pair[1];
      (server as any).__id = ++seq;
      this.state.acceptWebSocket(server);
      if (!this.users.has(uid)) this.users.set(uid, new Set());
      this.users.get(uid)!.add(server);
      return new Response(null, { status: 101, webSocket: pair[0] });
    }

    return new Response('not found', { status: 404 });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== 'string') return;
    try {
      const data = JSON.parse(message);
      if (data.type === 'signal' && data.payload?.to) {
        this.sendTo(data.payload.to, JSON.stringify(data.payload));
      }
    } catch {
      // ignore
    }
  }

  async webSocketClose(ws: WebSocket): Promise<void> {
    this.remove(ws);
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    this.remove(ws);
  }

  private remove(ws: WebSocket): void {
    for (const set of this.users.values()) {
      set.delete(ws);
    }
  }

  private sendTo(userId: string, data: string): void {
    const set = this.users.get(userId);
    if (!set) return;
    for (const ws of set) {
      try {
        ws.send(data);
      } catch {
        // skip closed sockets
      }
    }
  }
}
