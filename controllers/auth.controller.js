import User from "../modals/User.modal.js";
import { uploadToImageKit } from "../utils/imageKitUploadFunction.js";

const sanitizeUsername = (name) => {
  return name?.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 30) || "user";
};

const IMAGEKIT_DOMAIN = "ik.imagekit.io";

const isGoogleAvatarUrl = (url) =>
  !!url && url.includes("googleusercontent.com");
const isAlreadyMirrored = (url) => !!url && url.includes(IMAGEKIT_DOMAIN);

const mirrorGoogleAvatar = async (uid, googleUrl) => {
  const response = await fetch(googleUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch Google avatar (status ${response.status})`,
    );
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const result = await uploadToImageKit({
    buffer,
    originalname: `avatar-${uid}.jpg`,
  });
  return result.url;
};

const resolveProfilePicture = async (
  uid,
  existingProfilePicture,
  incomingPicture,
) => {
  if (!incomingPicture) return existingProfilePicture;
  if (isAlreadyMirrored(existingProfilePicture)) return existingProfilePicture;
  if (!isGoogleAvatarUrl(incomingPicture)) return incomingPicture;

  try {
    return await mirrorGoogleAvatar(uid, incomingPicture);
  } catch (err) {
    console.error(
      `Failed to mirror Google avatar for uid ${uid}:`,
      err.message,
    );
    return existingProfilePicture || incomingPicture;
  }
};

export const syncUser = async (req, res) => {
  try {
    const { uid, email, picture, firebase } = req.userDecoded;

    const rawUsername = req.body.username || email?.split("@")[0] || "user";
    const username = sanitizeUsername(rawUsername);
    const provider =
      firebase?.sign_in_provider === "google.com" ? "google" : "email";

    // Returning user — match by firebaseUid
    let existingUser = await User.findOne({ firebaseUid: uid });

    if (existingUser) {
      const finalProfilePicture = await resolveProfilePicture(
        uid,
        existingUser.profilePicture,
        picture,
      );

      const user = await User.findOneAndUpdate(
        { firebaseUid: uid },
        {
          $set: {
            email,
            profilePicture: finalProfilePicture,
            lastLoginAt: new Date(),
          },
        },
        { returnDocument: "after" },
      );

      return res.status(200).json({ success: true, user });
    }

    // Match by email (e.g. linking Google to an existing email/password account)
    existingUser = await User.findOne({ email });

    if (existingUser) {
      const finalProfilePicture = await resolveProfilePicture(
        uid,
        existingUser.profilePicture,
        picture,
      );

      const user = await User.findOneAndUpdate(
        { email },
        {
          $set: {
            firebaseUid: uid,
            profilePicture: finalProfilePicture,
            lastLoginAt: new Date(),
          },
        },
        { returnDocument: "after" },
      );

      return res.status(200).json({ success: true, user });
    }

    // Brand new user
    const initialProfilePicture = await resolveProfilePicture(
      uid,
      null,
      picture,
    );

    let user = null;
    let counter = 0;

    while (!user) {
      const finalUsername = counter === 0 ? username : `${username}${counter}`;

      try {
        user = await User.create({
          firebaseUid: uid,
          email,
          username: finalUsername,
          provider,
          profilePicture: initialProfilePicture || "",
          isVerified: provider === "google",
          lastLoginAt: new Date(),
        });
      } catch (err) {
        if (err.code === 11000 && err.keyPattern?.username) {
          counter++;
        } else if (
          err.code === 11000 &&
          (err.keyPattern?.firebaseUid || err.keyPattern?.email)
        ) {
          user = await User.findOne({ $or: [{ firebaseUid: uid }, { email }] });
          break;
        } else {
          throw err;
        }
      }
    }

    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("SYNC USER ERROR:", err);
    return res
      .status(500)
      .json({ success: false, message: "User sync failed" });
  }
};

export const getMe = async (req, res) => {
  try {
    const { uid } = req.userDecoded;

    const user = await User.findOne({ firebaseUid: uid });
      

    if (!user)
      return res
        .status(404)
        .json({
          success: false,
          code: "USER_NOT_FOUND",
          message: "User not found",
        });

    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("GET ME ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const changeChatCustomizationSettings = async (req, res) => {
  try {
    const { uid } = req.userDecoded;
    const { skin, font, avatarRings, bubbleStyle } = req.body;

    const user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      {
        $set: {
          chatCustomizationSettings: { skin, font, avatarRings, bubbleStyle },
        },
      },
      { returnDocument: "after" },
    );
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("CHANGE CHAT CUSTOMIZATION SETTINGS ERROR:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
