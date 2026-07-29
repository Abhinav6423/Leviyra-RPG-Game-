import { useMemo } from "react";

export const useSubscriptionTier = (subscription) => {
  // 1. Calculation useMemo ke bahar rakho.
  // Isse har baar component render hone par ekdum fresh Date() milega.
  const isPro =
    (subscription?.status === "active" ||
      subscription?.status === "cancelled") &&
    new Date(subscription?.currentPeriodEnd) > new Date(); // 👈 Your Security Check
  const plan = subscription?.plan;
  const subTier =
    plan === "monthly" ? "monthly" : plan === "weekly" ? "weekly" : "free"; // 2. Sirf final object ko useMemo mein wrap karo.
  // Isse Referential Equality bani rahegi aur child components faltu re-render nahi honge.

  return useMemo(() => {
    return { isPro, subTier };
  }, [isPro, subTier]);
};
