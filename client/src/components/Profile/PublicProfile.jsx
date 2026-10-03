import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Quote,
  Tag,
  Ghost,
  Share2,
  Component,
  Check,
  UserPlus,
  UserMinus,
  X,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { getPublicProfile } from "../../api-calls/getPublicProfile.js";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowingUser,
} from "../../api-calls/followFeature.js";
import { useAuth } from "../../context/Authcontext.jsx";

// ---- Mapped Fonts ----
const FONT_MAP = {
  Inter: "'Inter', sans-serif",
  Outfit: "'Outfit', sans-serif",
  Lora: "'Lora', serif",
  Merriweather: "'Merriweather', serif",
  "Crimson Text": "'Crimson Text', serif",
  Cinzel: "'Cinzel', serif",
  "Space Grotesk": "'Space Grotesk', sans-serif",
  Rajdhani: "'Rajdhani', sans-serif",
  "Cormorant Garamond": "'Cormorant Garamond', serif",
  Grenze: "'Grenze', serif",
  "Crimson Pro": "'Crimson Pro', serif",
};

// ---- Dynamic Premium Background Gradients ----
const THEME_BACKGROUNDS = {
  "Neon Nights":
    "bg-gradient-to-br from-indigo-950/60 via-[#050505] to-[#050505]",
  "Dark Void": "bg-gradient-to-b from-zinc-900/30 via-[#050505] to-[#050505]",
  "Forest Canopy":
    "bg-gradient-to-br from-emerald-950/60 via-[#050505] to-[#050505]",
  "Ocean Depths":
    "bg-gradient-to-tr from-cyan-950/60 via-[#050505] to-[#050505]",
  "Crimson Sunset":
    "bg-gradient-to-bl from-rose-950/60 via-[#050505] to-[#050505]",
  "Cyber Matrix":
    "bg-gradient-to-b from-green-950/50 via-[#050505] to-emerald-950/20",
  "Gold Prestige":
    "bg-gradient-to-tr from-amber-950/50 via-[#050505] to-yellow-950/20",
  "Ethereal Light":
    "bg-gradient-to-br from-fuchsia-950/50 via-[#050505] to-purple-950/30",
  "Blood Moon": "bg-gradient-to-b from-red-950/60 via-[#050505] to-[#050505]",
  "Galactic Core":
    "bg-gradient-to-tl from-violet-950/60 via-[#050505] to-fuchsia-950/30",
};

// ---- Ambient Top Glow mapped to Themes ----
const THEME_AMBIENT_GLOW = {
  "Neon Nights": "linear-gradient(to right, #4f46e5, #ec4899)",
  "Dark Void": "#27272a",
  "Forest Canopy": "#059669",
  "Ocean Depths": "#0891b2",
  "Crimson Sunset": "linear-gradient(to right, #e11d48, #ea580c)",
  "Cyber Matrix": "#16a34a",
  "Gold Prestige": "linear-gradient(to right, #d97706, #fbbf24)",
  "Ethereal Light": "linear-gradient(to right, #c026d3, #9333ea)",
  "Blood Moon": "#991b1b",
  "Galactic Core": "linear-gradient(to right, #7c3aed, #db2777)",
};

const TIER_STYLES = {
  monthly: {
    themeColor: "text-amber-500",
    buttonSolid: "bg-amber-500 hover:bg-amber-600 text-black border-amber-500",
    bioBox:
      "bg-gradient-to-br from-amber-500/[0.05] to-orange-500/[0.02] border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.1)]",
    avatarRing: "border-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.4)]",
  },
  weekly: {
    themeColor: "text-indigo-500",
    buttonSolid:
      "bg-indigo-500 hover:bg-indigo-600 text-white border-indigo-500",
    bioBox:
      "bg-gradient-to-br from-indigo-500/[0.05] to-purple-500/[0.02] border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.1)]",
    avatarRing: "border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.4)]",
  },
  free: {
    themeColor: "text-white",
    buttonSolid: "bg-white hover:bg-zinc-200 text-black border-white",
    bioBox: "border border-white/10 bg-white/[0.02]",
    avatarRing: "border-[#1c1c1e]",
  },
};

