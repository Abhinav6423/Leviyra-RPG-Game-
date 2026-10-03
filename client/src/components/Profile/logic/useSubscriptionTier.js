import { useMemo } from "react";

const GRACE_MS = 24 * 60 * 60 * 1000; // backend jaisa hi

export const useSubscriptionTier = (subscription, usage) => {
  const plan = subscription?.plan;
  const status = subscription?.status;

  // MONTHLY: active (auto-renew, grace ke saath) ya cancelled (grace nahi)
  const isMonthlyPro =
    plan === "monthly" &&
    (status === "active" || status === "cancelled") &&
    Boolean(subscription?.currentPeriodEnd) &&
    new Date(subscription.currentPeriodEnd).getTime() +
      (status === "active" ? GRACE_MS : 0) >
      Date.now();

  // PACK: active + messages bache hain (koi time limit nahi)
  const isPackPro =
    plan === "pack" &&
    status === "active" &&
    (usage?.packMessagesLeft ?? 0) > 0;

  const isPro = isMonthlyPro || isPackPro;
  const subTier = isMonthlyPro ? "monthly" : isPackPro ? "pack" : "free";

  return useMemo(() => ({ isPro, subTier }), [isPro, subTier]);
};
