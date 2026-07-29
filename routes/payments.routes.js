import express from "express";
import dodo from "../config/dodo.js";
import { protect } from "../middlewares/auth.middleware.js";
import User from "../modals/User.modal.js";
import { hasActivePaidPlan } from "../utils/hasActivePaidPlan.js";

const router = express.Router();

// 1. WEEKLY CHECKOUT ROUTE
router.post("/checkout/weekly", protect, async (req, res) => {
  try {
    const user = req.user;
    const domainUrl =
      process.env.NODE_ENV === "production"
        ? "https://leviyra.com"
        : "http://localhost:3000";

    const session = await dodo.checkoutSessions.create({
      product_cart: [
        { product_id: process.env.DODO_PRODUCT_ID_WEEKLY, quantity: 1 },
      ],
      customer: {
        email: user.email,
        name: user.username,
      },
      metadata: {
        userId: user._id.toString(),
        plan: "weekly",
      },
      return_url: `${domainUrl}/payment-success`,
    });

    res.json({ checkoutUrl: session.checkout_url });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ message: "Could not start checkout" });
  }
});

// 2. MONTHLY CHECKOUT ROUTE
router.post("/checkout/monthly", protect, async (req, res) => {
  try {
    const user = req.user;
    const domainUrl =
      process.env.NODE_ENV === "production"
        ? "https://leviyra.com"
        : "http://localhost:3000";

    const session = await dodo.checkoutSessions.create({
      product_cart: [
        { product_id: process.env.DODO_PRODUCT_ID_MONTHLY, quantity: 1 },
      ],
      customer: {
        email: user.email,
        name: user.username,
      },
      metadata: {
        userId: user._id.toString(),
        plan: "monthly",
      },
      return_url: `${domainUrl}/payment-success`,
    });

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

    const isPaidActive = hasActivePaidPlan(sub);

    let daysLeft = null;
    if (isPaidActive) {
      const msLeft = new Date(sub.currentPeriodEnd) - new Date();
      daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
    }

    res.json({
      isPaidActive,
      plan: sub?.plan || "free",
      status: sub?.status || "none",
      currentPeriodEnd: sub?.currentPeriodEnd || null,
      willRenew: sub?.status === "active",
      daysLeft,
      usage: {
        totalMessages: user.usage?.totalMessages || 0,
        totalLimit: 50,
      },
    });
  } catch (err) {
    console.error("Status check error:", err);
    res.status(500).json({ message: "Could not fetch status" });
  }
});

// CANCEL SUBSCRIPTION ROUTE (graceful — access continues till period end)
router.post("/cancel", protect, async (req, res) => {
  try {
    const user = req.user;
    const sub = user.subscription;
    const subId = sub?.dodoSubscriptionId;

    if (!subId || !sub?.plan || sub.plan === "free") {
      return res.status(400).json({ message: "No active subscription found" });
    }

    if (sub.status === "cancelled" || sub.status === "expired") {
      return res
        .status(400)
        .json({ message: "Subscription is already cancelled or expired" });
    }

    await dodo.subscriptions.update(subId, {
      cancel_at_next_billing_date: true,
    });

    await User.findByIdAndUpdate(user._id, {
      "subscription.status": "cancelled",
    });

    return res.status(200).json({
      success: true,
      message:
        "Your subscription has been cancelled. You'll keep access until your current billing period ends.",
      accessUntil: sub.currentPeriodEnd,
    });
  } catch (err) {
    console.error("Cancel subscription error:", err);
    return res.status(500).json({ message: "Could not cancel subscription" });
  }
});

