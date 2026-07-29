import Character from "../modals/Character.modal.js";
import Chat from "../modals/Chat.modal.js";
import {
  uploadToImageKit,
  deleteFromImageKit,
} from "../utils/imageKitUploadFunction.js";

import pLimit from "p-limit";
import mongoose from "mongoose";
const limit = pLimit(8); // max 8 uploads at once

// optimized create character controller
export const createCharacter = async (req, res) => {
  let uploadedImages = [];

  try {
    // -------------------------
    // 🔹 1. Get all fields from request body
    // -------------------------
    let {
      name,
      shortDescription,
      longDescription,
      personality,
      scenario,
      status,
      isPublic, // Arrives as string "true" or "false"
      hideDescription, // Arrives as string "true" or "false"
      primaryTags, // Arrives as stringified JSON array
      secondaryTags, // Arrives as stringified JSON array
      firstDialogues, // Arrives as stringified JSON array
    } = req.body;

    // -------------------------
    // 🔹 2. Trim Standard Strings
    // -------------------------
    const trim = (v) => (typeof v === "string" ? v.trim() : v);

    name = trim(name);
    shortDescription = trim(shortDescription);
    longDescription = trim(longDescription);
    personality = trim(personality);
    scenario = trim(scenario);
    status = trim(status) || "draft";

    // -------------------------
    // 🔹 3. Parse Booleans
    // -------------------------
    const parsedIsPublic = isPublic === "true";
    const parsedHideDescription = hideDescription === "true";

    // -------------------------
    // 🔹 4. Safe Parsing for Arrays
    // -------------------------
    const safeParseArray = (data, fieldName) => {
      let parsed = [];
      try {
        parsed = typeof data === "string" ? JSON.parse(data) : data;
        if (!Array.isArray(parsed)) throw new Error();
        return parsed;
      } catch {
        throw new Error(`${fieldName} must be a valid array`);
      }
    };

    let parsedPrimaryTags = [];
    let parsedSecondaryTags = [];
    let parsedFirstDialogues = [];

    try {
      parsedPrimaryTags = safeParseArray(primaryTags, "Primary tags");
      parsedSecondaryTags = safeParseArray(secondaryTags, "Secondary tags");

      // Handle dialogues specific formatting
      parsedFirstDialogues = safeParseArray(firstDialogues, "First dialogues");
      parsedFirstDialogues = parsedFirstDialogues
        .map((msg) => trim(msg))
        .filter((msg) => msg !== "");

      if (parsedFirstDialogues.length === 0) {
        throw new Error(
          "First dialogues must contain at least one valid message",
        );
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    // -------------------------
    // 🔹 5. Required Fields Check
    // -------------------------
    if (
      !name ||
      !shortDescription ||
      !longDescription ||
      !scenario ||
      parsedPrimaryTags.length === 0 ||
      parsedFirstDialogues.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // -------------------------
    // 🔹 6. Upload Images (Controlled)
    // -------------------------
    const files = req.files || [];

    if (files.length > 8) {
      return res.status(400).json({
        success: false,
        message: "Max 8 images allowed",
      });
    }

    uploadedImages = await Promise.all(
      files.map((file) =>
        limit(async () => {
          const uploaded = await uploadToImageKit(file);
          return {
            url: uploaded.url,
            fileId: uploaded.fileId,
          };
        }),
      ),
    );

    // -------------------------
    // 🔹 7. Create in DB
    // -------------------------
    const character = await Character.create({
      creator: req.user._id,
      name,
      shortDescription,
      longDescription,
      personality,
      scenario,
      firstDialogues: parsedFirstDialogues,
      primaryTags: parsedPrimaryTags,
      secondaryTags: parsedSecondaryTags,
      isPublic: parsedIsPublic,
      hideDescription: parsedHideDescription,
      images: uploadedImages,
      status,
    });

    return res.status(201).json({
      success: true,
      data: character,
    });
  } catch (error) {
    console.error("Create Character Error:", error.message);

    // -------------------------
    // 🔹 8. Rollback uploads on DB error
    // -------------------------
    if (uploadedImages.length > 0) {
      await Promise.allSettled(
        uploadedImages.map((img) => deleteFromImageKit(img.fileId)),
      );
    }

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// optimized delete character controller
export const deleteCharacter = async (req, res) => {
  try {
    // we get the character ID from the request parameters and validate it to ensure it's a valid MongoDB ObjectId. This is important because if we try to query the database with an invalid ID, it can lead to errors or unintended behavior. By checking the validity of the ID early on, we can return a clear error message to the client and avoid unnecessary database queries, which improves the efficiency and reliability of our API.
    const { id } = req.params;

    // Invalid MongoDB ObjectId — early return
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid character ID" });
    }

    const character = await Character.findOneAndDelete({
      _id: id,
      creator: req.user._id,
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        message: "Character not found or not authorized",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Character deleted successfully" });
  } catch (error) {
    console.error("DELETE CHARACTER ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// optimized get public characters controller
export const getPublicCharacters = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { primaryTags } = req.params;

    console.log(
      "Fetching public characters with primaryTags:",
      primaryTags,
      "for user:",
      userId,
    );
    const { page = 1, limit = 10 } = req.query;

    // 🔐 Auth check
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // 🔹 Build query
    const query = { status: "published" };

    if (primaryTags && primaryTags !== "all") {
      // Split by comma, trim spaces, and make each tag a case-insensitive Regex
      const tagsArray = primaryTags
        .split(",")
        .map((tag) => new RegExp(`^${tag.trim()}$`, "i"));

      query.primaryTags = { $in: tagsArray };
    }

    // 🔹 Pagination calc
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(20, Number(limit)); // cap limit to avoid abuse
    const skip = (pageNum - 1) * limitNum;

    // 🔹 Parallel DB calls (faster)
    const [characters, total] = await Promise.all([
      Character.find(query)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limitNum)
        .select("-__v")
        .populate("creator", "username profilePicture")
        .lean(),

      Character.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      total,
      count: characters.length,
      data: characters,
    });
  } catch (error) {
    console.error("Get Public Characters Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching public characters",
    });
  }
};

// optimized get my characters controller
export const getMyCharacters = async (req, res) => {
  try {
    const userId = req.user._id;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter = {
      creator: userId,
    };

    const filterType = (req.query.filter || "all").toLowerCase();

    switch (filterType) {
      case "draft":
        filter.status = "draft";
        break;

      case "published":
        filter.status = "published";
        break;

      case "public":
        filter.isPublic = true;
        break;

      case "private":
        filter.isPublic = false;
        break;

      case "all":
      default:
        break;
    }

    const [characters, total] = await Promise.all([
      Character.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-__v"),

      Character.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      filter: filterType,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalCharacters: total,
      count: characters.length,
      data: characters,
    });
  } catch (error) {
    console.error("GET MY CHARACTERS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getCharacterById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid character ID" });
    }

    const character = await Character.findById(id)
      .populate("creator", "username profilePicture")
      .select("-__v -comments");

    if (!character) {
      return res
        .status(404)
        .json({ success: false, message: "Character not found" });
    }

    // 🔧 creator may be null if the referenced User was deleted / left the app.
    // Instead of blocking access, fall back to a placeholder so the
    // character remains viewable/chattable.
    const creatorExists = Boolean(character.creator);
    const isCreator =
      creatorExists &&
      userId &&
      character.creator._id.toString() === userId.toString();

    if (!isCreator) {
      if (character.status === "draft") {
        return res.status(403).json({
          success: false,
          message: "This character is in draft mode.",
        });
      }
      if (character.isPublic === false) {
        return res
          .status(403)
          .json({ success: false, message: "This character is private." });
      }
    }

    const characterData = character.toObject();

    // Replace the dead/null creator reference with a clear placeholder
    // instead of leaving it null (which would break frontend rendering).
    if (!creatorExists) {
      characterData.creator = {
        username: "Unknown",
        profilePicture: null,
        deleted: true, // frontend can use this to show "left the app" copy
      };
    }

    if (!isCreator && character.hideDescription === true) {
      delete characterData.personality;
      delete characterData.scenario;
      delete characterData.firstDialogues;
    }

    const totalComments = await Character.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $project: { commentsCount: { $size: { $ifNull: ["$comments", []] } } },
      },
    ]);

    const commentsCount = totalComments[0]?.commentsCount || 0;
    characterData.commentsCount = commentsCount;

    return res.status(200).json({
      success: true,
      data: characterData,
    });
  } catch (error) {
    console.error("GET CHARACTER BY ID ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==========================================
// 2. NEW: Paginated Comments Fetcher
// ==========================================
export const getCharacterComments = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid character ID" });
    }

    const skip = (page - 1) * limit;

    // OPTIMIZATION: Only load a small "slice" of the array starting from the end (newest)
    const character = await Character.findById(id)
      .select("comments")
      .slice("comments", [-(skip + limit), limit]) // Get the chunk from the end of the array
      .populate("comments.user", "username id profilePicture");

    if (!character) {
      return res
        .status(404)
        .json({ success: false, message: "Character not found" });
    }

    // Mongoose $slice from the end returns them in chronological order,
    // we reverse it so the absolute newest is at the top index [0]
    const comments = character.comments.reverse();

    return res.status(200).json({
      success: true,
      comments: comments,
      hasNextPage: comments.length === limit,
      nextPage: page + 1,
    });
  } catch (error) {
    console.error("GET COMMENTS ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ==========================================
// 3. UPDATE CHARACTER
// ==========================================

export const updateCharacter = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid character ID" });
    }

    // 2. Destructure raw fields from req.body (These arrive as strings from FormData)
    const {
      name,
      shortDescription,
      longDescription,
      primaryTags,
      secondaryTags,
      personality,
      scenario,
      firstDialogues,
      isPublic,
      hideDescription,
      status,
      existingImages,
    } = req.body;

    // Helper function to safely parse stringified JSON arrays sent via FormData
    const parseArray = (data) => {
      if (!data) return undefined;
      if (typeof data === "string") {
        try {
          return JSON.parse(data);
        } catch (e) {
          return [data]; // Fallback to single-item array if parsing fails
        }
      }
      return Array.isArray(data) ? data : [data];
    };

    // ==========================================
    // 3. HANDLE IMAGES (Existing + New)
    // Schema requires each image as { url, fileId } — never a plain string.
    // ==========================================

    // existingImages arrives as a JSON string of [{ url, fileId }, ...] from the frontend.
    // Guard against any legacy/plain-string entries slipping through.
    const rawExisting = parseArray(existingImages) || [];
    const parsedExistingImages = rawExisting
      .map((img) => (typeof img === "string" ? null : img)) // drop malformed plain strings
      .filter(Boolean);

    const newImageFiles = req.files || [];

    // Validation for maximum images
    if (parsedExistingImages.length + newImageFiles.length > 8) {
      return res.status(400).json({
        success: false,
        message: "Maximum 8 images allowed in total.",
      });
    }

    // Upload new images to ImageKit concurrently
    const newUploadedImages = [];
    if (newImageFiles.length > 0) {
      const uploadPromises = newImageFiles.map((file) =>
        uploadToImageKit(file),
      );
      const uploadResults = await Promise.all(uploadPromises);

      uploadResults.forEach((result) => {
        // ✅ push the full object the schema expects, not just the URL string
        newUploadedImages.push({ url: result.url, fileId: result.fileId });
      });
    }

    // Combine arrays — both sides are now { url, fileId } objects
    const finalImages = [...parsedExistingImages, ...newUploadedImages];

    // ==========================================
    // 4. BUILD UPDATES OBJECT
    // ==========================================
    const updates = {};

    // Strings
    if (name !== undefined) updates.name = name.trim();
    if (shortDescription !== undefined)
      updates.shortDescription = shortDescription.trim();
    if (longDescription !== undefined)
      updates.longDescription = longDescription.trim();
    if (personality !== undefined) updates.personality = personality.trim();
    if (scenario !== undefined) updates.scenario = scenario.trim();
    if (status !== undefined) updates.status = status.trim();

    // Arrays (Parsed)
    if (primaryTags !== undefined)
      updates.primaryTags = parseArray(primaryTags);
    if (secondaryTags !== undefined)
      updates.secondaryTags = parseArray(secondaryTags);
    if (firstDialogues !== undefined)
      updates.firstDialogues = parseArray(firstDialogues);

    // Booleans (Explicitly checking string 'true')
    if (isPublic !== undefined)
      updates.isPublic = isPublic === "true" || isPublic === true;
    if (hideDescription !== undefined)
      updates.hideDescription =
        hideDescription === "true" || hideDescription === true;

    // Images — only overwrite if we actually have at least one valid image,
    // otherwise an edit with zero image changes would wipe the array.
    if (finalImages.length > 0) updates.images = finalImages;

    // ==========================================
    // 5. DATABASE UPDATE
    // ==========================================

    const updatedCharacter = await Character.findOneAndUpdate(
      { _id: id, creator: userId },
      { $set: updates },
      { returnDocument: "after", new: true, runValidators: true },
    );

    if (!updatedCharacter) {
      return res.status(404).json({
        success: false,
        message: "Character not found or not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Character updated successfully",
      data: updatedCharacter,
    });
  } catch (error) {
    console.error("UPDATE CHARACTER ERROR:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during update" });
  }
};

