import React from "react";
import { User, Sparkles, Share2, LogOut } from "lucide-react";
import { getDynamicButtonStyle } from "../logic/buttonStyles.js";

const iconBtn =
  "shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl border transition-all duration-200 flex items-center justify-center";

const ProfileActions = ({
  accent,
  appliedButtonSetting,
  subTier,
  onEditProfile,
  onManageSubscription,
  onShare,
  onLogout,
}) => (
  <div className="flex items-center gap-2.5 w-full max-w-md mb-8 sm:mb-12 z-20">
    <button
      onClick={onEditProfile}
      className={getDynamicButtonStyle(appliedButtonSetting, accent, true)}
    >
      <User size={14} strokeWidth={1.75} /> Edit Profile
    </button>

    <button
      onClick={onManageSubscription}
      className={getDynamicButtonStyle(appliedButtonSetting, accent, false)}
    >
      <Sparkles size={14} strokeWidth={1.75} />{" "}
      {subTier === "free" ? "Upgrade" : "Manage Sub"}
    </button>

    <button
      onClick={onShare}
      title="Share Profile"
      className={`${iconBtn} bg-white/[0.04] text-zinc-300 border-white/10 hover:bg-white/[0.08] hover:text-white`}
    >
      <Share2 size={15} strokeWidth={1.75} />
    </button>

    <button
      onClick={onLogout}
      title="Log Out"
      className={`${iconBtn} bg-red-500/[0.06] text-red-400 border-red-500/20 hover:bg-red-500/15 hover:text-red-300`}
    >
      <LogOut size={15} strokeWidth={1.75} />
    </button>
  </div>
);

export default ProfileActions;
