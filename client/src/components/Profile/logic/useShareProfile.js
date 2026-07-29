import { useCallback } from "react";
import { toast } from "sonner";

// Copies the current user's public profile URL to the clipboard.
export const useShareProfile = (user) => {
  return useCallback(async () => {
    if (!user?.username) {
      toast.error("Your profile isn't ready to share yet.");
      return;
    }
    const shareUrl = `${window.location.origin}/public-profile/${user._id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Profile link copied to clipboard");
    } catch (err) {
      console.error("Failed to copy profile link:", err);
      toast.error("Couldn't copy the link. Try again.");
    }
  }, [user]);
};