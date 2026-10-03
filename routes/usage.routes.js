import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { getUsage } from "../controllers/usage.controller.js";

const router = Router();
router.get("/", protect, getUsage);
export default router;