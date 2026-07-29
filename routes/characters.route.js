import express from "express";
import {
    createCharacter,
    deleteCharacter,
    getMyCharacters,
    getCharacterById,
    getPublicCharacters,
    commentOnCharacter,
    topTrendingCharacters,
    getSearchedCharacters,
    getCharacterComments,
    updateCharacter,
} from "../controllers/character.controller.js";

import upload from "../middlewares/multer.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();


// ================= ROUTES =================

// 🔥 CREATE CHARACTER (no backend image validation)
router.post(
    "/create",
    protect,
    upload.array("images", 8),
    createCharacter
);

// 🔥 GET ALL CHARACTERS (public)
router.get("/public/:primaryTags", protect, getPublicCharacters);

// 🔥 GET MY CHARACTERS
router.get("/my", protect, getMyCharacters);

// 🔥 TRENDING
router.get("/trending", protect, topTrendingCharacters);

// 🔥 SEARCH CHARACTERS
router.get("/search", protect, getSearchedCharacters);

// 🔥 GET BY ID
router.get("/:id", protect, getCharacterById);

// 🔥 UPDATE CHARACTER
router.patch(
    "/:id",
    protect,
    upload.array("images", 8), // Included so you can handle new image uploads via form-data
    updateCharacter
);

// 🔥 DELETE
router.delete("/:id", protect, deleteCharacter);

// 🔥 GET COMMENTS
router.get('/:id/comments', getCharacterComments);

// 🔥 COMMENT
router.post("/:id/comments", protect, commentOnCharacter);


export default router;