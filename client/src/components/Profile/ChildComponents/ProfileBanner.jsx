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
  <div className="w-full h-56 sm:h-60 md:h-64 lg:h-72 rounded-2xl overflow-hidden relative group bg-zinc-900">
    <img
      src={bannerImage}
      alt="Profile Banner"
      loading="lazy"
      decoding="async"
      className={`w-full h-full object-cover transition-opacity duration-300 ${isUploadingBanner ? "opacity-40" : "opacity-90"}`}
    />

    {/* Fade the bottom edge into the page background */}
    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />

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
      className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg border border-white/10 transition-all sm:opacity-0 sm:group-hover:opacity-100 disabled:cursor-wait"
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
