import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// For ES Modules __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 CORS
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://leviyra.com"
        : "http://localhost:5173",
    credentials: true,
  }),
);

// 🔥 MIDDLEWARE (UPDATED FOR DODO WEBHOOKS)
app.use(
  express.json({
    verify: (req, res, buf) => {
      // Sirf webhook route ke liye raw body save karenge memory bachane ke liye
      if (req.originalUrl.includes("/api/payments/webhook")) {
        req.rawBody = buf.toString("utf8");
      }
    },
  }),
);

// 🔌 DB CONNECT
import connectDB from "./db config/db.js";
connectDB();

// 📦 ROUTES
import authRoutes from "./routes/auth.routes.js";
import characterRoutes from "./routes/characters.route.js";
import profileRoutes from "./routes/profile.route.js";
import chatRoutes from "./routes/chats.route.js";
import paymentRoutes from "./routes/payments.routes.js";

// 👇 NAYA: Subscription expiry cron job
import { startSubscriptionExpiryCron } from "./cron/expirySubscription.js";

app.use("/api/payments", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/chat", chatRoutes);

// 🌐 React Static Files Serve karo
app.use(express.static(path.join(__dirname, "client/dist")));

// ✅ Express 5 fix
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "client/dist", "index.html"));
});

// 🚀 SERVER START
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startSubscriptionExpiryCron(); // 👈 NAYA: server start hote hi cron schedule ho jaayega
});
