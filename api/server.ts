/**
 * Vercel serverless entry point — wraps the Express app.
 * Vercel's Node.js runtime handles the IncomingMessage → Express adaptation.
 *
 * Note on uploads: Vercel serverless uses /tmp (ephemeral, max ~512 MB).
 * Files written during one invocation may not persist to the next warm instance.
 * For permanent file storage on Vercel, connect Firebase Storage or Cloudinary
 * and set VITE_FIREBASE_* env vars (the upload route falls back gracefully).
 */

// Ensure the uploads dir exists at /tmp/uploads in the Vercel environment
import { mkdirSync } from "fs";
try { mkdirSync("/tmp/uploads", { recursive: true }); } catch {}

import app from "../artifacts/api-server/src/app.js";

export default app;
