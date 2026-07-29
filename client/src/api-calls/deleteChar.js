import api from "../lib/axios.js"

export const deleteCharacter = async (id) => {
    try {
        const response = await api.delete(`/characters/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting character:", error);
        throw error;
    }
}