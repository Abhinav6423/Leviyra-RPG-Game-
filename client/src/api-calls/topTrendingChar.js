import api from "../lib/axios.js";

export const getTrendingChar = async () => {
    const response = await api.get("/characters/trending");
    return response.data;
}