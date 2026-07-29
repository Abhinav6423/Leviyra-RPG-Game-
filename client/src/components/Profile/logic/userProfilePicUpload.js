import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { updateProfilePicture } from "../../../api-calls/updateProfilePicture.js";
import { DEFAULT_AVATAR } from "./constants.js";

const MAX_BYTES = 5 * 1024 * 1024;

const validateImageFile = (file, { aspectLabel }) => {
  if (file.size > MAX_BYTES) {
    toast.error(`Image is too large. Max size is 5MB (${aspectLabel}).`);
    return false;
  }
  return true;
};

// Helper function to auto-crop image from the center (default is 1:1 ratio for avatars)
const getCroppedImage = (file, targetRatio = 1) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = URL.createObjectURL(file);

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const { width, height } = image;
      const imageRatio = width / height;

      let cropWidth = width;
      let cropHeight = height;
      let startX = 0;
      let startY = 0;

      // Agar image jyada wide hai, left & right se crop karo
      if (imageRatio > targetRatio) {
        cropWidth = height * targetRatio;
        startX = (width - cropWidth) / 2;
      }
      // Agar image jyada tall hai, top & bottom se crop karo
      else if (imageRatio < targetRatio) {
        cropHeight = width / targetRatio;
        startY = (height - cropHeight) / 2;
      }

      // Set canvas size exactly to the cropped dimensions
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      // Draw the cropped area onto the canvas
      ctx.drawImage(
        image,
        startX,
        startY,
        cropWidth,
        cropHeight, // Source coordinates
        0,
        0,
        cropWidth,
        cropHeight, // Destination coordinates
      );

      // Convert canvas back to a File object
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }
        const croppedFile = new File([blob], file.name, {
          type: file.type,
          lastModified: Date.now(),
        });
        resolve(croppedFile);
      }, file.type);
    };

    image.onerror = () => reject(new Error("Failed to load image"));
  });
};

// Owns: avatar preview/upload state and the file-input plumbing behind
// the "Edit profile picture" button (gated on isPro, same as the banner).
export const useProfilePicUpload = ({ user, isPro, refetchUser }) => {
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  // NOTE: the backend saves the new picture under
  // profileCustomizationSettings.profilePicture (per the controller you
  // shared), but older code in this app also reads user.profilePicture
  // directly — so we check both here to be safe. Once the backend is
  // consistent you can drop the second fallback.
  const avatarImage =
    avatarPreview ||
    user?.profileCustomizationSettings?.profilePicture ||
    user?.profilePicture ||
    DEFAULT_AVATAR;

  const handleAvatarEditClick = useCallback(() => {
    if (!isPro) {
      toast.error(
        "Custom profile pictures are only available for Pro users. Please upgrade your plan!",
      );
      return;
    }
    avatarInputRef.current?.click();
  }, [isPro]);

  const handleAvatarFileChange = useCallback(
    async (e) => {
      let file = e.target.files?.[0];
      if (!file) return;

      if (!validateImageFile(file, { aspectLabel: "1:1 recommended" })) {
        e.target.value = "";
        return;
      }

      toast.loading("Processing image...", { id: "avatar-toast" });

      try {
        // Automatically crop the file to 1:1 (Square) before uploading
        file = await getCroppedImage(file, 1);

        const localUrl = URL.createObjectURL(file);
        setAvatarPreview(localUrl);
        setIsUploadingAvatar(true);
        toast.loading("Uploading profile picture...", { id: "avatar-toast" });

        const data = await updateProfilePicture(file);

        // NOTE: the current backend controller for this endpoint responds
        // with `bannerImage` (a copy-paste leftover from the banner
        // controller) instead of a profile-picture-specific key. We check
        // the "correct" shapes first and fall back to `bannerImage` so
        // this keeps working even before that backend bug is fixed.
        const persistedAvatarUrl =
          data?.user?.profileCustomizationSettings?.profilePicture ||
          data?.profilePicture ||
          data?.avatarImage ||
          data?.bannerImage ||
          data?.user?.bannerImage ||
          localUrl;

        setAvatarPreview(persistedAvatarUrl);
        toast.success("Profile picture updated!", { id: "avatar-toast" });
        if (typeof refetchUser === "function") refetchUser();
      } catch (err) {
        console.error("Profile picture upload failed:", err);
        toast.error("Failed to update profile picture. Please try again.", {
          id: "avatar-toast",
        });
        setAvatarPreview(null);
      } finally {
        setIsUploadingAvatar(false);
        e.target.value = "";
      }
    },
    [refetchUser],
  );

  return {
    avatarImage,
    isUploadingAvatar,
    avatarInputRef,
    handleAvatarEditClick,
    handleAvatarFileChange,
  };
};
