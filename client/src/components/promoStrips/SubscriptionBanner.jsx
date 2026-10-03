import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Zap, X } from "lucide-react";
import { useSubscriptionStatus } from "./../../hooks/userSubscriptionStatus.js";

const LOW_PACK_THRESHOLD = 50;
const FREE_LOW_THRESHOLD = 10;
const EXPIRY_WINDOW_DAYS = 2;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Local calendar day ka start (00:00) - time part hata deta hai
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
};

// Calendar days left (Navbar / Profile jaisa hi). Oct 2 -> Nov 1 = 30
const getDaysLeft = (end) =>
  Math.max(
    0,
    Math.round((startOfDay(end) - startOfDay(Date.now())) / MS_PER_DAY),
  );

const TONES = {
  amber: {
    ring: "border-amber-400/25",
    icon: "text-amber-400 bg-amber-400/10",
    cta: "bg-amber-400 text-black hover:bg-amber-300",
  },
  red: {
    ring: "border-red-500/30",
    icon: "text-red-400 bg-red-500/10",
    cta: "bg-red-500 text-white hover:bg-red-400",
  },
  cyan: {
    ring: "border-[#00E5FF]/25",
    icon: "text-[#00E5FF] bg-[#00E5FF]/10",
    cta: "bg-[#00E5FF] text-black hover:bg-[#66FFFF]",
  },
  green: {
    ring: "border-[#00DC82]/25",
    icon: "text-[#00DC82] bg-[#00DC82]/10",
    cta: "bg-[#00DC82] text-black hover:brightness-110",
  },
};

const BannerPill = ({ tone, Icon, children, ctaLabel, onDismiss }) => {
  const t = TONES[tone];
  return (
    <div
      role="status"
      className="fixed left-1/2 -translate-x-1/2 z-50 top-[4.75rem] sm:top-[5.25rem] w-[calc(100%-2rem)] sm:w-auto sm:max-w-lg"
    >
      <div
        className={`flex items-center gap-3 pl-2.5 pr-2 py-2 rounded-full border ${t.ring} bg-zinc-950/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)]`}
      >
        <span
          className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-full ${t.icon}`}
        >
          <Icon size={14} strokeWidth={2.25} />
        </span>

        <p className="min-w-0 flex-1 text-xs sm:text-[13px] font-medium text-zinc-300 leading-snug">
          {children}
        </p>

        <Link
          to="/subscription"
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-colors ${t.cta}`}
        >
          {ctaLabel}
        </Link>

        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 p-1.5 rounded-full text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

const readDismissed = (key) => {
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
};

const SubscriptionBanner = () => {
  const { status, loading, error } = useSubscriptionStatus();
  const [dismissedKeys, setDismissedKeys] = useState({});

  if (loading || !status || error) return null;

  const dismiss = (key) => {
    try {
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
    setDismissedKeys((p) => ({ ...p, [key]: true }));
  };
  const isDismissed = (key) => dismissedKeys[key] || readDismissed(key);

  const plan = status.plan;
  const isPack = plan === "pack";

  // Backend ke daysLeft ki jagah currentPeriodEnd se nikalo (Navbar jaisa number)
  const daysLeft = status.currentPeriodEnd
    ? getDaysLeft(status.currentPeriodEnd)
    : null;
  const hasDays = typeof daysLeft === "number";

  // ── 1. MONTHLY: last 2 days ──
  if (
    status.isPaidActive &&
    !isPack &&
    hasDays &&
    daysLeft <= EXPIRY_WINDOW_DAYS
  ) {
    const key = `sub-banner-expiry-${daysLeft}`;
    if (isDismissed(key)) return null;

    const isActive = status.status === "active";
    const when =
      daysLeft <= 0
        ? "today"
        : `in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`;

    return (
      <BannerPill
        tone={daysLeft <= 0 ? "red" : "amber"}
        Icon={Clock}
        ctaLabel={isActive ? "Manage" : "Renew"}
        onDismiss={() => dismiss(key)}
      >
        Monthly plan {isActive ? "renews" : "expires"}{" "}
        <span className="font-semibold text-white">{when}</span>
      </BannerPill>
    );
  }

  // ── 2. PACK: low messages ──
  const packLeft = status.usage?.packMessagesLeft;
  if (
    status.isPaidActive &&
    isPack &&
    typeof packLeft === "number" &&
    packLeft <= LOW_PACK_THRESHOLD
  ) {
    const key = "sub-banner-pack-low";
    if (isDismissed(key)) return null;

    return (
      <BannerPill
        tone="cyan"
        Icon={Zap}
        ctaLabel="Buy pack"
        onDismiss={() => dismiss(key)}
      >
        Only{" "}
        <span className="font-semibold text-white">{packLeft} messages</span>{" "}
        left in your pack
      </BannerPill>
    );
  }

  // ── 3. FREE: low total messages ──
  if (
    !status.isPaidActive &&
    status.usage &&
    status.usage.totalMessages >= status.usage.totalLimit - FREE_LOW_THRESHOLD
  ) {
    const key = "sub-banner-free-low";
    if (isDismissed(key)) return null;

    const remaining = Math.max(
      0,
      status.usage.totalLimit - status.usage.totalMessages,
    );

    return (
      <BannerPill
        tone="green"
        Icon={Zap}
        ctaLabel="Upgrade"
        onDismiss={() => dismiss(key)}
      >
        Only{" "}
        <span className="font-semibold text-white">
          {remaining} free messages
        </span>{" "}
        left
      </BannerPill>
    );
  }

  return null;
};

export default SubscriptionBanner;