// optimized comment on character
// 💡 Revised
export const commentOnCharacter = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid character ID" });
    }

    if (!comment?.trim() || comment.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Comment must be between 1–500 characters",
      });
    }

    const newComment = {
      user: userId,
      text: comment.trim(),
      time: new Date(),
    };

    const character = await Character.findByIdAndUpdate(
      id,
      { $push: { comments: newComment } },
      { returnDocument: "after" },
    );

    if (!character) {
      return res
        .status(404)
        .json({ success: false, message: "Character not found" });
    }

    // ✅ Sirf naya comment return karo — poora character nahi
    const addedComment = character.comments[character.comments.length - 1];

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: addedComment,
    });
  } catch (error) {
    console.error("COMMENT ON CHARACTER ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const topTrendingCharacters = async (req, res) => {
  try {
    const topCharacters = await Chat.aggregate([
      // 1. Group by characterId and sum messages
      {
        $group: {
          _id: "$characterId",
          totalMessages: { $sum: { $ifNull: ["$messageCount", 0] } },
        },
      },
      // 2. Sort by most messages
      { $sort: { totalMessages: -1 } },
      // 3. Buffer limit — fetch more before filtering so we always get 5 public ones
      { $limit: 50 },
      // 4. Lookup character details
      {
        $lookup: {
          from: "characters",
          localField: "_id",
          foreignField: "_id",
          as: "char",
        },
      },
      { $unwind: "$char" },
      // 5. Filter public characters only
      { $match: { "char.status": "published" } },
      // 6. Final top 5
      { $limit: 5 },
      {
        $project: {
          _id: "$char._id",
          characterName: "$char.name",
          characterDescription: "$char.shortDescription",
          status: "$char.status",
          category: { $arrayElemAt: ["$char.primaryTags", 0] },
          profilePicture: { $arrayElemAt: ["$char.images.url", 0] },
          traits: "$char.secondaryTags",
          messageCount: "$totalMessages",
        },
      },
    ]);

    return res.status(200).json({ success: true, data: topCharacters });
  } catch (error) {
    console.error("GET TOP TRENDING ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getSearchedCharacters = async (req, res) => {
  try {
    const { searchTerm } = req.query;
    const trimmedQuery = searchTerm?.trim();

    if (!trimmedQuery) {
      return res
        .status(400)
        .json({ success: false, message: "Search term is required" });
    }

    // Define the case-insensitive regex once
    const searchRegex = { $regex: trimmedQuery, $options: "i" };

    const characters = await Character.find({
      $or: [
        { name: searchRegex },
        { primaryTags: searchRegex },
        { secondaryTags: searchRegex },
      ],
    });

    return res.status(200).json({ success: true, data: characters });
  } catch (error) {
    console.error("GET SEARCHED CHARACTERS ERROR:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
