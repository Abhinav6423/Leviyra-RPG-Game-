import { Router } from "express";
import {
  sendMessage,
  replayMessage,
  continueMessage,
  editMessage,
  deleteMessage,
  selectAlternate,
  editCheckpoint,
  deleteCheckpoint,
  getChatHistory,
  getRecentChats,
  clearChatHistory,
  selectInitialMessage,
} from "../controllers/chat.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import {
  checkMessageLimit,
  getUsage,
} from "../middlewares/checkMessageLimit.middleware.js";
import { messageRateLimiter } from "../middlewares/rateLimit.middleware.js";
import Message from "../modals/message.modal.js";

const router = Router();

// Har route ke liye login zaroori hai
router.use(protect);

/* ============================================================
   Rate limit + daily cap sirf tab lagte hain jab AI call hogi.
   - User message edit karne par AI reply regenerate hota hai -> limit lagao
   - AI message delete karne par AI reply regenerate hota hai -> limit lagao
   - AI message ka silent edit, ya user message delete -> free (AI call nahi)
============================================================ */
const limitWhenRole = (role) => async (req, res, next) => {
  try {
    const msg = await Message.findById(req.params.messageId)
      .select("role")
      .lean();
    if (msg?.role !== role) return next();
  } catch (e) {
    // invalid id etc. -> controller will return a proper 400/404
    return next();
  }

  // Limiters try/catch ke bahar hain, taaki unke errors swallow na hon
  messageRateLimiter(req, res, (err) =>
    err ? next(err) : checkMessageLimit(req, res, next),
  );
};

/* ============================================================
   USAGE INFO (getUsage yahan lagta hai, AI routes me nahi)
   NOTE: ":characterId" routes se pehle rakhna zaroori hai
============================================================ */
router.get("/usage", getUsage);

/* ============================================================
   MESSAGE EDIT / ALTERNATE
============================================================ */
router.patch("/message/:messageId", limitWhenRole("user"), editMessage);
router.patch("/message/:messageId/alternate", selectAlternate);

/* ============================================================
   CHECKPOINTS — App Drawer se edit/delete
============================================================ */
router.patch("/:chatId/checkpoint/:checkpointId", editCheckpoint);
router.delete("/:chatId/checkpoint/:checkpointId", deleteCheckpoint);

/* ============================================================
   HISTORY / HOUSEKEEPING
============================================================ */
router.get("/history/:characterId", getChatHistory);
router.get("/recent", getRecentChats);
router.post("/initial/:characterId", selectInitialMessage);

/* ============================================================
   AI-GENERATING ROUTES (":characterId" wale, isliye sabse aakhir me)
============================================================ */
router.post(
  "/:characterId",
  messageRateLimiter,
  checkMessageLimit, // pehle getUsage tha -> wahi bug tha
  sendMessage,
);
router.post(
  "/:characterId/replay",
  messageRateLimiter,
  checkMessageLimit,
  replayMessage,
);
router.post(
  "/:characterId/continue",
  messageRateLimiter,
  checkMessageLimit,
  continueMessage,
);
router.delete(
  "/:characterId/message/:messageId",
  limitWhenRole("assistant"),
  deleteMessage,
);
router.delete("/:characterId", clearChatHistory);

export default router;
