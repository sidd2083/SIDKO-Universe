import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { pinoHttp } from "pino-http";
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

const app: Express = express();

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
app.use(
  cors({
    // Reflect the request origin (instead of "*") and allow credentials so
    // the browser will send/accept the admin session cookie. Needed for
    // any direct cross-origin calls (e.g. hitting the API server's own
    // port directly) even though the dev proxy makes same-origin the norm.
    origin: true,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically under /api/uploads
app.use("/api/uploads", express.static(UPLOADS_DIR));

app.use("/api", router);

export default app;
