import api from "../lib/axios.js";

export const getPublicProfile = async (userId) => {
    try {
        const response = await api.get(`/profile/public-profile/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching public profile:", error);
        throw error;
    }
};