const RING_COLORS = {
  "Classic White": "#ffffff",
  "Ice Blue": "#38bdf8",
  Emerald: "#10b981",
  Rose: "#f43f5e",
  Violet: "#8b5cf6",
  "Gold Prestige": "#f59e0b",
  "Crimson Blaze": "#ef4444",
  "Cyber Cyan": "#22d3ee",
  "Royal Purple": "#a855f7",
  "Obsidian Glow": "#27272a",
};

const RING_THICKNESS = {
  Thin: 2,
  Medium: 4,
  Bold: 6,
  Thick: 8,
  Statement: 12,
};

const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";

// Same card look as the rest of the site
const cardBase =
  "rounded-2xl border border-white/[0.06] bg-gradient-to-b from-zinc-800/50 to-zinc-900/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]";

const getDynamicButtonStyle = (pref, tierStyles) => {
  const layout =
    "py-2.5 sm:py-3.5 px-6 sm:px-8 text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2";
  const baseColor = tierStyles.buttonSolid;
  const defaultStyle = `${layout} rounded-xl sm:rounded-2xl ${baseColor}`;

  if (!pref) return defaultStyle;

  switch (pref) {
    case "Soft Rounded":
      return `${layout} rounded-full ${baseColor} shadow-sm`;
    case "Sharp Edges":
      return `${layout} rounded-none ${baseColor} shadow-md`;
    case "Outline":
      return `${layout} rounded-lg bg-transparent border-2 border-current hover:bg-white/10 ${tierStyles.themeColor}`;
    case "Ghost":
      return `${layout} rounded-lg bg-transparent border-transparent hover:bg-white/10 shadow-none ${tierStyles.themeColor}`;
    case "Elevated":
      return `${layout} rounded-xl ${baseColor} shadow-[0_10px_20px_rgba(0,0,0,0.4)] hover:-translate-y-1`;
    case "Neon Glow":
      return `${layout} rounded-xl bg-transparent border-2 ${tierStyles.themeColor} shadow-[0_0_15px_currentColor] hover:shadow-[0_0_25px_currentColor]`;
    case "Glassmorphism":
      return `${layout} rounded-2xl bg-white/5 backdrop-blur-md border border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)] text-white hover:bg-white/10`;
    case "Metallic":
      return `${layout} rounded-xl bg-gradient-to-b from-zinc-300 to-zinc-500 text-black border-none shadow-inner hover:brightness-110`;
    case "Holographic":
      return `${layout} rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white border-none animate-pulse hover:animate-none`;
    case "Brutalism":
      return `${layout} rounded-none border-4 border-white bg-white text-black uppercase tracking-widest shadow-[4px_4px_0_rgba(255,255,255,0.7)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]`;
    default:
      return defaultStyle;
  }
};

// ---- Character card ----
const PublicCharCard = ({ char }) => (
  <Link
    to={`/character/${char._id}`}
    className="group relative block rounded-2xl overflow-hidden aspect-[3/4] bg-zinc-900 border border-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
  >
    <img
      src={char.images?.[0]?.url || "https://via.placeholder.com/300x400"}
      alt={char.name || "Character Image"}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
    <div className="absolute bottom-0 left-0 p-4 w-full">
      <h4 className="text-white font-bold text-sm sm:text-base md:text-lg truncate drop-shadow-md">
        {char.name || "Unnamed Character"}
      </h4>
    </div>
  </Link>
);

