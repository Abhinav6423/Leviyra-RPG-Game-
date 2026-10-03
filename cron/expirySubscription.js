import cron from "node-cron";
import User from "../modals/User.modal.js";

export const startSubscriptionExpiryCron = () => {
  cron.schedule("5 * * * *", async () => {
    try {
      const now = new Date();

      // 1) MONTHLY: period ended -> back to free (no auto-renew, so no grace needed)
      const monthly = await User.updateMany(
        {
          "subscription.plan": "monthly",
          "subscription.currentPeriodEnd": { $lt: now },
        },
        {
          $set: {
            "subscription.status": "expired",
            "subscription.plan": "free",
          },
          $unset: { "subscription.currentPeriodEnd": "" },
        },
      );

      // 2) PACK safety net: messages hit 0 but plan is still pack -> free
      const pack = await User.updateMany(
        {
          "subscription.plan": "pack",
          "usage.packMessagesLeft": { $lte: 0 },
        },
        {
          $set: {
            "subscription.status": "expired",
            "subscription.plan": "free",
          },
        },
      );

      if (monthly.modifiedCount > 0 || pack.modifiedCount > 0) {
        console.log(
          `⏰ Cron: ${monthly.modifiedCount} monthly + ${pack.modifiedCount} pack downgraded to free.`,
        );
      }
    } catch (err) {
      console.error("Cron expiry job failed:", err.message);
    }
  });
};
