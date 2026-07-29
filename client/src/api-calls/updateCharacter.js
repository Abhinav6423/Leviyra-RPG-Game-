import axios from "../lib/axios.js";

export const updateCharacter = async (characterId, formData) => {
    try {
        // ✅ Don't set Content-Type manually — axios/browser sets
        // "multipart/form-data; boundary=..." automatically for FormData.
        // A manual header without the boundary breaks multipart parsing on the backend.
        const response = await axios.patch(`/characters/${characterId}`, formData);
        return response.data;
    } catch (error) {
        console.error("Error updating character:", error);
        throw error;
    }
};