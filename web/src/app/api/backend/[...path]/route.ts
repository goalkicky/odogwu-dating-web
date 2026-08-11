import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function proxy(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  if (!API_URL) {
    return NextResponse.json({ error: 'NEXT_PUBLIC_API_URL not configured' }, { status: 500 });
  }
  const { path } = await ctx.params;
  const upstream = new URL(`/${path.join('/')}${req.nextUrl.search}`, API_URL);

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('content-length');
  headers.delete('connection');
  headers.delete('upgrade');
  headers.delete('accept-encoding');
  headers.delete('expect');

  const init: RequestInit = { method: req.method, headers, redirect: 'manual', cache: 'no-store' };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const buf = await req.arrayBuffer();
    if (buf.byteLength > 0) init.body = buf;
  }

  let upstreamRes: Response;
  try {
    upstreamRes = await fetch(upstream.toString(), init);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Upstream request failed: ${err?.cause?.message || err?.message || 'unknown error'}` },
      { status: 502 }
    );
  }

  const resHeaders = new Headers();
  const ct = upstreamRes.headers.get('content-type');
  if (ct) resHeaders.set('content-type', ct);
  const cc = upstreamRes.headers.get('cache-control');
  if (cc) resHeaders.set('cache-control', cc);
  const sc = upstreamRes.headers.get('set-cookie');
  if (sc) resHeaders.set('set-cookie', sc);

  return new NextResponse(upstreamRes.body, { status: upstreamRes.status, headers: resHeaders });
}

export const GET = (req: NextRequest, ctx: any) => proxy(req, ctx);
export const POST = (req: NextRequest, ctx: any) => proxy(req, ctx);
export const PUT = (req: NextRequest, ctx: any) => proxy(req, ctx);
export const PATCH = (req: NextRequest, ctx: any) => proxy(req, ctx);
export const DELETE = (req: NextRequest, ctx: any) => proxy(req, ctx);
