// Serverless-friendly entry point: exports the Express app without
// calling app.listen(). Bundled separately from src/index.ts (the
// long-running dev/production server entry) so platforms like Vercel
// can import a ready-made app without starting a listener at import time.
import app from "./app";

export default app;
