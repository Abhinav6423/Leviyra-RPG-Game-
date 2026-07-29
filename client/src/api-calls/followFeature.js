import api from "../lib/axios.js";

// ── Follow system ──

export const followUser = async (userId) => {
  try {
    const response = await api.post(`/profile/follow/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error following user:", error);
    throw error;
  }
};

export const unfollowUser = async (userId) => {
  try {
    const response = await api.post(`/profile/unfollow/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error unfollowing user:", error);
    throw error;
  }
};

export const getFollowers = async (userId, page = 1, limit = 20) => {
  try {
    const response = await api.get(`/profile/followers/${userId}`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching followers:", error);
    throw error;
  }
};

export const getFollowing = async (userId, page = 1, limit = 20) => {
  try {
    const response = await api.get(`/profile/following/${userId}`, {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching following:", error);
    throw error;
  }
};

export const isFollowingUser = async (userId) => {
  try {
    const response = await api.get(`/profile/is-following/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error checking follow status:", error);
    throw error;
  }
};
