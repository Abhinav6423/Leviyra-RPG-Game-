import mongoose, { Schema } from "mongoose";

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
        enum: ["free", "weekly", "monthly"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "cancelled", "expired", "none"],
        default: "none",
      },
      dodoCustomerId: { type: String, trim: true },
      dodoSubscriptionId: { type: String, trim: true },
      currentPeriodEnd: { type: Date },
    },
    usage: {
      // ---- FREE-TIER counters (unaffected by paid plans) ----
      totalMessages: { type: Number, default: 0 },
      messagesToday: { type: Number, default: 0 },
      messagesResetAt: { type: Date, default: null },

      // ---- WEEKLY-PLAN counter — completely separate bucket, never
      // touches or is touched by the free-tier fields above. Caps at
      // 1000 messages per billing cycle (not a 7-day time window).
      weeklyMessagesUsed: { type: Number, default: 0 },
      // Snapshot of subscription.currentPeriodEnd this counter belongs
      // to. When the stored value stops matching the live
      // currentPeriodEnd, that means the plan renewed -> the counter
      // resets automatically. See updateUserUsage in the controller.
      weeklyUsageCycleEnd: { type: Date, default: null },

      // NOTE: monthly plan is fully unlimited — intentionally has no
      // counter here at all, nothing to track.
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
  },
);

userSchema.index({ createdAt: -1 });

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  delete obj.firebaseUid;
  return obj;
};

export default mongoose.model("User", userSchema);