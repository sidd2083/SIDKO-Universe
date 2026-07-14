import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import uploadRouter from "./upload.js";
import settingsRouter from "./settings.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(uploadRouter);
router.use(settingsRouter);

export default router;
