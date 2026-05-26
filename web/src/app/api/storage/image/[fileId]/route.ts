import { NextRequest, NextResponse } from 'next/server';
import { Client, Storage } from 'appwrite';

export async function GET(
  request: NextRequest,
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

    const width = Number(request.nextUrl.searchParams.get('w')) || 400;
    const height = Number(request.nextUrl.searchParams.get('h')) || 600;

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    const storage = new Storage(client);

    const file = await storage.getFile(bucketId, fileId);
    const previewUrl = storage.getFilePreview(bucketId, fileId, width, height);

    const response = await fetch(previewUrl, {
      headers: { 'X-Appwrite-Key': apiKey, 'X-Appwrite-Project': projectId },
      redirect: 'follow',
    });

    if (!response.ok) {
      return new NextResponse('Image fetch failed', { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType = file.mimeType || 'image/jpeg';

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err: any) {
    return new NextResponse(err?.message || 'Image proxy error', { status: 500 });
  }
}
