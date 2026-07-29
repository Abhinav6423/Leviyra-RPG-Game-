/* ============================================================
   MESSAGE RATE LIMITER
   ------------------------------------------------------------
   Caps every user (paid or free — no exceptions) to
   MAX_MESSAGES_PER_WINDOW messages within WINDOW_MS.

   Uses a fixed-window counter per user, stored in-memory on
   `global` (same pattern as userLocks in the chat controller) so
   dev hot-reloads don't spawn duplicate stores.

   NOTE: this is in-memory and per-process. If you ever run
   multiple server instances/pods behind a load balancer, this
   needs to move to Redis (INCR + EXPIRE) or the limit becomes
   effectively N × instanceCount. Fine for a single-instance
   deployment as-is.
============================================================ */

const WINDOW_MS = 60_000; // 1 minute
const MAX_MESSAGES_PER_WINDOW = 10; // same for paid & free — no plan check here on purpose

const rateLimitStore = global.rateLimitStore || new Map();
if (!global.rateLimitStore) global.rateLimitStore = rateLimitStore;

// Periodic sweep so the Map doesn't grow forever with stale/expired
// windows from users who've stopped sending messages.
setInterval(() => {
  const now = Date.now();
  for (const [userId, entry] of rateLimitStore) {
    if (now >= entry.resetAt) rateLimitStore.delete(userId);
  }
}, 60_000);

/**
 * Express middleware — attach to any route that sends a message
 * (sendMessage, replayMessage, continueMessage, the user-edit branch
 * of editMessage, deleteMessage's auto-regen path, etc.)
 *
 * Intentionally does NOT check hasActivePaidPlan — this limit applies
 * to every user regardless of subscription tier.
 */
export const messageRateLimiter = (req, res, next) => {
  const userId = String(req.user?._id || "");
  if (!userId) {
    // No authenticated user on the request — let it fall through to
    // whatever auth middleware runs after this (or reject there).
    return next();
  }

  const now = Date.now();
  let entry = rateLimitStore.get(userId);

  // No entry yet, or the previous window has expired — start a fresh one.
  if (!entry || now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + WINDOW_MS };
    rateLimitStore.set(userId, entry);
    return next();
  }

  if (entry.count >= MAX_MESSAGES_PER_WINDOW) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader("Retry-After", retryAfterSec);
    res.setHeader("X-RateLimit-Limit", MAX_MESSAGES_PER_WINDOW);
    res.setHeader("X-RateLimit-Remaining", 0);
    res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetAt / 1000));
    return res.status(429).json({
      error: `You're sending messages too fast. Please wait ${retryAfterSec}s and try again.`,
      retryAfterSeconds: retryAfterSec,
    });
  }

  entry.count += 1;
  res.setHeader("X-RateLimit-Limit", MAX_MESSAGES_PER_WINDOW);
  res.setHeader("X-RateLimit-Remaining", MAX_MESSAGES_PER_WINDOW - entry.count);
  res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetAt / 1000));
  next();
};