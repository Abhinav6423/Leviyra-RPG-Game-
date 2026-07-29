import api from "../lib/axios.js";

// Accept page and limit, with defaults that match your backend logic
export const getPublicCharacters = async ({ primaryTags = "all", page = 1, limit = 15 } = {}) => {
    try {
        // Pass page and limit as query parameters to your backend
        const response = await api.get(`/characters/public/${primaryTags}?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching characters:", error);
        throw error;
    }
};