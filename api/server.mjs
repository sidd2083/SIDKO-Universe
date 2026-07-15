/**
 * Vercel serverless entry point — wraps the Express app.
 * Vercel's Node.js runtime handles the IncomingMessage → Express adaptation.
 *
 * This is plain JavaScript (not TypeScript) and imports the already-bundled
 * output produced by `artifacts/api-server/build.mjs` (dist/handler.mjs),
 * not the raw TypeScript source. Vercel's own Node.js function builder
 * type-checks any .ts file placed under /api using its own tsconfig
 * resolution, which does not agree with this workspace's tsconfig
 * (bundler moduleResolution, project references) and previously produced
 * false-positive Express typing errors. Using plain JS here + a pre-built
 * bundle sidesteps that type-check entirely.
 *
 * Note on uploads: Vercel serverless uses /tmp (ephemeral, max ~512 MB).
 * Files written during one invocation may not persist to the next warm
 * instance. For permanent file storage on Vercel, connect Firebase Storage
 * or Cloudinary and set VITE_FIREBASE_* env vars (the upload route falls
 * back gracefully).
 */

// Ensure the uploads dir exists at /tmp/uploads in the Vercel environment
import { mkdirSync } from "fs";
try {
  mkdirSync("/tmp/uploads", { recursive: true });
} catch {}

import app from "../artifacts/api-server/dist/handler.mjs";

export default app;
