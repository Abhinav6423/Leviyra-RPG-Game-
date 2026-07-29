import api from "../lib/axios.js"

export const commentOnCharacter = async (characterId, comment) => {
    try {
        const response = await api.post(`/characters/${characterId}/comments`, { comment });
        return response;
    } catch (error) {
        console.error("Error commenting on character:", error);
        throw error;
    }
}