import { useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { updateBannerImage } from "../../../api-calls/updateBannerImage.js";
import { DEFAULT_BANNER } from "./constants.js";

const MAX_BYTES = 5 * 1024 * 1024;

const validateImageFile = (file, { aspectLabel }) => {
  if (file.size > MAX_BYTES) {
    toast.error(`Image is too large. Max size is 5MB (${aspectLabel}).`);
    return false;
  }
  return true;
};

// Helper function to auto-crop image to 3:2 aspect ratio from the center
const getCroppedImage = (file, targetRatio = 3 / 2) => {
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

      // Agar image jyada wide hai (e.g., 16:9), left & right se crop karo
      if (imageRatio > targetRatio) {
        cropWidth = height * targetRatio;
        startX = (width - cropWidth) / 2;
      }
      // Agar image jyada tall hai (e.g., 1:1 ya portrait), top & bottom se crop karo
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

export const useBannerUpload = ({ user, isPro, refetchUser }) => {
  const [bannerPreview, setBannerPreview] = useState(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const bannerInputRef = useRef(null);

  const bannerImage =
    bannerPreview ||
    user?.profileCustomizationSettings?.bannerImage ||
    DEFAULT_BANNER;

  const handleBannerEditClick = useCallback(() => {
    if (!isPro) {
      toast.error(
        "Custom banners are only available for Pro users. Please upgrade your plan!",
      );
      return;
    }
    bannerInputRef.current?.click();
  }, [isPro]);

  const handleBannerFileChange = useCallback(
    async (e) => {
      let file = e.target.files?.[0];
      if (!file) return;

      if (!validateImageFile(file, { aspectLabel: "3:2 recommended" })) {
        e.target.value = "";
        return;
      }

      toast.loading("Processing image...", { id: "banner-toast" });

      try {
        // Automatically crop the file to 3:2 before uploading
        file = await getCroppedImage(file, 3 / 2);

        const localUrl = URL.createObjectURL(file);
        setBannerPreview(localUrl);
        setIsUploadingBanner(true);
        toast.loading("Uploading banner...", { id: "banner-toast" });

        // Backend ko ab automatically cropped (3:2) file jayegi
        const data = await updateBannerImage(file);
        const persistedBannerUrl =
          data?.bannerImage || data?.user?.bannerImage || localUrl;

        setBannerPreview(persistedBannerUrl);
        toast.success("Banner updated!", { id: "banner-toast" });
        if (typeof refetchUser === "function") refetchUser();
      } catch (err) {
        console.error("Banner upload failed:", err);
        toast.error("Failed to update banner. Please try again.", {
          id: "banner-toast",
        });
        setBannerPreview(null);
      } finally {
        setIsUploadingBanner(false);
        e.target.value = "";
      }
    },
    [refetchUser],
  );

  return {
    bannerImage,
    isUploadingBanner,
    bannerInputRef,
    handleBannerEditClick,
    handleBannerFileChange,
  };
};
