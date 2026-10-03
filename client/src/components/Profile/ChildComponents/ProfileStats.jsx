import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../../../lib/axios.js";

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

const clampPct = (value, max) =>
  max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

const formatRemaining = (ms) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
};

// Start of local calendar day (00:00)
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// Calendar days left until dateString (user's local timezone).
// nowMs lets us pass server-synced time.
const getDaysLeft = (dateString, nowMs = Date.now()) => {
  if (!dateString) return null;
  const diff = startOfDay(dateString).getTime() - startOfDay(nowMs).getTime();
  return Math.max(0, Math.round(diff / 86_400_000));
};

const cardBase =
  "rounded-2xl border border-white/[0.06] bg-gradient-to-b from-zinc-800/50 to-zinc-900/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]";

/* ============================================================
   LIVE USAGE HOOK
============================================================ */
const useLiveUsage = () => {
  const [data, setData] = useState(null);
  const offset = useRef(0); // serverTime - clientTime

  const refresh = useCallback(async () => {
    try {
      const res = await api.get("/usage");
      offset.current = new Date(res.data.serverTime).getTime() - Date.now();
      setData(res.data);
    } catch (_) {
      /* keep showing the last known data */
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(() => {
      if (!document.hidden) refresh();
    }, 15_000);
    window.addEventListener("usage:refresh", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(id);
      window.removeEventListener("usage:refresh", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [refresh]);

  return { data, refresh, offset };
};

// Ticks every second while a reset time exists; calls onExpire once when it hits 0.
const useCountdown = (targetIso, offset, onExpire) => {
  const [remaining, setRemaining] = useState(null);
  const firedFor = useRef(null);

  useEffect(() => {
    if (!targetIso) {
      setRemaining(null);
      firedFor.current = null;
      return;
    }
    const target = new Date(targetIso).getTime();

    const tick = () => {
      const left = target - (Date.now() + offset.current);
      setRemaining(Math.max(0, left));
      if (left <= 0 && firedFor.current !== targetIso) {
        firedFor.current = targetIso;
        onExpire();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso, offset, onExpire]);

  return remaining;
};

const UsageBar = ({ used, max, label }) => {
  const shown = Math.min(used, max); // never show "6 / 5"
  const pct = clampPct(shown, max);
  const atLimit = shown >= max;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-400 font-medium">{label}</span>
        <span
          className={`text-xs font-medium ${atLimit ? "text-red-400" : "text-zinc-200"}`}
        >
          {shown} <span className="text-zinc-500">/ {max}</span>
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${atLimit ? "bg-red-500" : "bg-white"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const StatBox = ({ value, label }) => (
  <div
    className={`${cardBase} flex flex-col items-center justify-center p-5 transition-all duration-200 hover:border-white/20 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_24px_-10px_rgba(255,255,255,0.35)]`}
  >
    <span className="text-2xl font-semibold text-white capitalize">
      {value}
    </span>
    <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest mt-1.5">
      {label}
    </span>
  </div>
);

const SubscriptionCard = ({ subscription, usage: initialUsage }) => {
  // Hooks must run before any early return
  const { data, refresh, offset } = useLiveUsage();
  const usage = data?.usage ?? initialUsage ?? {};
  const limits = data?.limits ?? { daily: 20, total: 200, pack: 1000 }; // fallback until first fetch
  const remaining = useCountdown(usage.messagesResetAt, offset, refresh);

  // Backend says free (pack finished / monthly expired) -> show free UI
  // even if local subscription data is still stale.
  const backendSaysFree = data?.plan === "free";
  const isFree =
    !subscription || subscription.plan === "free" || backendSaysFree;
  const isActive = subscription?.status === "active";
  const isPack = subscription?.plan === "pack";

  /* ---------------- FREE ---------------- */
  if (isFree) {
    const messagesToday = usage.messagesToday ?? 0;
    const totalMessages = usage.totalMessages ?? 0;

    const hasWindow =
      Boolean(usage.messagesResetAt) && remaining !== null && remaining > 0;
    const isBlocked = hasWindow && messagesToday >= limits.daily;

    return (
      <div className={`${cardBase} p-6 sm:p-8 flex flex-col gap-6`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-white">Free Tier</h3>
            <p className="text-sm text-zinc-400 mt-1">
              Get a message pack or go monthly for more interactions
            </p>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-300 bg-zinc-800 rounded-md">
            Free
          </span>
        </div>

        <div className="flex flex-col gap-5">
          <UsageBar
            used={messagesToday}
            max={limits.daily}
            label="Messages Today"
          />
          <UsageBar
            used={totalMessages}
            max={limits.total}
            label="Total Messages"
          />
        </div>

        {isBlocked && (
          <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg border border-red-400/20">
            Daily limit reached. Resets on{" "}
            {formatDate(usage.messagesResetAt, true)}.
          </p>
        )}

        <div className="pt-5 border-t border-white/5 flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs text-zinc-400 font-medium">
            {hasWindow ? "Resets in" : "Daily limit resets"}
          </span>
          <span className="text-sm font-medium text-zinc-200 tabular-nums">
            {hasWindow
              ? formatRemaining(remaining)
              : "24h after your first message"}
          </span>
        </div>

        {hasWindow && (
          <p className="text-xs text-zinc-500 -mt-3">
            Resets on {formatDate(usage.messagesResetAt, true)}
          </p>
        )}

        <Link
          to="/subscription"
          className="text-center text-sm font-medium px-5 py-2.5 rounded-lg bg-white text-black hover:bg-zinc-200 transition"
        >
          View plans
        </Link>
      </div>
    );
  }

  /* ---------------- PACK (one-time, 1000 messages) ---------------- */
  if (isPack) {
    const packLeft = usage.packMessagesLeft ?? 0;
    const packTotal = limits.pack ?? 1000;
    const packUsed = Math.max(0, packTotal - packLeft);

    return (
      <div className={`${cardBase} p-6 sm:p-8`}>
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-white">Message Pack</h3>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black bg-white rounded-sm">
              Pro
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-sm text-zinc-200">Active</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 py-6 border-y border-white/5">
          <div>
            <p className="text-xs text-zinc-400 mb-1">Messages left</p>
            <p className="text-sm font-medium text-zinc-100 tabular-nums">
              {packLeft}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-400 mb-1">Type</p>
            <p className="text-sm font-medium text-zinc-100">
              One-time, no expiry
            </p>
          </div>
        </div>

        <div className="py-6 border-b border-white/5">
          <UsageBar used={packUsed} max={packTotal} label="Messages Used" />
          <p className="text-xs text-zinc-400 mt-3">
            No daily cap and no time limit. When the messages run out, you go
            back to the free plan.
          </p>
        </div>

        <div className="mt-6">
          <Link
            to="/subscription"
            className="inline-block text-sm font-medium px-5 py-2.5 rounded-lg bg-white text-black hover:bg-zinc-200 transition"
          >
            Buy another pack
          </Link>
        </div>
      </div>
    );
  }

  /* ---------------- MONTHLY (one-time, 30 days, no auto-renew) ---------------- */
  const endDate = formatDate(subscription.currentPeriodEnd);

  // Days left (uses server clock offset so a wrong device clock doesn't matter)
  const daysLeft = getDaysLeft(
    subscription.currentPeriodEnd,
    Date.now() + offset.current,
  );
  const daysLabel =
    daysLeft === null
      ? null
      : daysLeft === 0
        ? "Ends today"
        : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
  const daysLow = daysLeft !== null && daysLeft <= 3;

  const statusConfig = isActive
    ? { label: "Active", color: "text-zinc-200", dot: "bg-emerald-400" }
    : { label: "Expired", color: "text-red-400", dot: "bg-red-500" };

  return (
    <div className={`${cardBase} p-6 sm:p-8`}>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold text-white capitalize">
            {subscription.plan}
          </h3>
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-black bg-white rounded-sm">
            Pro
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
          <span className={`text-sm ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 py-6 border-y border-white/5">
        <div>
          <p className="text-xs text-zinc-400 mb-1">Expires on</p>
          <p className="text-sm font-medium text-zinc-100">{endDate}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-400 mb-1">Type</p>
          <p className="text-sm font-medium text-zinc-100">One-time, 30 days</p>
        </div>
      </div>

      {daysLeft !== null && (
        <div className="py-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-400 font-medium">
              Access ends in
            </span>
            <span
              className={`text-xs font-medium ${daysLow ? "text-amber-400" : "text-zinc-200"}`}
            >
              {daysLabel}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${daysLow ? "bg-amber-400" : "bg-white"}`}
              style={{ width: `${clampPct(daysLeft, 30)}%` }}
            />
          </div>
          <p className="text-xs text-zinc-400 mt-3">
            This plan does not auto-renew. After it ends you go back to the free
            plan.
          </p>
        </div>
      )}

      <div className="mt-6">
        <Link
          to="/subscription"
          className={`inline-block text-sm font-medium px-5 py-2.5 rounded-lg transition ${
            daysLow
              ? "bg-white text-black hover:bg-zinc-200"
              : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
          }`}
        >
          Extend by 30 days
        </Link>
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
