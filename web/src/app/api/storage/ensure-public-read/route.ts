import { NextRequest, NextResponse } from 'next/server';
import { Client, Storage, Permission, Role } from 'appwrite';

export async function POST(request: NextRequest) {
  try {
    const { fileId } = await request.json();
    if (!fileId) {
      return NextResponse.json({ error: 'fileId is required' }, { status: 400 });
    }

    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
    const apiKey = process.env.APPWRITE_API_KEY;
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID;

    if (!endpoint || !projectId || !apiKey || !bucketId) {
      return NextResponse.json({ error: 'Server config missing' }, { status: 500 });
    }

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey);

    const storage = new Storage(client);

    const file = await storage.getFile(bucketId, fileId);
    const hasPublicRead = file.$permissions.includes(Permission.read(Role.any()));
    if (hasPublicRead) {
      return NextResponse.json({ ok: true, alreadyPublic: true });
    }

    await storage.updateFile(bucketId, fileId, undefined, [
      ...file.$permissions,
      Permission.read(Role.any()),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
