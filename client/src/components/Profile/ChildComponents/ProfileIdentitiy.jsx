import React from "react";
import { BadgeCheck, Tag } from "lucide-react";

const followBtn =
  "px-3 py-1.5 rounded-lg text-xs sm:text-sm text-zinc-300 hover:bg-zinc-800/60 hover:text-white transition-all active:scale-95";

const ProfileIdentity = ({
  user,
  isPro,
  subTier,
  accent,
  followCounts,
  appliedProfileTag,
  onOpenFollowModal,
}) => (
  <div className="text-center mb-8 sm:mb-10 px-2 flex flex-col items-center">
    <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white flex items-center justify-center gap-1.5 tracking-tight">
      {user?.username || "Unknown Author"}
      {isPro && <BadgeCheck size={18} className={accent.themeColor} />}
    </h1>

    <p className="text-xs sm:text-sm text-zinc-400 mt-2 flex flex-wrap items-center justify-center gap-1.5">
      <span className="truncate max-w-[180px] sm:max-w-none">
        {user?.email || "No email provided"}
      </span>
      <span className="text-zinc-600">·</span>
      <span className="capitalize text-zinc-300 font-medium">
        {subTier} tier
      </span>
    </p>

    <div className="flex items-center justify-center gap-2 mt-5">
      <button
        onClick={() => onOpenFollowModal("followers")}
        className={followBtn}
      >
        <span className="font-semibold text-white">
          {followCounts.followers}
        </span>{" "}
        Followers
      </button>

      <span className="text-zinc-600">|</span>

      <button
        onClick={() => onOpenFollowModal("following")}
        className={followBtn}
      >
        <span className="font-semibold text-white">
          {followCounts.following}
        </span>{" "}
        Following
      </button>
    </div>

    {appliedProfileTag && (
      <span
        className={`mt-4 inline-flex items-center gap-1.5 px-3.5 py-1 text-[11px] font-medium tracking-wide border rounded-full bg-white/[0.03] border-white/10 ${accent.themeColor}`}
      >
        <Tag size={11} className="opacity-70" />
        {appliedProfileTag}
      </span>
    )}
  </div>
);

export default ProfileIdentity;
