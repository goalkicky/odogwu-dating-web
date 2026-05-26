import { NextRequest, NextResponse } from 'next/server';
import { Client, Storage } from 'appwrite';

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

    const uri = new URL(`${endpoint}/storage/buckets/${bucketId}/files/${fileId}/download`);
    const imageBuffer: ArrayBuffer = await client.call('get', uri, {}, {}, 'arrayBuffer');

    return new NextResponse(imageBuffer, {
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
