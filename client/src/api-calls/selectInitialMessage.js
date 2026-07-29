import api from "../lib/axios.js";

export const selectInitialMessage = async (characterId, message) => {
    const payload = {
        characterId,
        message
    };

    // Note: Adjust "/chats/select-initial" to match exactly what you defined in your backend routes
    const res = await api.post("/chat/select-initial", payload);
    return res.data;
};