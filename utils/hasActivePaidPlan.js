export const hasActivePaidPlan = (subscription, usage) => {
  if (!subscription || !subscription.plan || subscription.plan === "free")
    return false;

  // PACK: active + messages left
  if (subscription.plan === "pack") {
    return (
      subscription.status === "active" && (usage?.packMessagesLeft || 0) > 0
    );
  }

  // MONTHLY: one-time payment, valid until currentPeriodEnd (no grace period).
  // "cancelled" is kept only for old auto-pay users who already cancelled:
  // they keep access until their period ends.
  if (subscription.plan === "monthly") {
    const okStatus = ["active", "cancelled"].includes(subscription.status);
    const end = subscription.currentPeriodEnd
      ? new Date(subscription.currentPeriodEnd).getTime()
      : 0;
    return okStatus && end > Date.now();
  }

  return false;
};
