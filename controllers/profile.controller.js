import mongoose from "mongoose";
import multer from "multer";
import User from "../modals/User.modal.js";
import Character from "../modals/Character.modal.js";
import Follow from "../modals/Follower.modal.js";
// Adjust the path to wherever your uploadToImageKit function is defined
import { uploadToImageKit } from "../utils/imageKitUploadFunction.js";
import { hasActivePaidPlan } from "../utils/hasActivePaidPlan.js"; // Adjust the path as necessary

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, bio } = req.body || {};

    const updates = {};

    if (name) updates.username = name.trim();

    if (bio !== undefined) {
      const trimmedBio = bio.trim();

      if (trimmedBio.length > 2000) {
        return res.status(400).json({
          success: false,
          message: "Bio cannot exceed 2000 characters.",
        });
      }

      updates.bio = trimmedBio;
    }

    // Agar koi field hi nahi aaya to early return
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided to update",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { returnDocument: "after" },
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File too large (max 5MB allowed)",
        });
      }
      return res.status(400).json({ success: false, message: error.message });
    }

    if (error.message === "Only JPG, PNG, WEBP images allowed") {
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateBannerPicture = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Validate File Existence
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image file provided." });
    }

    // 2. Fetch user to verify existence (and check Pro status to be safe on backend)
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // usage bhi pass karna zaroori hai (pack ke liye packMessagesLeft check hota hai)
    const isPro = hasActivePaidPlan(user.subscription, user.usage);
    if (!isPro) {
      return res.status(403).json({
        success: false,
        message: "Custom banners require an active Pro subscription.",
      });
    }

    // 3. Upload to ImageKit utilizing the provided buffer
    const imageKitResult = await uploadToImageKit(req.file);

    if (!imageKitResult || !imageKitResult.url) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload image to ImageKit.",
      });
    }

    // 4. Update the DB with the new ImageKit URL
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "profileCustomizationSettings.bannerImage": imageKitResult.url,
        },
      },
      { returnDocument: "after" },
    );

    return res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      bannerImage: imageKitResult.url,
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE BANNER ERROR:", error);

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File too large (max 5MB allowed).",
        });
      }
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while updating the banner.",
    });
  }
};

export const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Validate File Existence
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image file provided." });
    }

    // 2. Fetch user to verify existence (and check Pro status to be safe on backend)
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const isPro = hasActivePaidPlan(user.subscription, user.usage);
    if (!isPro) {
      return res.status(403).json({
        success: false,
        message: "Custom profile pictures require an active Pro subscription.",
      });
    }

    // 3. Upload to ImageKit utilizing the provided buffer
    const imageKitResult = await uploadToImageKit(req.file);

    if (!imageKitResult || !imageKitResult.url) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload image to ImageKit.",
      });
    }

    // 4. Update the DB with the new ImageKit URL
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          profilePicture: imageKitResult.url,
        },
      },
      { returnDocument: "after" },
    );

    return res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      profilePicture: imageKitResult.url,
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE PROFILE PICTURE ERROR:", error);

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File too large (max 5MB allowed).",
        });
      }
      return res.status(400).json({ success: false, message: error.message });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "An error occurred while updating the profile picture.",
    });
  }
};

