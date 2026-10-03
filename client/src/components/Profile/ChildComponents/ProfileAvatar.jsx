import React from "react";
import { Edit2, Lock } from "lucide-react";

const SIZE_CLASSES = {
  lg: "w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32",
  sm: "w-14 h-14",
};

// size: "lg" = main profile header, "sm" = customize-panel preview.
// editable: shows the small edit/lock button that opens the file picker.
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
      className={`${SIZE_CLASSES[size]} rounded-full object-cover bg-zinc-900 transition-all duration-300 ${
        hasCustomRing ? "" : `border-2 ${accent.avatarRing}`
      } ${wrapped ? "relative z-30" : ""} ${isUploadingAvatar ? "opacity-50" : ""}`}
    />
  );

  if (!wrapped && !editable) return image;

  return (
    <div
      className={
        wrapped
          ? "relative rounded-full bg-[#0a0a0b] p-1.5 shadow-xl border border-white/[0.05]"
          : "relative inline-block"
      }
    >
      {image}
      {editable && (
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
            className="absolute bottom-0 right-0 z-40 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/15 flex items-center justify-center transition-all disabled:cursor-wait"
          >
            {isPro ? (
              <Edit2 size={12} />
            ) : (
              <Lock size={11} className="text-zinc-400" />
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default ProfileAvatar;
