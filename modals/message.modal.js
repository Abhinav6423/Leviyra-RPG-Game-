import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
    {
        chatId: {
            type: Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
            index: true
        },

        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true
        },

        content: [
            {
                type: String,
                required: true,
                trim: true
            }
        ],

        // 🔥 OPTIONAL (for RP style like Janitor)
        formatted: {
            dialogue: { type: String },
            action: { type: String },
            emotion: { type: String }
        },

        diceRoll: {
            type: Number,
            min: 0,
            max: 6,
            default: null
        },



        // selectAlternate karne par current content yahan se pick hone ke baad
        // is index ko track karna ho to (optional, frontend ChatArea already
        // isko msg.selectedAlternateIndex se expect karta hai)
        selectedAlternateIndex: {
            type: Number,
            default: null
        },

        // editMessage controller isse true karta hai jab message edit hota hai
        isEdited: {
            type: Boolean,
            default: false
        },

        // continueMessage controller isse true karke naya row banata hai
        isContinuation: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// ⚡ important for fast pagination
messageSchema.index({ chatId: 1, createdAt: -1 });

export default mongoose.model("Message", messageSchema);