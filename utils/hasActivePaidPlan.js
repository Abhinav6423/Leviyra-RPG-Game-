export const hasActivePaidPlan = (subscription) => {
  if (!subscription) return false;
  if (!["weekly", "monthly"].includes(subscription.plan)) return false;

  // Allow both "active" and "cancelled" — cancelled just means
  // auto-renew is off, but access continues till currentPeriodEnd
  if (!["active", "cancelled"].includes(subscription.status)) return false;

  if (
    !subscription.currentPeriodEnd ||
    new Date(subscription.currentPeriodEnd) < new Date()
  ) {
    return false;
  }

  return true;
};
