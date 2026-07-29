import React from "react";
import { Edit2, Lock } from "lucide-react";

const SIZE_CLASSES = {
  lg: "w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32",
  sm: "w-14 h-14",
};

// size: "lg" for the main profile header, "sm" for the customize-panel
// preview thumbnail.
// editable: pass true to show a small "edit" button overlay (used on the
// main header, not on the customize-panel preview) that opens a file
// picker via avatarInputRef/onEditClick/onFileChange.
const ProfileAvatar = ({
  src,
  avatarRingStyle,
  hasCustomRing,
  accent,
  size = "lg",
  wrapped = false,
  editable = false,
  isPro = false,
  isUploadingAvatar = false,
  avatarInputRef,
  onEditClick,
  onFileChange,
}) => {
  const image = (
    <img
      src={src || "https://via.placeholder.com/150"}
      alt="User Avatar"
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      style={avatarRingStyle}
      className={`${SIZE_CLASSES[size]} rounded-full object-cover bg-zinc-900 ${
        hasCustomRing ? "" : `border-2 ${accent.avatarRing}`
      } ${wrapped ? "relative z-30" : ""} transition-all duration-300 ${
        isUploadingAvatar ? "opacity-50" : ""
      }`}
    />
  );

  // Non-editable path is byte-for-byte the original behavior — no extra
  // wrapper div, so nothing shifts for existing (e.g. customize-panel)
  // usages that don't pass `editable`.
  if (!editable) {
    if (!wrapped) return image;
    return (
      <div className="rounded-full bg-[#0a0a0b] p-1.5 shadow-xl border border-white/[0.05]">
        {image}
      </div>
    );
  }

  const editButton = (
    <>
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />
      <button
        onClick={onEditClick}
        disabled={isUploadingAvatar}
        title="Edit profile picture"
        className="absolute bottom-0 right-0 z-40 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/70 hover:bg-black/85 text-white border border-white/15 backdrop-blur-md flex items-center justify-center transition-all disabled:cursor-wait"
      >
        {isPro ? (
          <Edit2 size={12} />
        ) : (
          <Lock size={11} className="text-zinc-400" />
        )}
      </button>
    </>
  );

  if (!wrapped) {
    return (
      <div className="relative inline-block">
        {image}
        {editButton}
      </div>
    );
  }

  return (
    <div className="relative rounded-full bg-[#0a0a0b] p-1.5 shadow-xl border border-white/[0.05]">
      {image}
      {editButton}
    </div>
  );
};

export default ProfileAvatar;