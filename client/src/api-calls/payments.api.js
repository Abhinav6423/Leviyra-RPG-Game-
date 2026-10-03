import api from "../lib/axios.js";

export const getSubscriptionStatus = async () => {
  try {
    const response = await api.get("/payments/status");
    return response.data;
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    throw error;
  }
};

// NOTE: backend ka route check karo (/checkout/pack ya jo bhi ho)
export const createPackCheckout = async () => {
  try {
    const response = await api.post("/payments/checkout/pack");
    return response.data;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};
