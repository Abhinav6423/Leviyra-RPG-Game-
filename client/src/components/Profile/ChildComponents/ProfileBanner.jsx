import React from "react";
import { Edit2, Lock } from "lucide-react";

const ProfileBanner = ({
  bannerImage,
  isUploadingBanner,
  isPro,
  bannerInputRef,
  onEditClick,
  onFileChange,
}) => (
  <div className="w-full h-56 sm:h-60 md:h-64 lg:h-72 rounded-2xl overflow-hidden relative group shadow-xl bg-zinc-900 border border-white/[0.05]">
    <img
      src={bannerImage}
      alt="Profile Banner"
      loading="lazy"
      decoding="async"
      className={`w-full h-full object-cover transition-opacity duration-300 ${isUploadingBanner ? "opacity-40" : "opacity-85"}`}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
    <input
      ref={bannerInputRef}
      type="file"
      accept="image/*"
      onChange={onFileChange}
      className="hidden"
    />
    <button
      onClick={onEditClick}
      disabled={isUploadingBanner}
      className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-black/60 hover:bg-black/75 text-white rounded-lg backdrop-blur-md border border-white/10 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 disabled:cursor-wait"
    >
      {isPro ? (
        <Edit2 size={13} />
      ) : (
        <Lock size={13} className="text-zinc-400" />
      )}
      <span className="text-xs font-medium">
        {isUploadingBanner ? "Uploading…" : "Edit banner"}
      </span>
    </button>
  </div>
);

export default ProfileBanner;