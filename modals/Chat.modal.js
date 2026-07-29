import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        characterId: { type: Schema.Types.ObjectId, ref: "Character", required: true },

        // ---- Preloader selections, locked in once the chat starts ----
        preloader: {
            displayName: { type: String, required: true }, // fills {{user}}
            pronouns: {
                type: String,
                enum: ["He/Him", "She/Her", "They/Them"],
                required: true
            },
            firstMessage: {
                type: String,
                required: true,
                trim: true
            }
        },

        // ---- Memory Checkpoints (shown in App Drawer, newest first) ----
        checkpoints: [{
            text: { type: String, maxlength: 3000 }, // edit box caps at 500 words in UI
            atUserMessageCount: { type: Number, required: true }, // 30, 60, 90... drives sliding-window start
            edited: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now }
        }],

        worldState: {
            location: String,
            time: String,
            weather: String,

            currentSituation: String,
            currentMood: {
                type: String,
                enum: ["Red", "Orange", "Yellow", "Violet", "Blue", "Pink", "HotPink"]
            },

            introducedCharacters: [{
                name: String,
                role: String,
                personality: String,
                status: String,
                location: String
            }],

            storyMemory: [String]
        },

        lastMessage: {
            text: { type: String, default: "" },
            role: { type: String, enum: ["user", "assistant"] }
        },

        lastMessageAt: { type: Date, default: Date.now },

        messageCount: { type: Number, default: 0 }, // every row incl. continues, for UI/pagination
        userMessageCount: { type: Number, default: 0 }, // drives checkpoint & sliding-window logic

        sessionCount: { type: Number, default: 0 }
    },
    { timestamps: true }
);

chatSchema.index({ userId: 1, updatedAt: -1 });
chatSchema.index({ userId: 1, characterId: 1 }, { unique: true });

export default mongoose.model("Chat", chatSchema);