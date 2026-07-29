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
    selectInitialMessage
} from "../controllers/chat.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { checkMessageLimit } from "../middlewares/checkMessageLimit.middleware.js";
import { messageRateLimiter } from "../middlewares/rateLimit.middleware.js";
const router = Router();

// Har route ke liye login zaroori hai
router.use(protect);

/* ============================================================
   IMPORTANT: route order matters in Express — sabse specific /
   fixed-path routes (jaise "/initial", "/recent") hamesha
   ":characterId" jaise dynamic/wildcard routes SE PEHLE aani
   chahiye. Warna Express "/initial" ko bhi characterId = "initial"
   samajh ke galat controller chala dega.
============================================================ */

/* ============================================================
   MESSAGE EDIT / ALTERNATE — plain JSON, koi AI call nahi
   NOTE: editMessage user-message edit path pe internally AI reply
   bhi generate karta hai (regeneration) — agar wahan bhi throttle
   chahiye toh yahan bhi messageRateLimiter add karna, abhi assume
   kiya ki sirf assistant-message silent edit ke liye zyada use hota hai.
============================================================ */
router.patch("/message/:messageId", editMessage);
router.patch("/message/:messageId/alternate", selectAlternate);

/* ============================================================
   CHECKPOINTS — App Drawer se edit/delete
============================================================ */
router.patch("/:chatId/checkpoint/:checkpointId", editCheckpoint);
router.delete("/:chatId/checkpoint/:checkpointId", deleteCheckpoint);

/* ============================================================
   HISTORY / HOUSEKEEPING (fixed paths — inhe dynamic routes se pehle rakha hai)
============================================================ */
router.get("/history/:characterId", getChatHistory);
router.get("/recent", getRecentChats);
router.post("/initial/:characterId", selectInitialMessage);

/* ============================================================
   AI-GENERATING ROUTES
   Inhi par messageRateLimiter (10 msgs/min, paid ya free — sabke
   liye same) aur checkMessageLimit (free-tier daily cap, 402 pe
   return karta hai) dono lagte hain. Baaki routes AI call nahi
   karte, unpe limit check ki zaroorat nahi.

   In sabme ":characterId" hai isliye ye SABSE AAKHIR mein aane
   chahiye, warna upar wale fixed-path routes (/initial, /recent)
   tak kabhi pahunchega hi nahi.
============================================================ */
router.post("/:characterId", messageRateLimiter, checkMessageLimit, sendMessage);
router.post("/:characterId/replay", messageRateLimiter, checkMessageLimit, replayMessage);
router.post("/:characterId/continue", messageRateLimiter, checkMessageLimit, continueMessage);
router.delete("/:characterId/message/:messageId", messageRateLimiter, checkMessageLimit, deleteMessage);
router.delete("/:characterId", clearChatHistory);

export default router;