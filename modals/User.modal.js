import mongoose, { Schema } from "mongoose";
import { hasActivePaidPlan } from "../utils/hasActivePaidPlan.js";

const userSchema = new Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },

    provider: {
      type: String,
      enum: ["email", "google"],
      default: "email",
    },

    profilePicture: {
      type: String,
      default: "",
      trim: true,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },

    chatCustomizationSettings: {
      font: {
        type: String,
        default: "medium",
        enum: ["small", "medium", "large"],
      },
    },

    profileCustomizationSettings: {
      colorTheme: { type: String, default: "" },
      avatarRingColor: { type: String, default: "" },
      avatarRingThickness: { type: String, default: "" },
      bannerImage: { type: String, default: "" },
      buttonStyles: { type: String, default: "" },
      profileTag: { type: String, default: "" },
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    terminateAccount: {
      type: Boolean,
      default: false,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },

    totalCharactersCreated: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastLoginAt: {
      type: Date,
      default: Date.now,
    },

    subscription: {
      plan: {
        type: String,
        enum: ["free", "pack", "monthly"],
        default: "free",
      },
      status: {
        type: String,
        // "cancelled" is kept only for old auto-pay users still inside their paid period
        enum: ["active", "cancelled", "expired", "none"],
        default: "none",
      },
      dodoCustomerId: { type: String, trim: true },
      // Legacy: only old auto-pay subscribers have this. New purchases never set it.
      dodoSubscriptionId: { type: String, trim: true },
      // Monthly only (30 days from payment). Not used for pack (no time limit).
      currentPeriodEnd: { type: Date },
      // Processed payment ids (pack + monthly). Prevents double credit on webhook retries.
      packPaymentIds: { type: [String], default: [] },
    },

    usage: {
      // ================= FREE PLAN =================
      totalMessages: { type: Number, default: 0, min: 0 },
      messagesToday: { type: Number, default: 0, min: 0 },
      messagesResetAt: { type: Date, default: null },

      // ================= 1000 MESSAGE PACK =================
      // Remaining pack messages. +1000 on purchase, -1 per message.
      // When it hits 0 the plan automatically goes back to free. No time limit / reset.
      packMessagesLeft: { type: Number, default: 0, min: 0 },

      // ================= ALL PLANS (analytics) =================
      lifetimeMessages: { type: Number, default: 0, min: 0 },
      lastMessageAt: { type: Date, default: null },

      // NOTE: monthly plan is unlimited, so it has no limit counter.
    },

    followersCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    followingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.index({ createdAt: -1 });

// Single source of truth: reuses the same util as the routes and chat logic
userSchema.virtual("hasValidPremium").get(function () {
  return hasActivePaidPlan(this.subscription, this.usage);
});

// { virtuals: true } is needed so the custom toJSON doesn't drop hasValidPremium
userSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.__v;
  delete obj.firebaseUid;
  return obj;
};

export default mongoose.model("User", userSchema);
