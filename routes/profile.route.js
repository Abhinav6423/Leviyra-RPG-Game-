import express from "express";
import { protect, verifyFirebaseToken } from "../middlewares/auth.middleware.js";
import {
  updateProfile,
  updateBannerPicture,
  updateProfilePicture,
  customizeProfileSettings,
  getPublicProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowingUser,
} from "../controllers/profile.controller.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.get("/public-profile/:userId", getPublicProfile);




router.put("/update", protect, upload.single("profilePicture"), updateProfile); // ✅ full DB check for profile updates

router.put("/update-banner", protect, upload.single("bannerPicture"), updateBannerPicture);

router.put("/update-profile-picture", protect, upload.single("profilePicture"), updateProfilePicture);

router.put("/customize-profile-settings", protect, customizeProfileSettings);


// ── Follow system ──
router.post("/follow/:userId", protect, followUser);

router.post("/unfollow/:userId", protect, unfollowUser);

router.get("/followers/:userId", protect, getFollowers); 

router.get("/following/:userId", protect, getFollowing); 

router.get("/is-following/:userId", protect, isFollowingUser); 




export default router;