import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Zap, Infinity as InfinityIcon } from "lucide-react";
import api from "../../lib/axios.js"; // adjust path if this file lives elsewhere

/* ============================================================
   SHARED USAGE STORE
   Navbar + MobileNav (+ anything else) share ONE fetch/poll loop.
   Chat page can call:  window.dispatchEvent(new Event("usage:refresh"))
============================================================ */
let store = { data: null, offset: 0 };
const listeners = new Set();
let timer = null;

export const refreshUsage = async () => {
  try {
    const res = await api.get("/usage");
    store = {
      data: res.data,
      offset: new Date(res.data.serverTime).getTime() - Date.now(),
    };
    listeners.forEach((fn) => fn(store));
  } catch (_) {
    /* keep last known data */
  }
};

const startPolling = () => {
  refreshUsage();
  timer = setInterval(() => {
    if (!document.hidden) refreshUsage();
  }, 15_000);
  window.addEventListener("usage:refresh", refreshUsage);
  window.addEventListener("focus", refreshUsage);
};

const stopPolling = () => {
  clearInterval(timer);
  window.removeEventListener("usage:refresh", refreshUsage);
  window.removeEventListener("focus", refreshUsage);
};

const useUsage = () => {
  const [state, setState] = useState(store);
  useEffect(() => {
    listeners.add(setState);
    if (listeners.size === 1) startPolling();
    else setState(store);
    return () => {
      listeners.delete(setState);
      if (!listeners.size) stopPolling();
    };
  }, []);
  return state;
};

