import { Client, Databases, Storage } from 'node-appwrite';

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || '69fe7574001f5b885e47';
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID || '69feb7fb0037747f6dac';
const bucketId = process.env.APPWRITE_STORAGE_BUCKET_ID || '6a02b990002e72c49536';

if (!apiKey) {
  console.error('❌ APPWRITE_API_KEY environment variable is required');
  console.error('   Create one at: Apprise Console > Settings > API Keys');
  console.error('   Required scopes: databases.write, databases.read, storage.write, storage.read');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);
const storage = new Storage(client);

const collections = [
  {
    id: 'users',
    name: 'Users',
    permissions: ['read("any")', 'write("users")'],
    attributes: [
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'fullName', type: 'string', size: 255, required: true },
      { key: 'dateOfBirth', type: 'string', size: 50, required: false },
      { key: 'gender', type: 'string', size: 50, required: false },
      { key: 'interestedIn', type: 'string', size: 50, required: false },
      { key: 'bio', type: 'string', size: 1000, required: false },
      { key: 'photos', type: 'string', size: 500, required: false, array: true },
      { key: 'latitude', type: 'double', required: false },
      { key: 'longitude', type: 'double', required: false },
      { key: 'city', type: 'string', size: 255, required: false },
      { key: 'isPremium', type: 'boolean', required: false },
      { key: 'verified', type: 'boolean', required: false },
      { key: 'age', type: 'integer', required: false, min: 0, max: 150 },
    ],
    indexes: [
      { key: 'gender_index', type: 'key', attributes: ['gender'], orders: ['ASC'] },
      { key: 'age_index', type: 'key', attributes: ['age'], orders: ['ASC'] },
    ],
  },
  {
    id: 'matches',
    name: 'Matches',
    permissions: ['read("any")', 'write("users")'],
    attributes: [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'matchedUserId', type: 'string', size: 255, required: true },
      { key: 'matchedAt', type: 'string', size: 50, required: false },
    ],
    indexes: [
      { key: 'userId_index', type: 'key', attributes: ['userId'], orders: ['ASC'] },
      { key: 'matchedUserId_index', type: 'key', attributes: ['matchedUserId'], orders: ['ASC'] },
      { key: 'user_match_index', type: 'key', attributes: ['userId', 'matchedUserId'], orders: ['ASC', 'ASC'] },
    ],
  },
  {
    id: 'messages',
    name: 'Messages',
    permissions: ['read("any")', 'write("users")'],
    attributes: [
      { key: 'matchId', type: 'string', size: 255, required: true },
      { key: 'senderId', type: 'string', size: 255, required: true },
      { key: 'text', type: 'string', size: 1000, required: false },
      { key: 'type', type: 'string', size: 50, required: false },
      { key: 'mediaUrl', type: 'string', size: 500, required: false },
      { key: 'replyTo', type: 'string', size: 1000, required: false },
      { key: 'editedAt', type: 'string', size: 50, required: false },
      { key: 'createdAt', type: 'string', size: 50, required: true },
      { key: 'readAt', type: 'string', size: 50, required: false },
    ],
    indexes: [
      { key: 'matchId_createdAt_index', type: 'key', attributes: ['matchId', 'createdAt'], orders: ['ASC', 'ASC'] },
    ],
  },
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function attributeExists(colId, attrKey) {
  try {
    const attrs = await databases.listAttributes(databaseId, colId);
    return attrs.attributes.some(a => a.key === attrKey);
  } catch {
    return false;
  }
}

async function indexExists(colId, indexKey) {
  try {
    const indexes = await databases.listIndexes(databaseId, colId);
    return indexes.indexes.some(i => i.key === indexKey);
  } catch {
    return false;
  }
}

