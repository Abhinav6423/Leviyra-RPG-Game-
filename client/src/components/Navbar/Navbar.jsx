import React, { useState, useEffect, useRef } from "react";
import {
  Grid,
  Plus,
  Search,
  Sparkles,
  Crown,
  Menu,
  MessageSquare,
} from "lucide-react";
import CategoryPopup from "../Pop-ups/CategoryPopup.jsx";
import UsageChip, { useUsageMeter } from "./UsageChip.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/Authcontext.jsx";

const PRO_THEMES = {
  monthly: {
    badgeBg:
      "bg-[#FFC837]/10 border-[#FFC837]/20 hover:bg-[#FFC837]/20 hover:border-[#FFC837]/40",
    badgeText: "text-[#FFC837] group-hover:text-[#FFD700]",
    crown: "text-[#FFC837] fill-[#FFC837]",
    pillBorder:
      "border-[#FFC837]/30 hover:border-[#FFC837]/60 hover:bg-[#FFC837]/5 shadow-[0_0_15px_rgba(255,200,55,0.08)]",
    avatarBorder:
      "border border-[#FFC837]/80 shadow-[0_0_10px_rgba(255,200,55,0.3)]",
    pillLabel: "text-[#FFC837]",
  },
  pack: {
    badgeBg:
      "bg-[#00E5FF]/10 border-[#00E5FF]/20 hover:bg-[#00E5FF]/20 hover:border-[#00E5FF]/40",
    badgeText: "text-[#00E5FF] group-hover:text-[#66FFFF]",
    crown: "text-[#00E5FF] fill-[#00E5FF]",
    pillBorder:
      "border-[#00E5FF]/30 hover:border-[#00E5FF]/60 hover:bg-[#00E5FF]/5 shadow-[0_0_15px_rgba(0,229,255,0.08)]",
    avatarBorder:
      "border border-[#00E5FF]/80 shadow-[0_0_10px_rgba(0,229,255,0.3)]",
    pillLabel: "text-[#00E5FF]",
  },
};

const isMac =
  typeof navigator !== "undefined" && /Mac/i.test(navigator.platform);

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Local calendar day ka start (00:00) - time part hata deta hai
const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// Calendar days left (local timezone). Oct 2 -> Nov 1 = 30, Nov 1 ko = 0.
const getDaysLeft = (endDate, nowMs = Date.now()) =>
  Math.max(
    0,
    Math.round(
      (startOfDay(endDate).getTime() - startOfDay(nowMs).getTime()) /
        MS_PER_DAY,
    ),
  );

