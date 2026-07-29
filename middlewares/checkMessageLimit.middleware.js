import { hasActivePaidPlan } from "../utils/hasActivePaidPlan.js";
import User from "../modals/User.modal.js";

const FREE_TOTAL_LIMIT = 100;
const FREE_DAILY_LIMIT = 20;

// Weekly plan cap — 1000 MESSAGES per billing cycle, not a 7-day window.
// Keep in sync with WEEKLY_MESSAGE_LIMIT in the chat controller
// (updateUserUsage) — both files reference this same number.
const WEEKLY_MESSAGE_LIMIT = 1000;

export const checkMessageLimit = async (req, res, next) => {
    try {
        // Always fetch fresh from DB — we need live usage numbers for the
        // weekly-cap check, and trusting req.user.subscription alone here
        // could be stale (e.g. right after a webhook renews the plan).
        const user = await User.findById(req.user._id).select("usage subscription");
        if (!user) return res.status(404).json({ error: "User not found" });

        const isPaid = hasActivePaidPlan(user.subscription);
        const plan = user.subscription?.plan;

        // ---- MONTHLY: fully unlimited for the duration of the plan ----
        if (isPaid && plan === "monthly") {
            return next();
        }

        // ---- WEEKLY: unlimited time-wise within the cycle, but capped
        // at WEEKLY_MESSAGE_LIMIT messages. Uses its own counter
        // (usage.weeklyMessagesUsed) — completely separate from the
        // free-tier usage.totalMessages / usage.messagesToday fields,
        // so upgrading/downgrading between plans never mixes numbers. ----
        if (isPaid && plan === "weekly") {
            const weeklyUsed = user.usage?.weeklyMessagesUsed || 0;
            if (weeklyUsed >= WEEKLY_MESSAGE_LIMIT) {
                return res.status(402).json({
                    error: "limit_reached",
                    message: `Weekly message limit reached (${WEEKLY_MESSAGE_LIMIT} messages). Resets when your plan renews.`,
                });
            }
            return next();
        }

        // ---- FREE (or a paid plan that's expired/cancelled and fell
        // through hasActivePaidPlan) -> normal free-tier checks ----
        const usage = user.usage || {};

        if ((usage.totalMessages || 0) >= FREE_TOTAL_LIMIT) {
            return res.status(402).json({ error: "limit_reached", message: "Total limit reached" });
        }

        const now = new Date();
        const resetAt = usage.messagesResetAt;
        const cycleExpired = resetAt && now >= new Date(resetAt);

        if (!cycleExpired && (usage.messagesToday || 0) >= FREE_DAILY_LIMIT) {
            return res.status(402).json({ error: "limit_reached", message: "Daily limit reached for today" });
        }

        next();
    } catch (err) {
        return res.status(500).json({ error: "Limit check error", details: err.message });
    }
};