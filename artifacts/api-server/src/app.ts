import express, { type Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import type { IncomingMessage, ServerResponse } from "http";
import path from "path";
import fs from "fs";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

// Ensure uploads directory exists on startup
const UPLOADS_DIR =
  process.env.VERCEL === "1"
    ? "/tmp/uploads"
    : path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const app: Application = express();

// Trust the Replit / reverse-proxy X-Forwarded-For header so that
// express-rate-limit can identify real client IPs correctly.
app.set("trust proxy", 1);

// Security headers: removes X-Powered-By, sets X-Frame-Options, X-Content-Type-Options,
// Referrer-Policy, etc. CSP is disabled — the frontend (Vite) manages its own.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: IncomingMessage & { id?: string | number }) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: ServerResponse) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// CORS: allow Replit preview domains and localhost only.
// In production (Vercel) all traffic is same-origin, so CORS is a no-op there.
app.use(
  cors({
    origin: (origin, callback) => {
      // No origin header → server-to-server or same-origin proxy — always allow
      if (!origin) return callback(null, true);
      // Replit *.replit.dev preview domains
      if (/^https:\/\/[a-z0-9-]+\.replit\.dev$/i.test(origin)) {
        return callback(null, true);
      }
      // Localhost (dev)
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      // Optional explicit production override
      if (process.env.ALLOWED_ORIGIN && origin === process.env.ALLOWED_ORIGIN) {
        return callback(null, true);
      }
      callback(null, false);
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Global rate limit: 200 requests per 15 minutes per IP
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." },
  }),
);

// Serve uploaded files statically under /api/uploads
app.use("/api/uploads", express.static(UPLOADS_DIR));

app.use("/api", router);

export default app;
