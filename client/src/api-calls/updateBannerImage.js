import api from "../lib/axios.js";

export const updateBannerImage = async (file) => {
    const formData = new FormData();
    formData.append("bannerPicture", file); // ✅ fixed field name

    try {
        const response = await api.put("/profile/update-banner", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating banner image:", error);
        throw error;
    }
};