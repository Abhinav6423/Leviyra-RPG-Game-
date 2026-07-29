import api from "../lib/axios.js";


export const updateProfileCustomization = async (settingsData) => {
    try {

        const response = await api.put("/profile/customize-profile-settings", settingsData);
        return response.data;
    } catch (error) {
        console.error("Error updating profile customizations:", error);
        throw error;
    }
};