// REACTIVATE SUBSCRIPTION ROUTE (undo a scheduled cancellation)
router.post("/reactivate", protect, async (req, res) => {
  try {
    const user = req.user;
    const sub = user.subscription;
    const subId = sub?.dodoSubscriptionId;

    if (!subId || sub.status !== "cancelled") {
      return res
        .status(400)
        .json({ message: "No cancelled subscription to reactivate" });
    }

    await dodo.subscriptions.update(subId, {
      cancel_at_next_billing_date: false,
    });

    await User.findByIdAndUpdate(user._id, {
      "subscription.status": "active",
    });

    return res.status(200).json({
      success: true,
      message: "Your subscription has been reactivated.",
    });
  } catch (err) {
    console.error("Reactivate subscription error:", err);
    return res
      .status(500)
      .json({ message: "Could not reactivate subscription" });
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

    console.log("WEBHOOK DATA:", JSON.stringify(data, null, 2));

    const customerId = data.customer?.customer_id || data.customer_id;
    const subscriptionId = data.subscription_id;
    const userId = data.metadata?.userId;

    const resolveUser = async () => {
      if (userId) return userId;
      if (subscriptionId) {
        const u = await User.findOne({
          "subscription.dodoSubscriptionId": subscriptionId,
        });
        if (u) return u._id.toString();
      }
      if (customerId) {
        const u = await User.findOne({
          "subscription.dodoCustomerId": customerId,
        });
        if (u) return u._id.toString();
      }
      return null;
    };

    // FIX: don't blindly default to "weekly" — fall back to the user's
    // existing plan first, so a renewal/update event without metadata
    // doesn't silently downgrade a monthly subscriber to weekly.
    const resolvePlan = async (resolvedUserId) => {
      if (data.metadata?.plan) return data.metadata.plan;
      if (resolvedUserId) {
        const existing =
          await User.findById(resolvedUserId).select("subscription.plan");
        if (
          existing?.subscription?.plan &&
          existing.subscription.plan !== "free"
        ) {
          return existing.subscription.plan;
        }
      }
      return "weekly";
    };

    const getFallbackPeriodEnd = (planType) => {
      const daysToAdd = planType === "monthly" ? 30 : 7;
      return new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000);
    };

    if (
      event.type === "subscription.active" ||
      event.type === "payment.succeeded"
    ) {
      const resolvedUserId = await resolveUser();

      if (resolvedUserId) {
        const purchasedPlan = await resolvePlan(resolvedUserId);
        const periodEnd = data.next_billing_date
          ? new Date(data.next_billing_date)
          : getFallbackPeriodEnd(purchasedPlan);

        await User.findByIdAndUpdate(resolvedUserId, {
          "subscription.plan": purchasedPlan,
          "subscription.status": "active",
          "subscription.currentPeriodEnd": periodEnd,
          "subscription.dodoCustomerId": customerId,
          "subscription.dodoSubscriptionId": subscriptionId,
        });

        console.log(
          `Subscription activated for user: ${resolvedUserId} (${purchasedPlan})`,
        );
      } else {
        console.error(`Could not resolve user for ${event.type}`, {
          customerId,
          subscriptionId,
        });
      }
    }

    if (event.type === "subscription.updated") {
      const resolvedUserId = await resolveUser();

      if (resolvedUserId) {
        const status = data.status;

        if (status === "active") {
          const purchasedPlan = await resolvePlan(resolvedUserId);
          const periodEnd = data.next_billing_date
            ? new Date(data.next_billing_date)
            : getFallbackPeriodEnd(purchasedPlan);

          await User.findByIdAndUpdate(resolvedUserId, {
            "subscription.plan": purchasedPlan,
            "subscription.status": "active",
            "subscription.currentPeriodEnd": periodEnd,
            "subscription.dodoCustomerId": customerId,
            "subscription.dodoSubscriptionId": subscriptionId,
          });
          console.log(
            `Subscription updated -> active for user: ${resolvedUserId}`,
          );
        } else if (status === "cancelled") {
          await User.findByIdAndUpdate(resolvedUserId, {
            "subscription.status": "cancelled",
          });
          console.log(
            `Subscription updated -> cancelled (access continues till period end) for user: ${resolvedUserId}`,
          );
        } else if (
          status === "expired" ||
          status === "on_hold" ||
          status === "failed"
        ) {
          await User.findByIdAndUpdate(resolvedUserId, {
            "subscription.status": "expired",
          });
          console.log(
            `Subscription updated -> expired for user: ${resolvedUserId}`,
          );
        }
      } else {
        console.error(`Could not resolve user for subscription.updated`, {
          customerId,
          subscriptionId,
        });
      }
    }

    if (event.type === "subscription.renewed") {
      const resolvedUserId = await resolveUser();

      if (resolvedUserId) {
        const purchasedPlan = await resolvePlan(resolvedUserId);
        const periodEnd = data.next_billing_date
          ? new Date(data.next_billing_date)
          : getFallbackPeriodEnd(purchasedPlan);

        await User.findByIdAndUpdate(resolvedUserId, {
          "subscription.status": "active",
          "subscription.currentPeriodEnd": periodEnd,
        });

        console.log(
          `Subscription renewed for user: ${resolvedUserId}, new end: ${periodEnd}`,
        );
      }
    }

    if (event.type === "subscription.cancelled") {
      const resolvedUserId = await resolveUser();
      if (resolvedUserId) {
        await User.findByIdAndUpdate(resolvedUserId, {
          "subscription.status": "cancelled",
        });
        console.log(
          `Subscription cancelled (access continues till period end) for user: ${resolvedUserId}`,
        );
      }
    }

    if (
      event.type === "subscription.expired" ||
      event.type === "subscription.failed"
    ) {
      const resolvedUserId = await resolveUser();
      if (resolvedUserId) {
        await User.findByIdAndUpdate(resolvedUserId, {
          "subscription.status": "expired",
        });
        console.log(`Subscription ${event.type} for user: ${resolvedUserId}`);
      }
    }

    res.status(200).send("Secure Webhook processed successfully");
  } catch (err) {
    console.error("Webhook Security Alert:", err.message);
    console.error(err);
    res.status(400).send("Webhook signature verification failed");
  }
});

export default router;
