import api from "../lib/axios.js";

export const updateProfile = async (formData) => {
    try {
        const response = await api.put("/profile/update", formData);
        return response.data;
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};