export const customizeProfileSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Backend check: sirf Pro members (monthly ya pack) customize kar sakte hain
    const isPro = hasActivePaidPlan(user.subscription, user.usage);
    if (!isPro) {
      return res.status(403).json({
        success: false,
        message: "Custom profile settings require an active Pro subscription.",
      });
    }
    const {
      colorTheme,
      avatarRingColor,
      avatarRingThickness,
      typography,
      bannerImage,
      buttonStyles,
      profileTag,
    } = req.body;

    // Build update object using dot notation for nested fields
    const updates = {};

    if (colorTheme !== undefined)
      updates["profileCustomizationSettings.colorTheme"] = colorTheme;
    if (avatarRingColor !== undefined)
      updates["profileCustomizationSettings.avatarRingColor"] = avatarRingColor;
    if (avatarRingThickness !== undefined)
      updates["profileCustomizationSettings.avatarRingThickness"] =
        avatarRingThickness;
    if (typography !== undefined)
      updates["profileCustomizationSettings.typography"] = typography;
    if (bannerImage !== undefined)
      updates["profileCustomizationSettings.bannerImage"] = bannerImage;
    if (buttonStyles !== undefined)
      updates["profileCustomizationSettings.buttonStyles"] = buttonStyles;
    if (profileTag !== undefined)
      updates["profileCustomizationSettings.profileTag"] = profileTag;

    // If no fields were provided, return early
    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No settings provided to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { returnDocument: "after" },
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile customization updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UPDATE PROFILE CUSTOMIZATION ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password -email"); // Exclude sensitive fields

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const characters = await Character.find({ creator: user._id }).select(
      "name images",
    ); // Fetch characters with only name and avatar

    return res.status(200).json({ success: true, user, characters });
  } catch (error) {
    console.error("GET PUBLIC PROFILE ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────
// FOLLOW / UNFOLLOW / FOLLOWERS / FOLLOWING
// ─────────────────────────────────────────────

export const followUser = async (req, res) => {
  const followerId = req.user._id;
  const { userId: targetId } = req.params;

  if (followerId.toString() === targetId.toString()) {
    return res
      .status(400)
      .json({ success: false, message: "You can't follow yourself" });
  }

  const session = await mongoose.startSession();
  try {
    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await session.withTransaction(async () => {
      await Follow.create([{ follower: followerId, following: targetId }], {
        session,
      });

      await User.updateOne(
        { _id: followerId },
        { $inc: { followingCount: 1 } },
        { session },
      );
      await User.updateOne(
        { _id: targetId },
        { $inc: { followersCount: 1 } },
        { session },
      );
    });

    return res
      .status(200)
      .json({ success: true, message: "User followed successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You are already following this user",
      });
    }
    console.error("FOLLOW USER ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    session.endSession();
  }
};

export const unfollowUser = async (req, res) => {
  const followerId = req.user._id;
  const { userId: targetId } = req.params;

  const session = await mongoose.startSession();
  try {
    let didUnfollow = false;

    await session.withTransaction(async () => {
      const result = await Follow.deleteOne(
        { follower: followerId, following: targetId },
        { session },
      );

      if (result.deletedCount === 0) return; // wasn't following, no-op

      didUnfollow = true;

      await User.updateOne(
        { _id: followerId },
        { $inc: { followingCount: -1 } },
        { session },
      );
      await User.updateOne(
        { _id: targetId },
        { $inc: { followersCount: -1 } },
        { session },
      );
    });

    if (!didUnfollow) {
      return res
        .status(400)
        .json({ success: false, message: "You are not following this user" });
    }

    return res
      .status(200)
      .json({ success: true, message: "User unfollowed successfully" });
  } catch (error) {
    console.error("UNFOLLOW USER ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    session.endSession();
  }
};

export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const followers = await Follow.find({ following: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("follower", "username profilePicture bio");

    return res.status(200).json({
      success: true,
      followers: followers.map((f) => f.follower),
      page,
      limit,
      totalFollowers: user.followersCount,
    });
  } catch (error) {
    console.error("GET FOLLOWERS ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const following = await Follow.find({ follower: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("following", "username profilePicture bio");

    return res.status(200).json({
      success: true,
      following: following.map((f) => f.following),
      page,
      limit,
      totalFollowing: user.followingCount,
    });
  } catch (error) {
    console.error("GET FOLLOWING ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const isFollowingUser = async (req, res) => {
  try {
    const followerId = req.user._id;
    const { userId: targetId } = req.params;

    const exists = await Follow.exists({
      follower: followerId,
      following: targetId,
    });

    return res.status(200).json({ success: true, isFollowing: !!exists });
  } catch (error) {
    console.error("IS FOLLOWING ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
