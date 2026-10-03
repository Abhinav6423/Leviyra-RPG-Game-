import mongoose, { Schema } from "mongoose";

// ==========================================
// 🛠️ HELPER: Word Count Validator
// ==========================================
const wordCountValidator = (maxWords) => {
    return function (value) {
        if (!value) return true; // Let standard 'required' check handle empty strings
        return value.trim().split(/\s+/).filter(Boolean).length <= maxWords;
    };
};

const characterSchema = new Schema(
    {
        creator: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // ── 1. CORE FEATURES ──
        name: { // 🔄 CHANGED: characterName -> name
            type: String,
            required: [true, "Character name is required"],
            trim: true,
            maxlength: [30, "Character name cannot exceed 30 characters"]
        },
        shortDescription: {
            type: String,
            required: [true, "Short description is required"],
            trim: true,
            validate: [wordCountValidator(25), "Short description cannot exceed 25 words"]
        },
        longDescription: {
            type: String,
            required: [true, "Long description is required"],
            trim: true,
            validate: [wordCountValidator(2000), "Long description cannot exceed 2000 words"]
        },

        // ── 2. TAGS ──
        primaryTags: { // 🔄 CHANGED: category (String) -> primaryTags (Array of Strings)
            type: [{
                type: String,
                enum: {
                    values: [
                        "Dead Dove", "Fantasy", "Medieval", "Slice of Life",
                        "Thriller", "Mystery", "Comedy", "Sci Fi", "Magic", "Furrball"
                    ],
                    message: "{VALUE} is not a valid Primary Tag"
                }
            }],
            required: [true, "At least one primary tag is required"],
            validate: [arr => arr.length > 0, "Primary tag array cannot be empty"]
        },
        secondaryTags: { // 🔄 CHANGED: traits -> secondaryTags
            type: [String],
            default: [],
            validate: [arr => arr.length <= 20, "Cannot exceed 20 custom tags"]
        },

        // ── 3. NARRATIVE ──
        personality: {
            type: String,
            trim: true,
            validate: [wordCountValidator(3000), "Personality cannot exceed 3000 words"]
        },
        scenario: {
            type: String,
            trim: true,
            validate: [wordCountValidator(3000), "Scenario cannot exceed 3000 words"]
        },
        firstDialogues: { // 🔄 CHANGED: startingMessage -> firstDialogues
            type: [String],
            required: [true, "At least one starting dialogue is required"],
            validate: [
                {
                    validator: (arr) => arr.length > 0,
                    message: "At least one starting dialogue is required"
                },
                {
                    validator: (arr) => arr.every(msg => wordCountValidator(1000)(msg)),
                    message: "Each dialogue must not exceed 1000 words"
                }
            ]
        },

        // ── 4. VISUALS ──
        images: {
            type: [
                {
                    url: { type: String, required: true },
                    fileId: { type: String, required: true }
                }
            ],
            required: true,
            validate: [
                { validator: arr => arr.length >= 1, message: "At least 1 image is required" },
                { validator: arr => arr.length <= 8, message: "Max 8 images allowed" }
            ]
        },

        // ── 5. VISIBILITY & PUBLISHING ──
        isPublic: {
            type: Boolean,
            default: true 
        },
        hideDescription: {
            type: Boolean,
            default: false 
        },
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft"
        },

        // ── 6. COMMUNITY STATS (For Trending Page) ──
        likesCount: {
            type: Number,
            default: 0
        },
        interactionsCount: {
            type: Number,
            default: 0
        },
        comments: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: true
                },
                text: {
                    type: String,
                    required: true
                },
                time: {
                    type: Date,
                    default: Date.now
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

// ==========================================
// 🚀 INDEX OPTIMIZATION
// ==========================================
characterSchema.index({ creator: 1, createdAt: -1 });
characterSchema.index({ isPublic: 1, interactionsCount: -1, likesCount: -1 });

// 🔄 CHANGED: category -> primaryTags (For explore page optimization)
characterSchema.index({ isPublic: 1, primaryTags: 1 }); 

export default mongoose.model("Character", characterSchema);