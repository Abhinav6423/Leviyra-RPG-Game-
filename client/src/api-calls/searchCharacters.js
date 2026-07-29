import api from "../lib/axios.js";

export const getSearchedCharacters = async (searchTerm) => {
    try {
        const response = await api.get(`/characters/search?searchTerm=${encodeURIComponent(searchTerm)}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching searched characters:", error);
        throw error;
    }
};