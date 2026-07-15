import { Router } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { isValidSessionToken, ADMIN_COOKIE_NAME } from "../lib/adminSession.js";
import { getAdminFirestore } from "../lib/firebaseAdmin.js";

/**
 * Fixed collections the dashboard is allowed to write to, plus the
 * per-user journal collection (journal_<uid>), matched by prefix.
 */
const FIXED_COLLECTIONS = new Set([
  "anonymous_messages",
  "blogs",
  "goals",
  "memories",
  "music",
  "thoughts",
  "timeline",
]);

function isAllowedCollection(name: string): boolean {
  if (FIXED_COLLECTIONS.has(name)) return true;
  // Per-user journal collections: journal_<uid>, alphanumeric uid only.
  return /^journal_[A-Za-z0-9]+$/.test(name);
}

const router = Router();

// All routes below require a valid admin session cookie — this is the
// server-side gate that lets us keep Firestore's own security rules
// locked to "deny all client writes" while still letting the admin
// dashboard write data (through this server, using the Admin SDK).
router.use("/firestore", (req, res, next) => {
  const token = req.cookies?.[ADMIN_COOKIE_NAME] as string | undefined;
  if (!isValidSessionToken(token)) {
    res.status(401).json({ error: "Admin session required" });
    return;
  }
  next();
});

/** Recursively replace the sentinel string "__serverTimestamp__" with a real server timestamp. */
function resolveTimestamps(value: unknown): unknown {
  if (value === "__serverTimestamp__") return FieldValue.serverTimestamp();
  if (Array.isArray(value)) return value.map(resolveTimestamps);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, resolveTimestamps(v)]),
    );
  }
  return value;
}

router.post("/firestore/:collection", async (req, res): Promise<void> => {
  const { collection } = req.params;
  if (!isAllowedCollection(collection)) {
    res.status(400).json({ error: "Unknown collection" });
    return;
  }
  const data = resolveTimestamps(req.body) as Record<string, unknown>;
  const ref = await getAdminFirestore().collection(collection).add(data);
  res.status(201).json({ id: ref.id });
});

router.put("/firestore/:collection/:id", async (req, res): Promise<void> => {
  const { collection, id } = req.params;
  if (!isAllowedCollection(collection)) {
    res.status(400).json({ error: "Unknown collection" });
    return;
  }
  const data = resolveTimestamps(req.body) as Record<string, unknown>;
  await getAdminFirestore().collection(collection).doc(id).set(data, { merge: true });
  res.json({ ok: true });
});

router.delete("/firestore/:collection/:id", async (req, res): Promise<void> => {
  const { collection, id } = req.params;
  if (!isAllowedCollection(collection)) {
    res.status(400).json({ error: "Unknown collection" });
    return;
  }
  await getAdminFirestore().collection(collection).doc(id).delete();
  res.json({ ok: true });
});

export default router;
