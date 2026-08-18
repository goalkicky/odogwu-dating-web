import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const MAX_EDGE = 1080;
const JPEG_QUALITY = 80;
const MIN_BYTES_TO_OPTIMIZE = 200 * 1024;

const API = 'https://api.cloudflare.com/client/v4';

let accountId = process.env.R2_ACCOUNT_ID || process.argv.find((a) => a.startsWith('--account='))?.split('=')[1];
const bucket = process.env.R2_BUCKET || 'odogwu-media';
const dryRun = process.argv.includes('--dry-run');
const limit = Number(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] || 0);

function loadToken() {
  if (process.env.CF_API_TOKEN) return process.env.CF_API_TOKEN;
  const candidates = [
    path.join(process.env.APPDATA || '', 'xdg.config', '.wrangler', 'config', 'default.toml'),
    path.join(os.homedir(), '.wrangler', 'config', 'default.toml'),
  ];
  for (const file of candidates) {
    try {
      const text = fs.readFileSync(file, 'utf8');
      const m = /^oauth_token\s*=\s*"([^"]+)"/m.exec(text);
      if (m) return m[1];
    } catch {}
  }
  return undefined;
}

const token = loadToken();
if (!token) {
  console.error('No auth token found. Set CF_API_TOKEN or run `wrangler login`.');
  process.exit(1);
}

const headers = { Authorization: `Bearer ${token}` };

async function api(pathname, init) {
  const res = await fetch(`${API}${pathname}`, {
    ...init,
    headers: { ...headers, ...(init && init.headers ? init.headers : {}) },
  });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(`${res.status} ${pathname}: ${JSON.stringify(data.errors || data)}`);
  }
  return data;
}

async function discoverAccountId() {
  const data = await api('/accounts');
  const accounts = data.result || [];
  if (accounts.length !== 1) {
    console.error(`Expected 1 account, found ${accounts.length}. Pass --account=<id>.`);
    process.exit(1);
  }
  return accounts[0].id;
}

async function listAllObjects() {
  const objects = [];
  let cursor;
  do {
    const q = new URLSearchParams({ limit: '1000' });
    if (cursor) q.set('cursor', cursor);
    const data = await api(`/accounts/${accountId}/r2/buckets/${bucket}/objects?${q}`);
    const info = data.result_info || {};
    for (const obj of data.result || []) objects.push(obj);
    cursor = info.is_truncated ? info.cursor : undefined;
  } while (cursor);
  return objects;
}

function isOptimizable(obj) {
  const t = ((obj.http_metadata && obj.http_metadata.contentType) || '').toLowerCase();
  const ext = (obj.key || '').split('.').pop()?.toLowerCase() || '';
  if (t === 'image/gif' || ext === 'gif') return false;
  return t.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
}

async function processObject(obj) {
  const key = obj.key;
  const enc = encodeURIComponent(key);
  const originalSize = obj.size;
  if (originalSize <= MIN_BYTES_TO_OPTIMIZE) return;

  let original;
  try {
    const res = await fetch(`${API}/accounts/${accountId}/r2/buckets/${bucket}/objects/${enc}`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    original = Buffer.from(await res.arrayBuffer());
  } catch (err) {
    console.error(`  FAIL get ${key}:`, err.message);
    return;
  }

  const contentType = ((obj.http_metadata && obj.http_metadata.contentType) || '').toLowerCase();
  let out;
  let outType;
  try {
    const meta = await sharp(original).metadata();
    const longEdge = Math.max(meta.width || 0, meta.height || 0);
    const pipeline = sharp(original).rotate().resize({ width: MAX_EDGE, withoutEnlargement: true });
    if (longEdge <= MAX_EDGE && contentType === 'image/jpeg' && originalSize <= 500 * 1024) return;
    if (contentType === 'image/png') {
      out = await pipeline.flatten({ background: '#ffffff' }).jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
      outType = 'image/jpeg';
    } else if (contentType === 'image/webp') {
      out = await pipeline.flatten({ background: '#ffffff' }).webp({ quality: JPEG_QUALITY }).toBuffer();
      outType = 'image/webp';
    } else {
      out = await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
      outType = 'image/jpeg';
    }
  } catch (err) {
    console.error(`  FAIL process ${key}:`, err.message);
    return;
  }

  if (out.length >= originalSize) {
    console.log(`  SKIP  ${key}  ${fmt(originalSize)} -> ${fmt(out.length)} (no gain)`);
    return;
  }

  const saved = originalSize - out.length;
  console.log(
    `  ${dryRun ? 'DRY' : 'OK  '} ${key}  ${fmt(originalSize)} -> ${fmt(out.length)}  (-${Math.round((saved / originalSize) * 100)}%)`
  );

  if (!dryRun) {
    try {
      const res = await fetch(`${API}/accounts/${accountId}/r2/buckets/${bucket}/objects/${enc}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': outType },
        body: out,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.error(`  FAIL put ${key}:`, err.message);
    }
  }
}

function fmt(n) {
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}KB`;
  return `${(n / 1024 / 1024).toFixed(2)}MB`;
}

const start = Date.now();
if (!accountId) {
  accountId = await discoverAccountId();
}
console.log(`Account: ${accountId}`);
console.log(`Listing objects in r2://${bucket} ...`);
const objects = await listAllObjects();
console.log(`Found ${objects.length} objects (dry-run=${dryRun})`);
let processed = 0;
for (const obj of objects) {
  if (limit && processed >= limit) break;
  if (!isOptimizable(obj)) continue;
  processed++;
  await processObject(obj);
}
console.log(`Done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