// ---- Followers / Following List Modal ----
const FollowListModal = ({ title, users, isLoading, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
    onClick={onClose}
  >
    <div
      className="w-full max-w-md max-h-[70vh] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h3 className="text-white font-bold text-base">{title}</h3>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="overflow-y-auto px-2 py-2">
        {isLoading ? (
          <div className="py-10 text-center text-zinc-500 text-sm">
            Loading...
          </div>
        ) : users.length === 0 ? (
          <div className="py-10 text-center text-zinc-500 text-sm">
            Nobody here yet.
          </div>
        ) : (
          users.map((u) => (
            <Link
              key={u._id}
              to={`/profile/${u._id}`}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <img
                src={u.profilePicture || "https://via.placeholder.com/40"}
                alt={u.username}
                className="w-10 h-10 rounded-full object-cover bg-zinc-900 border border-white/10"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  {u.username}
                </p>
                {u.bio && (
                  <p className="text-zinc-500 text-xs truncate">{u.bio}</p>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  </div>
);

const PublicProfile = () => {
  const { userId } = useParams();
  const { user: loggedInUser } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [justCopied, setJustCopied] = useState(false);

  // ── Follow system state ──
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        setIsLoading(true);
        const response = await getPublicProfile(userId);
        const data = response?.data || response;

        if (data?.success && data?.user) {
          setProfileUser(data.user);
          setCharacters(data.characters || []);
          setFollowersCount(data.user.followersCount || 0);
          setFollowingCount(data.user.followingCount || 0);
        } else {
          toast.error("User could not be found.");
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Profile view could not be opened.");
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) fetchPublicData();
  }, [userId]);

  const isOwnProfile = Boolean(
    loggedInUser && profileUser && loggedInUser._id === profileUser._id,
  );

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!loggedInUser || !profileUser || isOwnProfile) {
        setIsFollowing(false);
        return;
      }
      try {
        const res = await isFollowingUser(profileUser._id);
        setIsFollowing(res?.isFollowing || false);
      } catch (error) {
        console.error("Failed to check follow status:", error);
      }
    };

    checkFollowStatus();
  }, [loggedInUser, profileUser, isOwnProfile]);

  const handleFollowToggle = async () => {
    if (!loggedInUser) {
      toast.error("Please log in to follow creators.");
      navigate("/login");
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(profileUser._id);
        setIsFollowing(false);
        setFollowersCount((c) => Math.max(0, c - 1));
        toast.success(`Unfollowed ${profileUser.username}`);
      } else {
        await followUser(profileUser._id);
        setIsFollowing(true);
        setFollowersCount((c) => c + 1);
        toast.success(`Following ${profileUser.username}`);
      }
    } catch (error) {
      console.error("Follow toggle error:", error);
      toast.error(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setFollowLoading(false);
    }
  };

  const openFollowersModal = async () => {
    setShowFollowersModal(true);
    setListLoading(true);
    try {
      const res = await getFollowers(profileUser._id);
      setFollowersList(res?.followers || []);
    } catch (error) {
      console.error("Failed to load followers:", error);
      toast.error("Couldn't load followers.");
    } finally {
      setListLoading(false);
    }
  };

  const openFollowingModal = async () => {
    setShowFollowingModal(true);
    setListLoading(true);
    try {
      const res = await getFollowing(profileUser._id);
      setFollowingList(res?.following || []);
    } catch (error) {
      console.error("Failed to load following:", error);
      toast.error("Couldn't load following.");
    } finally {
      setListLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setJustCopied(true);
      toast.success("Profile link copied to clipboard!");
      setTimeout(() => setJustCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center pt-20 px-4">
        <div className="w-full max-w-[1800px] animate-pulse">
          <div className="w-full h-64 bg-zinc-900 rounded-[2rem] mb-10"></div>
          <div className="w-32 h-32 rounded-full bg-zinc-800 mx-auto -mt-24 mb-6"></div>
          <div className="w-48 h-8 bg-zinc-800 rounded mx-auto mb-4"></div>
          <div className="w-24 h-4 bg-zinc-900 rounded mx-auto mb-12"></div>
          <div className="w-full max-w-4xl mx-auto h-32 bg-zinc-900 rounded-2xl mb-12"></div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white flex-col gap-4">
        <Ghost size={48} className="text-zinc-600" />
        <h2 className="text-2xl font-bold">Creator not found</h2>
        <p className="text-zinc-500">
          This profile might have been moved or deleted.
        </p>
      </div>
    );
  }

  const isPro = profileUser.subscription?.status === "active";
  const subTier =
    profileUser.subscription?.plan === "monthly"
      ? "monthly"
      : profileUser.subscription?.plan === "weekly"
        ? "weekly"
        : "free";
  const style = TIER_STYLES[subTier];

  const customizations = profileUser.profileCustomizationSettings || {};

  const activeTheme = customizations.colorTheme || null;
  const activeBackgroundClass =
    THEME_BACKGROUNDS[activeTheme] || "bg-[#050505]";
  const activeAmbientGlow = THEME_AMBIENT_GLOW[activeTheme] || "transparent";

  const appliedFont = customizations.typography || "Inter";
  const activeFontFamily = FONT_MAP[appliedFont] || "'Inter', sans-serif";
  const appliedButtonSetting = customizations.buttonStyles || null;
  const appliedProfileTag = customizations.profileTag || null;
  const bannerImage =
    customizations.bannerImage || profileUser.bannerImage || DEFAULT_BANNER;

  const ringColorHex = RING_COLORS[customizations.avatarRingColor] || null;
  const ringThicknessValue =
    RING_THICKNESS[customizations.avatarRingThickness] || null;
  const hasCustomRing = Boolean(ringColorHex || ringThicknessValue);

  const avatarRingStyle = hasCustomRing
    ? {
        borderColor: ringColorHex,
        borderWidth: ringThicknessValue ? `${ringThicknessValue}px` : undefined,
        boxShadow: ringColorHex ? `0 0 25px ${ringColorHex}66` : undefined,
      }
    : undefined;

  const charCount = characters?.length || 0;

  const statBoxes = [
    { key: "characters", value: charCount, label: "Characters" },
    {
      key: "followers",
      value: followersCount,
      label: "Followers",
      onClick: openFollowersModal,
    },
    ...(isOwnProfile
      ? [
          {
            key: "following",
            value: followingCount,
            label: "Following",
            onClick: openFollowingModal,
          },
        ]
      : []),
  ];

  return (
    <div
      className={`min-h-screen text-zinc-300 pb-24 sm:pb-20 pt-6 relative overflow-hidden transition-all duration-700 ease-in-out ${activeBackgroundClass}`}
      style={{ fontFamily: activeFontFamily }}
    >
      {activeTheme && (
        <div
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[400px] sm:h-[600px] opacity-[0.12] blur-[100px] sm:blur-[140px] pointer-events-none rounded-[100%]"
          style={{ background: activeAmbientGlow }}
        />
      )}

      <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 md:px-12 flex flex-col items-center relative z-10">
        {/* --- Back Button --- */}
        <div className="w-full flex justify-start mb-4 z-20">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md border border-white/10 text-zinc-300 hover:text-white transition-all shadow-lg"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>

        {/* --- Banner --- */}
        <div className="w-full h-32 sm:h-48 md:h-64 lg:h-80 rounded-2xl sm:rounded-[2rem] overflow-hidden relative shadow-2xl">
          <img
            src={bannerImage}
            alt={`${profileUser.username}'s Banner`}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        </div>

        {/* --- Avatar --- */}
        <div className="relative -mt-10 sm:-mt-20 md:-mt-24 lg:-mt-28 mb-4 z-20 flex justify-center">
          <div className="rounded-full bg-black/50 backdrop-blur-md p-1.5 sm:p-2 shadow-2xl border border-white/5">
            <img
              src={
                profileUser.profilePicture || "https://via.placeholder.com/150"
              }
              alt={`${profileUser.username}'s Avatar`}
              referrerPolicy="no-referrer"
              style={avatarRingStyle}
              className={`w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-full object-cover bg-zinc-900 ${hasCustomRing ? "" : `border-[3px] sm:border-[4px] ${style.avatarRing}`} relative z-30`}
            />
          </div>
        </div>

        {/* --- Name --- */}
        <div className="text-center mb-6 px-2 flex flex-col items-center">
          <h1 className="text-lg sm:text-2xl md:text-4xl font-bold text-white flex items-center justify-center gap-1.5 sm:gap-2 drop-shadow-md">
            {profileUser.username || "Unknown Creator"}
            {isPro && (
              <BadgeCheck
                size={18}
                className={`sm:w-7 sm:h-7 ${style.themeColor}`}
              />
            )}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-zinc-400 mt-1.5 sm:mt-2">
            <span className="capitalize text-zinc-300 font-medium">
              {subTier} Creator
            </span>
          </p>

          {appliedProfileTag && (
            <div className="mt-4">
              <span
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest border rounded-full bg-black/40 backdrop-blur-md border-current ${style.themeColor} shadow-[0_0_15px_currentColor] opacity-90`}
              >
                <Tag size={12} className="opacity-80" />
                {appliedProfileTag}
              </span>
            </div>
          )}
        </div>

        {/* --- Actions --- */}
        <div className="flex justify-center gap-3 w-full max-w-md mb-8 z-20">
          {!isOwnProfile && (
            <button
              onClick={handleFollowToggle}
              disabled={followLoading}
              className={`${getDynamicButtonStyle(appliedButtonSetting, style)} ${isFollowing ? "!bg-transparent border-2 border-white/20 !text-white hover:!bg-white/10" : ""} disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {followLoading ? (
                "..."
              ) : isFollowing ? (
                <>
                  <UserMinus size={16} />
                  Following
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Follow
                </>
              )}
            </button>
          )}
          <button
            onClick={handleShare}
            className={getDynamicButtonStyle(appliedButtonSetting, style)}
          >
            {justCopied ? <Check size={16} /> : <Share2 size={16} />}
            {justCopied ? "Link Copied!" : "Share Profile"}
          </button>
        </div>

        {/* --- Stats --- */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 w-full max-w-3xl mb-8 sm:mb-12 z-20">
          {statBoxes.map((box) => (
            <div
              key={box.key}
              onClick={box.onClick}
              className={`${cardBase} w-[7.5rem] sm:w-40 flex flex-col items-center justify-center py-5 transition-all duration-200 hover:border-white/20 ${box.onClick ? "cursor-pointer" : ""}`}
            >
              <span className="text-2xl font-semibold text-white">
                {box.value}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest mt-1.5">
                {box.label}
              </span>
            </div>
          ))}
        </div>

        <div className="w-full flex flex-col gap-8 sm:gap-12 pb-6 sm:pb-12 z-20">
          {/* --- Bio --- */}
          <div className="w-full">
            <div
              className={`relative p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-md ${style.bioBox}`}
            >
              {isPro && (
                <Quote
                  size={60}
                  className={`absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 sm:w-20 sm:h-20 ${style.themeColor} opacity-10 -rotate-12`}
                />
              )}
              <h3 className="text-[10px] sm:text-xs font-bold text-zinc-400 mb-3 sm:mb-4 uppercase tracking-widest">
                About
              </h3>
              <p
                className={`max-w-5xl relative z-10 leading-relaxed ${isPro ? "text-base sm:text-lg md:text-xl font-medium text-white" : "text-sm sm:text-base md:text-lg text-zinc-400"}`}
              >
                {profileUser.bio || (
                  <span className="italic opacity-40">
                    {isPro
                      ? "Writing their own legend..."
                      : "No biography provided."}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* --- Portfolio --- */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-5 sm:mb-8">
              <h2 className="text-lg sm:text-2xl font-bold text-white drop-shadow-md flex items-center gap-2">
                <Component size={24} className={style.themeColor} />
                Portfolio
              </h2>
            </div>

            {charCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 sm:py-24 bg-black/20 backdrop-blur-md border border-dashed border-white/10 rounded-2xl sm:rounded-[2rem] text-center w-full px-4">
                <Ghost
                  strokeWidth={1.5}
                  className="text-zinc-600 w-12 h-12 sm:w-16 sm:h-16 mb-4 sm:mb-6"
                />
                <h3 className="text-white font-bold text-base sm:text-xl mb-2 sm:mb-3">
                  Nothing here yet
                </h3>
                <p className="text-zinc-500 text-sm sm:text-base max-w-md">
                  {profileUser.username || "This user"} hasn't published any
                  characters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                {characters.map((char) => (
                  <PublicCharCard key={char._id} char={char} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showFollowersModal && (
        <FollowListModal
          title="Followers"
          users={followersList}
          isLoading={listLoading}
          onClose={() => setShowFollowersModal(false)}
        />
      )}

      {showFollowingModal && (
        <FollowListModal
          title="Following"
          users={followingList}
          isLoading={listLoading}
          onClose={() => setShowFollowingModal(false)}
        />
      )}
    </div>
  );
};

export default PublicProfile;
