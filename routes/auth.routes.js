import express from "express";
import { syncUser, getMe, changeChatCustomizationSettings } from "../controllers/auth.controller.js";
import { protect, verifyFirebaseToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// /api/auth/sync-user
router.post("/sync-user", verifyFirebaseToken, syncUser); // ✅ no DB check needed

router.get("/me", protect, getMe);                        // ✅ full DB check

router.put("/chat-customization-settings", protect, changeChatCustomizationSettings); // ✅ full DB check
export default router;