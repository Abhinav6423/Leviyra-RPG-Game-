import api from "../lib/axios.js";

export const getSubscriptionStatus = async () => {
    try {
        const response = await api.get("/payments/status");
        console.log("Fetched subscription status:", response.data); // Debugging log
        return response.data;
    } catch (error) {
        console.error("Error fetching subscription status:", error);
        throw error;
    }
};

export const createWeeklyCheckout = async () => {
    try {
        const response = await api.post("/payments/checkout/weekly");
        return response.data;
    } catch (error) {
        console.error("Error creating checkout session:", error);
        throw error;
    }
};