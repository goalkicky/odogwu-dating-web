import { NextRequest, NextResponse } from 'next/server';
import { Client, Storage, Permission, Role } from 'appwrite';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const apiKey = process.env.APPWRITE_API_KEY;
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID;

    if (!endpoint || !projectId || !apiKey || !bucketId) {
      return new NextResponse('Server config missing', { status: 500 });
    }

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    const storage = new Storage(client);

    const file = await storage.getFile(bucketId, fileId);

    // Ensure public read so direct Appwrite URLs also work
    if (!file.$permissions.includes(Permission.read(Role.any()))) {
      try {
        await storage.updateFile(bucketId, fileId, undefined, [
          ...file.$permissions,
          Permission.read(Role.any()),
        ]);
      } catch {}
    }

    // Try management API download first
    try {
      const uri = new URL(`${endpoint}/storage/buckets/${bucketId}/files/${fileId}/download`);
      const imageBuffer: ArrayBuffer = await client.call('get', uri, {}, {}, 'arrayBuffer');
      return new NextResponse(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': file.mimeType || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch {}

    // Fallback: direct CDN URL (works after permission fix above)
    const cdnUrl = storage.getFilePreview(bucketId, fileId, 400, 600);
    const cdnRes = await fetch(cdnUrl, { redirect: 'follow' });
    if (!cdnRes.ok) {
      return new NextResponse('Image unavailable', { status: 404 });
    }
    const buf = await cdnRes.arrayBuffer();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': file.mimeType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err: any) {
    return new NextResponse(err?.message || 'Image proxy error', { status: 500 });
  }
}
