import axios from "axios";
import { getAuth, signOut } from "firebase/auth";

const api = axios.create({
    baseURL: import.meta.env.DEV ? "http://localhost:3000/api" : "/api"
});

api.interceptors.request.use(async (config) => {
    const user = getAuth().currentUser;

    if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;
        const code = error.response?.data?.code;

        if (status === 401 || code === "USER_NOT_FOUND") {
            try {
                await signOut(getAuth());
            } catch (e) {
                console.error("Sign out failed:", e);
            }

            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;