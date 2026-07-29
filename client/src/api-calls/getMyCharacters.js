import api from "../lib/axios.js";

export const getMyCharacters = async (filterOption = 'all') => {
    const response = await api.get("/characters/my", {
        params: {
            filter: filterOption.toLowerCase() // Sends ?filter=draft, etc.
        }
    });
    return response.data;
};