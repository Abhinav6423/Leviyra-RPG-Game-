import api from "../lib/axios.js"

export const selectAlternateMessage = async (messageId, index) => {
    try {
        const response = await api.patch(`/chats/message/${messageId}/alternate`, { index });
        return response;
    } catch (error) {
        console.error("Error selecting alternate message:", error);
        throw error;
    }
}