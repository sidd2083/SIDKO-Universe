import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import uploadRouter from "./upload.js";
import settingsRouter from "./settings.js";
import firestoreRouter from "./firestore.js";
import musicRouter from "./music.js";
import nglRouter from "./ngl.js";
import guestbookRouter from "./guestbook.js";
import thoughtsRouter from "./thoughts.js";
import postsRouter from "./posts.js";
import memoriesRouter from "./memories.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(uploadRouter);
router.use(settingsRouter);
router.use(firestoreRouter);
router.use(musicRouter);
router.use(nglRouter);
router.use(guestbookRouter);
router.use(thoughtsRouter);
router.use(postsRouter);
router.use(memoriesRouter);

export default router;
