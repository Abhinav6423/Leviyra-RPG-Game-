// create/constantValues.js

// ==========================================
// 📐 CONSTANTS — Centralized Limits
// ==========================================
export const LIMITS = {
    name: 30,              // Max characters for name
    shortDescription: 25,  // Max words for short description
    longDescription: 2000, // Max words for long description
    personality: 3000,     // Max words for personality
    scenario: 3000,        // Max words for scenario
    dialogue: 1000,        // Max words per dialogue
    minImages: 1,          // Kam se kam 1 image chahiye
    maxImages: 8,          // Maximum 8 images upload kar sakte hain
    maxImageMB: 5,         // Max image size in MB
    aspectRatio: 2 / 3,    // Image ka width/height ratio
    maxPrimaryTags: 3,     // Maximum 3 primary tags
};