const useTick = (active) => {
  const [, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setN((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
};

/* ============================================================
   TONES + METER (derived numbers)
============================================================ */
const TONES = {
  green: { text: "text-emerald-400", bg: "bg-emerald-400", hex: "#34d399" },
  amber: { text: "text-amber-400", bg: "bg-amber-400", hex: "#fbbf24" },
  red: { text: "text-red-400", bg: "bg-red-500", hex: "#f87171" },
  gold: { text: "text-[#FFC837]", bg: "bg-[#FFC837]", hex: "#FFC837" },
};

export const toneFor = (left, max) => {
  const ratio = max > 0 ? left / max : 0;
  if (ratio <= 0) return TONES.red;
  if (ratio <= 0.3) return TONES.amber;
  return TONES.green;
};

export const useUsageMeter = () => {
  const { data, offset } = useUsage();
  if (!data) return null;

  const { usage = {}, limits = {}, plan = "free" } = data;
  const now = Date.now() + offset;

  if (plan === "monthly") {
    return {
      kind: "unlimited",
      plan,
      tone: TONES.gold,
      pct: 100,
      left: Infinity,
      offset,
    };
  }

  // PACK: one-time 1000 messages, no time limit, no reset
  if (plan === "pack") {
    const max = limits.pack || 1000;
    const left = Math.max(0, usage.packMessagesLeft || 0);
    const used = Math.max(0, max - left);
    return {
      kind: "pack",
      plan,
      used,
      max,
      left,
      pct: Math.min(100, (left / max) * 100),
      tone: toneFor(left, max),
      offset,
    };
  }

  // FREE: daily window + lifetime cap, whichever runs out first
  const max = limits.daily || 20;
  const totalMax = limits.total || 200;
  const resetAt = usage.messagesResetAt
    ? new Date(usage.messagesResetAt).getTime()
    : null;
  const windowActive = Boolean(resetAt) && now < resetAt;
  const used = windowActive ? usage.messagesToday || 0 : 0;
  const total = usage.totalMessages || 0;
  const left = Math.max(0, Math.min(max - used, totalMax - total));

  return {
    kind: "free",
    plan: "free",
    used,
    max,
    total,
    totalMax,
    left,
    pct: Math.min(100, (left / max) * 100),
    tone: toneFor(left, max),
    resetAt: windowActive ? resetAt : null,
    windowActive,
    offset,
  };
};

/* ============================================================
   SMALL UI PIECES
============================================================ */
const Ring = ({ size, pct, hex, stroke = 2.5, pulse, children }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div
      className={`relative shrink-0 ${pulse ? "animate-pulse" : ""}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={hex}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.max(0, Math.min(100, pct)) / 100)}
          style={{ transition: "stroke-dashoffset .6s ease, stroke .3s" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

const MiniBar = ({ label, used, max }) => {
  const shown = Math.min(used, max);
  const tone = toneFor(max - shown, max);
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1.5">
        <span className="text-zinc-400 font-medium">{label}</span>
        <span className="text-zinc-200 font-semibold tabular-nums">
          {shown} <span className="text-zinc-500">/ {max}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${tone.bg}`}
          style={{ width: `${max > 0 ? (shown / max) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
};

const fmtRemaining = (ms) => {
  const t = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
};

const UsagePanel = ({ m, onClose, className = "" }) => {
  useTick(m.kind === "free");
  const remainingMs = m.resetAt ? m.resetAt - (Date.now() + m.offset) : null;

  return (
    <div
      className={`z-50 rounded-2xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-2xl shadow-2xl p-4 flex flex-col gap-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={14} className={m.tone.text} fill="currentColor" />
          <span className="text-xs font-semibold text-white tracking-wide">
            Message Energy
          </span>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 text-zinc-300">
          {m.plan}
        </span>
      </div>

      {m.kind === "unlimited" && (
        <p className="text-sm text-zinc-300">
          Unlimited messages. Chat as much as you want.
        </p>
      )}

      {m.kind === "pack" && (
        <>
          <MiniBar label="Pack used" used={m.used} max={m.max} />
          <div className="flex justify-between text-[11px]">
            <span className="text-zinc-400">Messages left</span>
            <span className="text-zinc-200 font-medium tabular-nums">
              {m.left}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500">
            No time limit and no reset. When the pack runs out you go back to
            the free plan.
          </p>
          {m.left <= 50 && (
            <Link
              to="/subscription"
              onClick={onClose}
              className="text-center text-xs font-semibold py-2 rounded-lg bg-white text-black hover:bg-zinc-200 transition"
            >
              Buy another pack
            </Link>
          )}
        </>
      )}

      {m.kind === "free" && (
        <>
          <MiniBar label="Today" used={m.used} max={m.max} />
          <MiniBar label="Total" used={m.total} max={m.totalMax} />
          <div className="flex justify-between text-[11px] pt-3 border-t border-white/5">
            <span className="text-zinc-400">
              {m.windowActive ? "Refills in" : "Daily refill"}
            </span>
            <span className="text-zinc-200 font-medium tabular-nums">
              {m.windowActive
                ? fmtRemaining(remainingMs)
                : "24h after first message"}
            </span>
          </div>
          {m.left === 0 && (
            <p className="text-[11px] text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              Out of messages. Wait for the refill or get a pack.
            </p>
          )}
          <Link
            to="/subscription"
            onClick={onClose}
            className="text-center text-xs font-semibold py-2 rounded-lg bg-white text-black hover:bg-zinc-200 transition"
          >
            Get more messages
          </Link>
        </>
      )}
    </div>
  );
};

/* ============================================================
   MAIN CHIP
   compact  -> just a ring with the number (mobile top bar)
   default  -> ring + "4/20" (desktop)
============================================================ */
const UsageChip = ({ compact = false }) => {
  const m = useUsageMeter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDown = (e) =>
      ref.current && !ref.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!m) return <div className={compact ? "w-10 h-10" : "w-24 h-10"} />;

  const unlimited = m.kind === "unlimited";
  const empty = !unlimited && m.left === 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Message usage"
        className={`flex items-center gap-2.5 rounded-full border bg-zinc-900/40 backdrop-blur-xl transition-all duration-300 focus:outline-none hover:bg-zinc-800/60 ${
          compact ? "w-10 h-10 justify-center" : "h-10 pl-1.5 pr-3.5"
        } ${open ? "border-white/20" : empty ? "border-red-500/30" : "border-white/5 hover:border-white/15"}`}
      >
        <Ring
          size={compact ? 34 : 30}
          pct={m.pct}
          hex={m.tone.hex}
          pulse={empty}
        >
          {compact ? (
            unlimited ? (
              <InfinityIcon size={14} className={m.tone.text} />
            ) : (
              <span
                className={`text-[11px] font-bold tabular-nums ${m.tone.text}`}
              >
                {m.left}
              </span>
            )
          ) : (
            <Zap size={12} className={m.tone.text} fill="currentColor" />
          )}
        </Ring>

        {!compact && (
          <div className="flex flex-col leading-none">
            {unlimited ? (
              <span className={`text-sm font-bold ${m.tone.text}`}>
                Unlimited
              </span>
            ) : (
              <>
                <span className="text-sm font-bold text-white tabular-nums">
                  {m.left}
                  <span className="text-zinc-500 font-medium">/{m.max}</span>
                </span>
                <span className="hidden lg:block text-[9px] uppercase tracking-widest text-zinc-500 mt-1">
                  msgs left
                </span>
              </>
            )}
          </div>
        )}
      </button>

      {open && (
        <UsagePanel
          m={m}
          onClose={() => setOpen(false)}
          className="fixed left-3 right-3 top-[4.25rem] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-72"
        />
      )}
    </div>
  );
};

export default UsageChip;