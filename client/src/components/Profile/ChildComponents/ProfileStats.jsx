import React, { useState } from "react";
import api from "../../../lib/axios.js";
import { useAuth } from "../../../context/Authcontext.jsx";

// One shared formatter for every date shown on this page.
// Pass withTime=true when you also need the hour/minute (e.g. a reset target).
const formatDate = (dateString, withTime = false) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: withTime ? undefined : "numeric",
    hour: withTime ? "numeric" : undefined,
    minute: withTime ? "2-digit" : undefined,
  });
};

const FREE_DAILY_LIMIT = 5;
const FREE_TOTAL_LIMIT = 50;
const WEEKLY_TOTAL_LIMIT = 1000;
const clampPct = (value, max) => Math.min(100, Math.round((value / max) * 100));

const UsageBar = ({ used, max, label }) => {
  const pct = clampPct(used, max);
  const atLimit = used >= max;

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-400 font-medium">{label}</span>
        <span
          className={`text-xs font-medium ${atLimit ? "text-red-400" : "text-zinc-300"}`}
        >
          {used} <span className="text-zinc-600">/ {max}</span>
        </span>
      </div>
      <div className="w-full h-1 rounded-full bg-zinc-800/50 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${atLimit ? "bg-red-500" : "bg-white"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const StatBox = ({ value, label }) => (
  <div className="relative overflow-hidden flex flex-col items-center justify-center p-5 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-sm">
    <span className="text-2xl font-medium text-zinc-100 capitalize">
      {value}
    </span>
    <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest mt-1.5">
      {label}
    </span>
  </div>
);

const SubscriptionCard = ({ subscription, usage }) => {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const isFree = !subscription || subscription.plan === "free";
  const isActive = subscription?.status === "active";
  const isCancelled = subscription?.status === "cancelled";
  const isWeekly = subscription?.plan === "weekly";

  const handleCancel = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/payments/cancel");
      await refreshUser();
      setShowConfirm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/payments/reactivate");
      await refreshUser();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to reactivate subscription",
      );
    } finally {
      setLoading(false);
    }
  };

  if (isFree) {
    const messagesToday = usage?.messagesToday ?? 0;
    const totalMessages = usage?.totalMessages ?? 0;
    // Backend only sets messagesResetAt once the daily limit is actually hit.
    // Until then there's no active block, so there's nothing to count down to.
    const isBlocked = Boolean(usage?.messagesResetAt);

    return (
      <div className="relative p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-sm flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-white">Free Tier</h3>
            <p className="text-sm text-zinc-400 mt-1">
              Upgrade to unlock unlimited interactions
            </p>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 bg-zinc-800/50 rounded-md">
            Free
          </span>
        </div>

        <div className="flex flex-col gap-5 pt-2">
          <UsageBar
            used={messagesToday}
            max={FREE_DAILY_LIMIT}
            label="Messages Today"
          />
          <UsageBar
            used={totalMessages}
            max={FREE_TOTAL_LIMIT}
            label="Total Messages"
          />
        </div>

        {isBlocked && (
          <p className="text-xs text-red-400/90 bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20">
            Daily limit reached. Resets on{" "}
            {formatDate(usage.messagesResetAt, true)}.
          </p>
        )}

        <div className="mt-2 pt-5 border-t border-white/5 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-zinc-500 font-medium">
            {isBlocked ? "Resumes at" : "Daily limit resets"}
          </span>
          <span className="text-sm font-medium text-zinc-300">
            {isBlocked
              ? formatDate(usage.messagesResetAt, true)
              : `after ${FREE_DAILY_LIMIT} messages`}
          </span>
        </div>
      </div>
    );
  }

  const renewDate = formatDate(subscription.currentPeriodEnd);
  const weeklyMessagesUsed = usage?.weeklyMessagesUsed ?? 0;

  const statusConfig = isActive
    ? { label: "Active", color: "text-zinc-300", dot: "bg-emerald-400" }
    : isCancelled
      ? { label: "Cancels soon", color: "text-zinc-400", dot: "bg-amber-400" }
      : { label: "Expired", color: "text-red-400", dot: "bg-red-500" };

  return (
    <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-zinc-900/80 to-zinc-900/40 border border-white/10 backdrop-blur-sm">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-medium text-white capitalize">
              {subscription.plan}
            </h3>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black bg-white rounded-sm shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              Pro
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} shadow-[0_0_8px_currentColor]`}
            />
            <span className={`text-sm ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 py-6 border-y border-white/5">
        <div>
          <p className="text-xs text-zinc-500 mb-1">
            {isActive ? "Next billing date" : "Ends on"}
          </p>
          <p className="text-sm font-medium text-zinc-200">{renewDate}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 mb-1">Billing cycle</p>
          <p className="text-sm font-medium text-zinc-200 capitalize">
            {subscription.plan} / Month
          </p>
        </div>
      </div>

      {isWeekly && (
        <div className="py-6 border-b border-white/5">
          <UsageBar
            used={weeklyMessagesUsed}
            max={WEEKLY_TOTAL_LIMIT}
            label="Messages This Cycle"
          />
          <p className="text-xs text-zinc-500 mt-3">
            No daily cap — limit resets on {renewDate}.
          </p>
        </div>
      )}

      <div className="mt-6">
        {error && <p className="text-xs text-red-400 mb-4">{error}</p>}

        {isActive && !showConfirm && (
          <button
            onClick={() => setShowConfirm(true)}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Cancel subscription
          </button>
        )}

        {isActive && showConfirm && (
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-zinc-950/50 border border-zinc-800">
            <span className="text-sm text-zinc-400">
              Keep access until {renewDate}.
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="text-xs font-medium px-4 py-2 rounded-lg text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition"
              >
                Nevermind
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="text-xs font-medium px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
              >
                {loading ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        )}

        {isCancelled && (
          <button
            onClick={handleReactivate}
            disabled={loading}
            className="text-sm font-medium px-5 py-2.5 rounded-lg bg-white text-black hover:bg-zinc-200 transition disabled:opacity-50 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            {loading ? "Reactivating..." : "Resume Subscription"}
          </button>
        )}
      </div>
    </div>
  );
};

const ProfileStats = ({
  charactersCount,
  subTier,
  isPro,
  subscription,
  usage,
}) => (
  <div className="flex flex-col gap-4 w-full max-w-4xl mx-auto mb-12 z-20">
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      <StatBox value={charactersCount || 0} label="Characters" />
      <StatBox value={subTier || "Free"} label="Plan" />
      <StatBox value={isPro ? "Active" : "Free"} label="Status" />
    </div>
    <SubscriptionCard subscription={subscription} usage={usage} />
  </div>
);

export default ProfileStats;
