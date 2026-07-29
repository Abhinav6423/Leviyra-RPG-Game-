import dotenv from "dotenv";
dotenv.config();

import DodoPayments from "dodopayments";

const dodo = new DodoPayments({
    bearerToken: process.env.DODO_PAYMENTS_API_KEY,
    environment: process.env.NODE_ENV === "production" ? "live_mode" : "test_mode",
    webhookKey: process.env.DODO_WEBHOOK_SECRET,
});

export default dodo;