async function setupCollections() {
  for (const col of collections) {
    console.log(`\n📁 Setting up collection: ${col.id} (${col.name})`);

    try {
      await databases.getCollection(databaseId, col.id);
      console.log(`   ✅ Collection already exists`);
    } catch {
      console.log(`   Creating collection...`);
      await databases.createCollection(databaseId, col.id, col.name, col.permissions);
      console.log(`   ✅ Collection created`);
      await sleep(1000);
    }

    for (const attr of col.attributes) {
      const exists = await attributeExists(col.id, attr.key);
      if (exists) {
        console.log(`   ⏭️  Attribute "${attr.key}" exists, skipping`);
        continue;
      }
      console.log(`   Creating attribute "${attr.key}" (${attr.type})...`);
      try {
        switch (attr.type) {
          case 'string':
            if (attr.array) {
              await databases.createStringAttribute(databaseId, col.id, attr.key, attr.size, attr.required, undefined, true);
            } else {
              await databases.createStringAttribute(databaseId, col.id, attr.key, attr.size, attr.required);
            }
            break;
          case 'integer':
            await databases.createIntegerAttribute(databaseId, col.id, attr.key, attr.required, attr.min, attr.max);
            break;
          case 'double':
            await databases.createFloatAttribute(databaseId, col.id, attr.key, attr.required);
            break;
          case 'boolean':
            await databases.createBooleanAttribute(databaseId, col.id, attr.key, attr.required);
            break;
        }
        console.log(`   ✅ Attribute "${attr.key}" created`);
        await sleep(500);
      } catch (e) {
        console.error(`   ❌ Failed to create "${attr.key}": ${e.message}`);
      }
    }

    await sleep(1000);

    for (const idx of col.indexes) {
      const exists = await indexExists(col.id, idx.key);
      if (exists) {
        console.log(`   ⏭️  Index "${idx.key}" exists, skipping`);
        continue;
      }
      console.log(`   Creating index "${idx.key}"...`);
      try {
        await databases.createIndex(databaseId, col.id, idx.key, idx.type, idx.attributes, idx.orders);
        console.log(`   ✅ Index "${idx.key}" created`);
        await sleep(500);
      } catch (e) {
        console.error(`   ❌ Failed to create index "${idx.key}": ${e.message}`);
      }
    }
  }
}

async function setupBucket() {
  console.log(`\n📦 Setting up storage bucket: ${bucketId}`);

  try {
    const bucket = await storage.getBucket(bucketId);
    console.log(`   ✅ Bucket "${bucket.name}" already exists`);

    console.log(`   Updating bucket settings...`);
    await storage.updateBucket(
      bucketId,
      'App Media',
      [
        'read("any")',
        'create("any")',
        'update("any")',
        'delete("any")',
      ],
      true,
      true,
      10485760,
      ['jpg', 'jpeg', 'png', 'gif', 'm4a', 'mp3', 'wav'],
      ['image/jpeg', 'image/png', 'image/gif', 'audio/m4a', 'audio/mp3', 'audio/wav'],
      undefined,
      true
    );
    console.log(`   ✅ Bucket settings updated`);
  } catch {
    console.log(`   Creating bucket...`);
    await storage.createBucket(
      bucketId,
      'App Media',
      [
        'read("any")',
        'create("any")',
        'update("any")',
        'delete("any")',
      ],
      true,
      true,
      10485760,
      ['jpg', 'jpeg', 'png', 'gif', 'm4a', 'mp3', 'wav'],
      ['image/jpeg', 'image/png', 'image/gif', 'audio/m4a', 'audio/mp3', 'audio/wav'],
      undefined,
      true
    );
    console.log(`   ✅ Bucket created`);
  }
}

async function main() {
  console.log('🚀 Starting Appwrite setup...\n');
  console.log(`   Endpoint: ${endpoint}`);
  console.log(`   Project:  ${projectId}`);
  console.log(`   Database: ${databaseId}`);
  console.log(`   Bucket:   ${bucketId}`);

  await setupCollections();
  await setupBucket();

  console.log('\n🎉 Setup complete!');
  console.log('   Restart your Expo dev server to pick up the .env changes.');
}

main().catch(console.error);
