import React from "react";
import { BadgeCheck, Tag } from "lucide-react";

const ProfileIdentity = ({
  user,
  isPro,
  subTier,
  accent,
  followCounts,
  appliedProfileTag,
  onOpenFollowModal,
}) => (
  <div className="text-center mb-6 sm:mb-8 px-2 flex flex-col items-center">
    <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white flex items-center justify-center gap-1.5 tracking-tight">
      {user?.username || "Unknown Author"}
      {isPro && <BadgeCheck size={18} className={accent.themeColor} />}
    </h1>
    <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
      <span className="truncate max-w-[180px] sm:max-w-none">
        {user?.email || "No email provided"}
      </span>
      <span className="text-zinc-700">·</span>
      <span className="capitalize text-zinc-400 font-medium">
        {subTier} tier
      </span>
    </p>

    <div className="flex items-center justify-center gap-2 mt-3">
      <button
        onClick={() => onOpenFollowModal("followers")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm text-zinc-400 hover:bg-zinc-800/60 hover:text-white transition-all active:scale-95"
      >
        <span className="font-semibold text-white">
          {followCounts.followers}
        </span>{" "}
        Followers
      </button>

      {/* The dot separator isn't strictly necessary with pill buttons, but keeping it if you like the spacing */}
      <span className="text-zinc-800">|</span>

      <button
        onClick={() => onOpenFollowModal("following")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm text-zinc-400 hover:bg-zinc-800/60 hover:text-white transition-all active:scale-95"
      >
        <span className="font-semibold text-white">
          {followCounts.following}
        </span>{" "}
        Following
      </button>
    </div>

    {appliedProfileTag && (
      <div className="mt-3.5">
        <span
          className={`inline-flex items-center gap-1.5 px-3.5 py-1 text-[11px] font-medium tracking-wide border rounded-full bg-white/[0.02] border-white/10 ${accent.themeColor}`}
        >
          <Tag size={11} className="opacity-70" />
          {appliedProfileTag}
        </span>
      </div>
    )}
  </div>
);

export default ProfileIdentity;
