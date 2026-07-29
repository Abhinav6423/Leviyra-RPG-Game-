import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getFollowers, getFollowing } from "../../../api-calls/followFeature.js";
import { extractUserList, extractTotalCount } from "./followUtils.js";


// Owns: follower/following totals (fetched once for the header), and the
// on-demand modal that lists the full followers/following collection.
export const useFollowSystem = (userId, { onNavigateToUser } = {}) => {
  
  const [followCounts, setFollowCounts] = useState({
    followers: 0,
    following: 0,
  });
  const [followModalType, setFollowModalType] = useState(null); // 'followers' | 'following' | null
  const [followListUsers, setFollowListUsers] = useState([]);
  const [isFollowListLoading, setIsFollowListLoading] = useState(false);

  // Fetch just the counts up front (page 1 / limit 1 keeps the payload
  // tiny; we only need totals here).
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    (async () => {
      try {
        const [followersRes, followingRes] = await Promise.all([
          getFollowers(userId, 1, 1),
          getFollowing(userId, 1, 1),
        ]);
        if (cancelled) return;
        setFollowCounts({
          followers: extractTotalCount(
            followersRes,
            extractUserList(followersRes),
          ),
          following: extractTotalCount(
            followingRes,
            extractUserList(followingRes),
          ),
        });
      } catch (err) {
        console.error("Failed to fetch follow counts:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const openFollowModal = useCallback(
    async (type) => {
      if (!userId) return;
      setFollowModalType(type);
      setIsFollowListLoading(true);
      try {
        const fetcher = type === "followers" ? getFollowers : getFollowing;
        const res = await fetcher(userId, 1, 50);
        setFollowListUsers(extractUserList(res));
      } catch (err) {
        console.error(`Failed to fetch ${type}:`, err);
        toast.error(
          `Couldn't load ${type === "followers" ? "followers" : "following"}.`,
        );
        setFollowListUsers([]);
      } finally {
        setIsFollowListLoading(false);
      }
    },
    [userId],
  );

  const closeFollowModal = useCallback(() => {
    setFollowModalType(null);
    setFollowListUsers([]);
  }, []);

  const handleFollowListUserClick = useCallback(
    (targetUser) => {
      const targetId = targetUser?._id || targetUser?.id;
      if (!targetId) return;
      closeFollowModal();
      onNavigateToUser?.(targetId);
    },
    [closeFollowModal, onNavigateToUser],
  );

  return {
    followCounts,
    followModalType,
    followListUsers,
    isFollowListLoading,
    openFollowModal,
    closeFollowModal,
    handleFollowListUserClick,
  };
};