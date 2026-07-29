import api from "../lib/axios.js"; 
export const getCharacterComments = async (charId, pageParam = 1) => {
    try {
        // Fetches 10 comments at a time based on the page parameter
        const response = await api.get(`/characters/${charId}/comments?page=${pageParam}&limit=10`);
        return response.data;
    } catch (error) {
        console.error("Error fetching paginated comments:", error);
        throw error;
    }
};