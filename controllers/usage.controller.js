import User from "../modals/User.modal.js";
import { hasActivePaidPlan } from "../utils/hasActivePaidPlan.js";
import {
  FREE_DAILY_LIMIT,
  FREE_TOTAL_LIMIT,
  PACK_MESSAGES,
} from "../utils/usage.js";

const DAY_MS = 24 * 60 * 60 * 1000;

export const getUsage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("usage subscription");
    if (!user) return res.status(404).json({ error: "User not found." });

    const now = new Date();
    const usage = user.usage || {};
    const sub = user.subscription;

    // usage bhi pass karna zaroori hai (pack ke liye packMessagesLeft check hota hai)
    const isPaid = hasActivePaidPlan(sub, usage);

    // ---- Free plan: 24h window ----
    let messagesToday = usage.messagesToday || 0;
    let resetAt = usage.messagesResetAt
      ? new Date(usage.messagesResetAt)
      : null;

    if (resetAt && now >= resetAt) {
      // Window khatam -> asli reset DB me
      await User.updateOne(
        { _id: user._id },
        { $set: { "usage.messagesToday": 0, "usage.messagesResetAt": null } },
      );
      messagesToday = 0;
      resetAt = null;
    } else if (!resetAt && messagesToday > 0) {
      // Purana data: messages hue hain par resetAt null tha -> abhi se 24h window
      resetAt = new Date(now.getTime() + DAY_MS);
      await User.updateOne(
        { _id: user._id },
        { $set: { "usage.messagesResetAt": resetAt } },
      );
    }

    // ---- Pack: bache hue messages (koi time limit / reset nahi) ----
    const isPack = isPaid && sub?.plan === "pack";
    const packLeft = isPack ? usage.packMessagesLeft || 0 : 0;

    res.status(200).json({
      success: true,
      serverTime: now.toISOString(),
      plan: isPaid ? sub.plan : "free",
      isPaid,
      usage: {
        // Free
        messagesToday,
        totalMessages: usage.totalMessages || 0,
        messagesResetAt: resetAt, // null sirf tab jab aaj koi message nahi hua
        // Pack
        packMessagesLeft: packLeft,
        packMessagesUsed: isPack ? Math.max(0, PACK_MESSAGES - packLeft) : 0,
        // Sab plans
        lifetimeMessages: usage.lifetimeMessages || 0,
      },
      remaining: {
        daily: Math.max(0, FREE_DAILY_LIMIT - messagesToday),
        total: Math.max(0, FREE_TOTAL_LIMIT - (usage.totalMessages || 0)),
        pack: packLeft,
      },
      limits: {
        daily: FREE_DAILY_LIMIT,
        total: FREE_TOTAL_LIMIT,
        pack: PACK_MESSAGES,
      },
    });
  } catch (err) {
    console.error("getUsage failed:", err.message);
    res.status(500).json({ error: "Failed to load usage." });
  }
};