const Navbar = () => {
  const [categoryPopupOpen, setCategoryPopupOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const desktopSearchInputRef = useRef(null);

  const navigate = useNavigate();
  const { firebaseUser, user: dbUser, loading } = useAuth() || {};

  // LIVE usage (backend /usage). Hook early return se pehle hi call hona chahiye.
  const meter = useUsageMeter();

  // Meter aaya hai to backend ka plan final hai (pack khatam -> "free" turant).
  // Meter abhi load nahi hua to dbUser par fallback.
  const isPro = meter
    ? meter.plan !== "free"
    : (dbUser?.hasValidPremium ?? dbUser?.subscription?.status === "active");

  const userPlan = meter
    ? meter.plan === "monthly"
      ? "monthly"
      : "pack"
    : dbUser?.subscription?.plan === "monthly"
      ? "monthly"
      : "pack";

  const theme = PRO_THEMES[userPlan];

  // Live pack count (fallback: dbUser)
  const packLeft =
    meter?.kind === "pack"
      ? meter.left
      : (dbUser?.usage?.packMessagesLeft ?? 0);

  const avatar =
    dbUser?.profilePicture ||
    firebaseUser?.photoURL ||
    "https://i.pravatar.cc/40";
  const displayName = firebaseUser?.displayName || dbUser?.username || "Reader";

  // Days left in the current paid period — only for monthly Pro users.
  const periodEnd = dbUser?.subscription?.currentPeriodEnd;
  const periodEndDate = periodEnd ? new Date(periodEnd) : null;
  const hasValidEnd = periodEndDate && !Number.isNaN(periodEndDate.getTime());
  const daysLeft =
    isPro && userPlan === "monthly" && hasValidEnd
      ? getDaysLeft(periodEndDate)
      : null;
  const isExpiringSoon = daysLeft !== null && daysLeft <= 3;
  const daysLeftShort =
    daysLeft === null
      ? null
      : daysLeft === 0
        ? "ends today"
        : `${daysLeft}d left`;
  const daysLeftTitle =
    daysLeft === null
      ? undefined
      : `Monthly Pro · ${daysLeft} ${daysLeft === 1 ? "day" : "days"} left · ${
          dbUser?.subscription?.status === "active" ? "renews" : "ends"
        } ${periodEndDate.toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}`;

  // Pack users: tooltip with messages left
  const isPackPro = isPro && userPlan === "pack";
  const packTitle = isPackPro
    ? `Message Pack · ${packLeft} messages left`
    : undefined;

  // Close dropdown on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Lock body scroll while popup is open
  useEffect(() => {
    document.body.style.overflow = categoryPopupOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [categoryPopupOpen]);

  // Esc closes everything, Cmd/Ctrl+K focuses search
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setCategoryPopupOpen(false);
        setIsSearchOpen(false);
        setIsMenuOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const desktop = desktopSearchInputRef.current;
        if (desktop && desktop.offsetParent !== null) desktop.focus();
        else setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  const runSearch = (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/search-results/${encodeURIComponent(trimmed)}`);
    setSearchQuery("");
    setIsSearchOpen(false);
    searchInputRef.current?.blur();
    desktopSearchInputRef.current?.blur();
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") runSearch(searchQuery);
    if (e.key === "Escape") {
      setIsSearchOpen(false);
      e.currentTarget.blur();
    }
  };

  if (loading)
    return <nav className="fixed top-0 left-0 w-full h-16 sm:h-20" />;

  const menuLink =
    "flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors";

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-40 h-16 sm:h-[4.5rem] bg-transparent sm:bg-[#050505]/90 sm:backdrop-blur-2xl sm:border-b sm:border-white/5 transition-all duration-300 font-sans">
        <div className="relative z-10 w-full px-4 md:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* ── LOGO ── */}
          <div className="flex-1 flex justify-start">
            <Link
              to="/home"
              className="focus:outline-none block group shrink-0"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-b from-zinc-800/30 to-zinc-900/30 border border-white/5 group-hover:border-zinc-500/50 shadow-sm transition-all duration-500 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="text-zinc-100 text-xl font-bold tracking-tight group-hover:text-white transition-colors">
                  L
                </span>
              </div>
            </Link>
          </div>

          {/* ── MOBILE: USAGE, PRO, SEARCH ── */}
          <div className="flex md:hidden flex-1 justify-end items-center gap-2">
            {/* hidden while search is expanded so it has room */}
            <div
              className={`flex items-center gap-2 transition-all duration-300 ease-out overflow-visible ${isSearchOpen ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100"}`}
            >
              <UsageChip compact />
              {!isPro && (
                <Link to="/subscription" className="focus:outline-none group">
                  <div
                    className={`flex items-center gap-1.5 h-10 px-3 rounded-full border transition-colors ${theme.badgeBg}`}
                  >
                    <Sparkles size={13} className={theme.badgeText} />
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-widest ${theme.badgeText}`}
                    >
                      Pro
                    </span>
                  </div>
                </Link>
              )}
              {/* Monthly Pro: days left, visible on mobile too */}
              {daysLeftShort && (
                <Link
                  to="/subscription"
                  title={daysLeftTitle}
                  className="focus:outline-none"
                >
                  <div
                    className={`flex items-center gap-1.5 h-10 px-3 rounded-full border transition-colors ${
                      isExpiringSoon
                        ? "bg-red-500/10 border-red-500/30"
                        : theme.badgeBg
                    }`}
                  >
                    <Crown
                      size={12}
                      strokeWidth={2.5}
                      className={isExpiringSoon ? "text-red-400" : theme.crown}
                    />
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap ${
                        isExpiringSoon ? "text-red-400" : theme.badgeText
                      }`}
                    >
                      {daysLeftShort}
                    </span>
                  </div>
                </Link>
              )}
              {/* Pack Pro: live messages left, visible on mobile too */}
              {isPackPro && (
                <Link
                  to="/subscription"
                  title={packTitle}
                  className="focus:outline-none"
                >
                  <div
                    className={`flex items-center gap-1.5 h-10 px-3 rounded-full border transition-colors ${theme.badgeBg}`}
                  >
                    <Crown
                      size={12}
                      strokeWidth={2.5}
                      className={theme.crown}
                    />
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap tabular-nums ${theme.badgeText}`}
                    >
                      {packLeft} left
                    </span>
                  </div>
                </Link>
              )}
            </div>

            <div
              className={`flex items-center bg-zinc-900/50 border backdrop-blur-xl transition-all duration-300 ease-out overflow-hidden shadow-sm shrink-0 ${
                isSearchOpen
                  ? "w-full max-w-[260px] px-4 py-2.5 rounded-full border-zinc-500/50 shadow-lg"
                  : "w-10 h-10 rounded-full border-white/5 justify-center cursor-pointer hover:bg-zinc-800/60"
              }`}
              onClick={() => !isSearchOpen && setIsSearchOpen(true)}
            >
              <Search
                className={`shrink-0 transition-colors ${isSearchOpen ? "w-4 h-4 text-zinc-300 mr-2.5" : "w-[18px] h-[18px] text-zinc-400"}`}
                strokeWidth={isSearchOpen ? 2.5 : 2}
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onBlur={() => setIsSearchOpen(false)}
                placeholder="Search..."
                className={`bg-transparent text-sm font-medium text-zinc-100 placeholder:text-zinc-500 outline-none transition-all duration-300 ${isSearchOpen ? "w-full opacity-100" : "w-0 opacity-0 px-0"}`}
              />
            </div>
          </div>

          {/* ── DESKTOP: SEARCH ── */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-full max-w-[380px] lg:max-w-[520px] z-20">
            <div className="group relative flex items-center bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-full shadow-sm overflow-hidden transition-all duration-300 w-full hover:border-zinc-700/60 focus-within:border-zinc-500/80 focus-within:bg-[#0a0a0a] focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent group-focus-within:via-white/15" />
              <div className="flex items-center w-full px-5 py-3 gap-3.5">
                <Search
                  className="shrink-0 w-[18px] h-[18px] text-zinc-500 group-focus-within:text-zinc-300 transition-colors"
                  strokeWidth={2}
                />
                <input
                  ref={desktopSearchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search by character name, tags..."
                  className="bg-transparent text-sm lg:text-[15px] font-medium text-zinc-100 placeholder:text-zinc-500 outline-none w-full"
                />
                <div className="hidden lg:flex items-center justify-center px-2 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-zinc-500 font-medium tracking-widest shrink-0">
                  {isMac ? "⌘K" : "Ctrl K"}
                </div>
              </div>
            </div>
          </div>

          {/* ── DESKTOP: RIGHT ── */}
          <div className="hidden md:flex flex-1 justify-end items-center gap-2 lg:gap-3 z-30">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsMenuOpen((o) => !o)}
                aria-label="Menu"
                className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 focus:outline-none ${isMenuOpen ? "bg-zinc-800/60 border-zinc-500/50 text-white" : "border-transparent hover:border-white/5 hover:bg-zinc-800/40 text-zinc-400 hover:text-white"}`}
              >
                <Menu size={20} strokeWidth={1.5} />
              </button>

              <div
                className={`absolute right-0 top-[120%] w-52 bg-[#0a0a0a] border border-zinc-800/80 rounded-xl shadow-2xl transition-all duration-300 overflow-hidden py-1.5 z-50 ${isMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-3"}`}
              >
                <Link
                  to="/create"
                  onClick={() => setIsMenuOpen(false)}
                  className={menuLink}
                >
                  <Plus size={16} className="text-zinc-400" /> Write Story
                </Link>
                <Link
                  to="/chats"
                  onClick={() => setIsMenuOpen(false)}
                  className={menuLink}
                >
                  <MessageSquare size={16} className="text-zinc-400" /> Recent
                  Chats
                </Link>
                <div className="h-px bg-zinc-800/80 my-1 mx-2" />
                <button
                  onClick={() => {
                    setCategoryPopupOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-left ${menuLink}`}
                >
                  <Grid size={16} className="text-zinc-400" /> Browse Categories
                </button>
              </div>
            </div>

            <div className="w-px h-5 bg-zinc-800/80" />

            <UsageChip />

            {!isPro && (
              <Link to="/subscription" className="focus:outline-none group">
                <div
                  className={`h-10 flex items-center gap-2 px-4 rounded-full border shadow-sm transition-all duration-300 ${theme.badgeBg}`}
                >
                  <Sparkles size={14} className={theme.badgeText} />
                  <span
                    className={`hidden lg:block text-[11px] font-semibold uppercase tracking-widest ${theme.badgeText}`}
                  >
                    Go Pro
                  </span>
                </div>
              </Link>
            )}

            <Link
              to="/profile"
              title={daysLeftTitle || packTitle}
              className="focus:outline-none"
            >
              <div
                className={`group h-10 flex items-center gap-2.5 p-1 pr-3 lg:pr-4 rounded-full border bg-zinc-900/30 transition-all duration-300 ${isPro ? theme.pillBorder : "border-white/5 hover:border-zinc-500/50 hover:bg-zinc-800/50"}`}
              >
                <div className="relative shrink-0">
                  {isPro && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-10 drop-shadow-md">
                      <Crown
                        size={12}
                        strokeWidth={2.5}
                        className={theme.crown}
                      />
                    </div>
                  )}
                  <img
                    src={avatar}
                    alt={`${displayName}'s avatar`}
                    referrerPolicy="no-referrer"
                    className={`w-8 h-8 rounded-full object-cover relative z-0 ${isPro ? theme.avatarBorder : "border border-transparent group-hover:border-zinc-400"}`}
                  />
                  {!isPro && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-[#050505]" />
                  )}
                </div>
                <div className="hidden xl:flex flex-col justify-center">
                  <span
                    className={`text-[9px] font-semibold uppercase tracking-widest leading-none mb-1 whitespace-nowrap ${isPro ? theme.pillLabel : "text-zinc-500"}`}
                  >
                    {isPro
                      ? userPlan === "pack"
                        ? `Pack · ${packLeft} left`
                        : "Monthly Pro"
                      : "Profile"}
                    {daysLeftShort && (
                      <span
                        className={`ml-1.5 ${isExpiringSoon ? "text-red-400" : "text-zinc-400"}`}
                      >
                        · {daysLeftShort}
                      </span>
                    )}
                  </span>
                  <span className="text-zinc-200 text-xs font-medium group-hover:text-white transition-colors leading-none truncate max-w-[90px]">
                    {displayName}
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {categoryPopupOpen && (
        <CategoryPopup onClose={() => setCategoryPopupOpen(false)} />
      )}
    </>
  );
};

export default Navbar;
