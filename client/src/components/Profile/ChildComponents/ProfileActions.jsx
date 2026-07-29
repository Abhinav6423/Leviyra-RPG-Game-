import React from "react";
import { User, Sparkles, Share2, LogOut, Eye } from "lucide-react";
import { getDynamicButtonStyle } from "../logic/buttonStyles.js";

const ProfileActions = ({
  accent,
  appliedButtonSetting,
  subTier,
  onEditProfile,
  onManageSubscription,
  onShare,
  onLogout,

}) => (
  <div className="flex items-center gap-2 sm:gap-2.5 w-full max-w-md mb-6 sm:mb-8 z-20">
    <button
      onClick={onEditProfile}
      className={getDynamicButtonStyle(appliedButtonSetting, accent, true)}
    >
      <User size={14} /> Edit Profile
    </button>

    <button
      onClick={onManageSubscription}
      className={getDynamicButtonStyle(appliedButtonSetting, accent, false)}
    >
      <Sparkles size={14} /> {subTier === "free" ? "Upgrade" : "Manage Sub"}
    </button>

   

    <button
      onClick={onShare}
      title="Share Profile"
      className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/[0.03] text-zinc-300 border border-white/10 hover:bg-white/[0.07] hover:text-white transition-all duration-200 flex items-center justify-center"
    >
      <Share2 size={16} />
    </button>

    <button
      onClick={onLogout}
      title="Log Out"
      className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-red-500/[0.06] text-red-400/90 border border-red-500/15 hover:bg-red-500/15 hover:text-red-300 transition-all duration-200 flex items-center justify-center"
    >
      <LogOut size={16} />
    </button>
  </div>
);

export default ProfileActions;
