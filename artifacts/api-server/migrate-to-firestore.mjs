/**
 * One-time migration: pushes all local JSON data into Firestore.
 * Run with: node migrate-to-firestore.mjs
 * Safe to run multiple times — uses set() which overwrites if doc exists.
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!key) { console.error('FIREBASE_SERVICE_ACCOUNT_KEY not set'); process.exit(1); }

const app = initializeApp({ credential: cert(JSON.parse(key)) });
const db = getFirestore(app);

function readJson(file) {
  const p = path.join(__dirname, file);
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; }
}

async function migrateCollection(file, collection, getId) {
  const data = readJson(file);
  if (!data) { console.log(`  ⏭  ${file} not found, skipping`); return; }
  const items = Array.isArray(data) ? data : [data];
  let count = 0;
  for (const item of items) {
    const id = getId(item);
    if (!id) continue;
    // Remove undefined values (Firestore doesn't accept them)
    const clean = JSON.parse(JSON.stringify(item));
    await db.collection(collection).doc(id).set(clean);
    count++;
  }
  console.log(`  ✅  ${collection}: migrated ${count} document(s)`);
}

console.log('\n🔥 Migrating to Firestore...\n');

await migrateCollection('memories.json', 'memories', d => d.id);
await migrateCollection('thoughts.json', 'thoughts', d => d.id);
await migrateCollection('posts.json', 'posts', d => d.id);
await migrateCollection('goals.json', 'goals', d => d.id);
await migrateCollection('music.json', 'music', d => d.id);
await migrateCollection('ngl.json', 'ngl', d => d.id);

// Settings is a single doc
const settings = readJson('settings.json');
if (settings) {
  await db.collection('settings').doc('main').set(JSON.parse(JSON.stringify(settings)));
  console.log('  ✅  settings: migrated');
} else {
  console.log('  ⏭  settings.json not found, skipping');
}

console.log('\n✨ Migration complete!\n');
process.exit(0);
