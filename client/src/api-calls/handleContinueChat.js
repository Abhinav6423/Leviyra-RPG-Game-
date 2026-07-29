import api from "../lib/axios.js";

export const streamContinueMessage = async (characterId) => {
    try {

        const response = await api.post(`/chat/${characterId}/continue`);
        return response;
    } catch (error) {
        console.error("Error continuing chat:", error);
        throw error;
    }
};