import { NextRequest, NextResponse } from 'next/server';
import { Client, Storage, Permission, Role } from 'appwrite';

export async function POST(request: NextRequest) {
  try {
    const { fileIds } = await request.json();
    if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json({ error: 'fileIds array is required' }, { status: 400 });
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

    const results: { fileId: string; ok: boolean }[] = [];

    for (const fileId of fileIds) {
      try {
        const file = await storage.getFile(bucketId, fileId);
        const hasPublicRead = file.$permissions.includes(Permission.read(Role.any()));
        if (!hasPublicRead) {
          await storage.updateFile(bucketId, fileId, undefined, [
            ...file.$permissions,
            Permission.read(Role.any()),
          ]);
        }
        results.push({ fileId, ok: true });
      } catch {
        results.push({ fileId, ok: false });
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
