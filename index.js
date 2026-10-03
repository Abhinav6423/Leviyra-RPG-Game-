import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./db config/db.js";

import authRoutes from "./routes/auth.routes.js";
import characterRoutes from "./routes/characters.route.js";
import profileRoutes from "./routes/profile.route.js";
import chatRoutes from "./routes/chats.route.js";
import paymentRoutes from "./routes/payments.routes.js";
import usageRoutes from "./routes/usage.routes.js"; // NEW

import { startSubscriptionExpiryCron } from "./cron/expirySubscription.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ES Module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://leviyra.com"
        : "http://localhost:5173",
    credentials: true,
  }),
);

// Body Parser
app.use(
  express.json({
    verify: (req, res, buf) => {
      if (req.originalUrl.includes("/api/payments/webhook")) {
        req.rawBody = buf.toString("utf8");
      }
    },
  }),
);

// Routes
app.use("/api/payments", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/usage", usageRoutes); // NEW

// React Build
app.use(express.static(path.join(__dirname, "client/dist")));

app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist", "index.html"));
});

// ===========================
// START SERVER
// ===========================

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);

      startSubscriptionExpiryCron();

      console.log("✅ Subscription Cron Started");
    });
  } catch (err) {
    console.error("❌ Failed to start server");
    console.error(err);
    process.exit(1);
  }
};

startServer();
