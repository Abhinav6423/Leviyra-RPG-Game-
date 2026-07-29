import api from "../lib/axios.js";

// ==========================================
// CHARACTER DETAILS
// Basic character profile fetch — used to show name, images,
// personality, startingMessage etc. before/while chatting.
// ==========================================
export const openCharDetails = async (charId) => {
    const response = await api.get(`/characters/${charId}`);
    return response.data;
};