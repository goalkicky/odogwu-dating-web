import { NextRequest, NextResponse } from 'next/server';

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
      return NextResponse.json({ error: 'Missing env vars' }, { status: 500 });
    }

    const downloadUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/download`;

    const res = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json({ error: `Appwrite returned ${res.status}`, detail: text.substring(0, 500) }, { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buf = await res.arrayBuffer();

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error', stack: err?.stack?.substring(0, 500) }, { status: 500 });
  }
}
