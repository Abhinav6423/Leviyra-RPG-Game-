import express from "express";
import dodo from "../config/dodo.js";
import { protect } from "../middlewares/auth.middleware.js";
import User from "../modals/User.modal.js";
import { hasActivePaidPlan } from "../utils/hasActivePaidPlan.js";
import { FREE_TOTAL_LIMIT, PACK_MESSAGES } from "../utils/usage.js";

const router = express.Router();

const getDomainUrl = () =>
  process.env.NODE_ENV === "production"
    ? "https://leviyra.com"
    : "http://localhost:3000";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MONTHLY_DAYS = 30;

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
};

const createCheckout = (user, productId, plan) =>
  dodo.checkoutSessions.create({
    product_cart: [{ product_id: productId, quantity: 1 }],
    customer: {
      email: user.email,
      name: user.username,
    },
    metadata: {
      userId: user._id.toString(),
      plan,
    },
    return_url: `${getDomainUrl()}/payment-success`,
  });

// 1. PACK CHECKOUT (one-time, 1000 messages)
router.post("/checkout/pack", protect, async (req, res) => {
  try {
    const user = req.user;

    // Active monthly (unlimited) user doesn't need a pack
    if (
      hasActivePaidPlan(user.subscription, user.usage) &&
      user.subscription.plan === "monthly"
    ) {
      return res.status(400).json({
        message:
          "You already have an active monthly plan with unlimited messages.",
      });
    }

    const session = await createCheckout(
      user,
      process.env.DODO_PRODUCT_ID_PACK,
      "pack",
    );

    res.json({ checkoutUrl: session.checkout_url });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ message: "Could not start checkout" });
  }
});

// 2. MONTHLY CHECKOUT (one-time payment, 30 days access, no auto-renew)
router.post("/checkout/monthly", protect, async (req, res) => {
  try {
    const session = await createCheckout(
      req.user,
      process.env.DODO_PRODUCT_ID_MONTHLY,
      "monthly",
    );

    res.json({ checkoutUrl: session.checkout_url });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ message: "Could not start checkout" });
  }
});

// STATUS ROUTE
router.get("/status", protect, async (req, res) => {
  try {
    const user = req.user;
    const sub = user.subscription;
    const usage = user.usage || {};

    const isPaidActive = hasActivePaidPlan(sub, usage);
    const plan = isPaidActive ? sub.plan : "free";

    // daysLeft only for monthly (pack has no time limit). Calendar days.
    let daysLeft = null;
    if (isPaidActive && plan === "monthly" && sub.currentPeriodEnd) {
      daysLeft = Math.max(
        0,
        Math.round(
          (startOfDay(sub.currentPeriodEnd) - startOfDay(new Date())) /
            MS_PER_DAY,
        ),
      );
    }

    res.json({
      isPaidActive,
      plan,
      status: sub?.status || "none",
      currentPeriodEnd:
        plan === "monthly" ? sub?.currentPeriodEnd || null : null,
      willRenew: false, // no auto-renew anymore
      daysLeft,
      pack:
        plan === "pack"
          ? {
              messagesLeft: usage.packMessagesLeft || 0,
              totalMessages: PACK_MESSAGES,
            }
          : null,
      usage: {
        totalMessages: usage.totalMessages || 0,
        totalLimit: FREE_TOTAL_LIMIT,
        packMessagesLeft: usage.packMessagesLeft || 0,
      },
    });
  } catch (err) {
    console.error("Status check error:", err);
    res.status(500).json({ message: "Could not fetch status" });
  }
});

// WEBHOOK ROUTE
router.post("/webhook", async (req, res) => {
  try {
    const payload = req.rawBody;

    if (!payload) {
      console.error("Webhook: req.rawBody missing");
      return res.status(400).send("Missing raw body");
    }

    const event = dodo.webhooks.unwrap(payload, {
      headers: {
        "webhook-id": req.headers["webhook-id"],
        "webhook-signature": req.headers["webhook-signature"],
        "webhook-timestamp": req.headers["webhook-timestamp"],
      },
    });

    const data = event.data || {};

    console.log("WEBHOOK EVENT:", event.type);
    console.log("WEBHOOK DATA:", JSON.stringify(data, null, 2));

    // Both plans are one-time payments now
    if (event.type !== "payment.succeeded") {
      return res.status(200).send("Ignored");
    }

    const plan = data.metadata?.plan;
    const customerId = data.customer?.customer_id || data.customer_id;
    const paymentId = data.payment_id;

    let resolvedUserId = data.metadata?.userId;
    if (!resolvedUserId && customerId) {
      const u = await User.findOne({
        "subscription.dodoCustomerId": customerId,
      });
      if (u) resolvedUserId = u._id.toString();
    }

    if (!resolvedUserId || !paymentId) {
      console.error("Payment: missing user or payment id", {
        resolvedUserId,
        paymentId,
      });
      return res.status(200).send("Ignored");
    }

    // ================= PACK: +1000 messages =================
    if (plan === "pack") {
      // If this paymentId was already processed, filter won't match -> no double credit
      const result = await User.updateOne(
        {
          _id: resolvedUserId,
          "subscription.packPaymentIds": { $ne: paymentId },
        },
        {
          $set: {
            "subscription.plan": "pack",
            "subscription.status": "active",
            "subscription.dodoCustomerId": customerId,
          },
          $unset: { "subscription.currentPeriodEnd": "" },
          $inc: { "usage.packMessagesLeft": PACK_MESSAGES },
          $addToSet: { "subscription.packPaymentIds": paymentId },
        },
      );

      console.log(
        result.modifiedCount
          ? `Pack credited (+${PACK_MESSAGES}) for user: ${resolvedUserId}`
          : `Pack payment ${paymentId} already processed, skipping`,
      );

      return res.status(200).send("Secure Webhook processed successfully");
    }

    // ================= MONTHLY: 30 days access, one-time =================
    if (plan === "monthly") {
      const user = await User.findById(resolvedUserId);
      if (!user) {
        console.error("Monthly payment: user not found", resolvedUserId);
        return res.status(200).send("Ignored");
      }

      // If user buys again while still active, extend from the current end date
      const now = Date.now();
      const currentEnd = user.subscription?.currentPeriodEnd
        ? new Date(user.subscription.currentPeriodEnd).getTime()
        : 0;
      const isStillActiveMonthly =
        user.subscription?.plan === "monthly" && currentEnd > now;
      const base = isStillActiveMonthly ? currentEnd : now;
      const newEnd = new Date(base + MONTHLY_DAYS * MS_PER_DAY);

      // Same paymentId can't be applied twice (webhook retries)
      const result = await User.updateOne(
        {
          _id: resolvedUserId,
          "subscription.packPaymentIds": { $ne: paymentId },
        },
        {
          $set: {
            "subscription.plan": "monthly",
            "subscription.status": "active",
            "subscription.currentPeriodEnd": newEnd,
            "subscription.dodoCustomerId": customerId,
          },
          $unset: { "subscription.dodoSubscriptionId": "" },
          $addToSet: { "subscription.packPaymentIds": paymentId },
        },
      );

      console.log(
        result.modifiedCount
          ? `Monthly activated for user: ${resolvedUserId}, ends: ${newEnd}`
          : `Monthly payment ${paymentId} already processed, skipping`,
      );

      return res.status(200).send("Secure Webhook processed successfully");
    }

    res.status(200).send("Secure Webhook processed successfully");
  } catch (err) {
    console.error("Webhook Security Alert:", err.message);
    console.error(err);
    res.status(400).send("Webhook signature verification failed");
  }
});

export default router;
