import api from "../lib/axios.js"

export const recentChats = async () => {
    try {
        const response = await api.get("/chat/recent");
        return response.data;
    } catch (error) {
        console.error("Error fetching recent chats:", error);
        throw error;
    }
}
