/**
 * One-time migration: find Firestore docs that still point to /api/uploads/...
 * (old local-disk paths) and clear them so they show a clean empty state
 * instead of a broken image.
 *
 * Run: node scripts/fix-broken-uploads.mjs
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!raw) { console.error('FIREBASE_SERVICE_ACCOUNT_KEY not set'); process.exit(1); }

const app = getApps().length
  ? getApps()[0]
  : initializeApp({ credential: cert(JSON.parse(raw)) });

const db = getFirestore(app);

function isBroken(url) {
  return typeof url === 'string' && url.startsWith('/api/uploads/');
}

async function fixCollection(col, getImages, clearImages) {
  const snap = await db.collection(col).get();
  let fixed = 0;
  for (const doc of snap.docs) {
    const data = doc.data();
    const images = getImages(data);
    if (images.some(isBroken)) {
      await doc.ref.update(clearImages(data));
      console.log(`  Fixed ${col}/${doc.id}`);
      fixed++;
    }
  }
  console.log(`${col}: fixed ${fixed}/${snap.size} docs`);
}

// memories: images[] array
await fixCollection(
  'memories',
  d => d.images ?? [],
  () => ({ images: [] })
);

// music: url string
await fixCollection(
  'music',
  d => [d.url ?? ''],
  () => ({ url: '' })
);

// posts: coverImage string
await fixCollection(
  'posts',
  d => [d.coverImage ?? ''],
  () => ({ coverImage: '' })
);

console.log('\nDone. Refresh the page to see clean empty states.');
process.exit(0);
