import mongoose, { Schema } from "mongoose";

const recentChatsSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // ADD THIS
    characterId: { type: Schema.Types.ObjectId, ref: "Character", required: true },
    lastMessageAt: { type: Date, default: Date.now }
});

export default mongoose.model("RecentChat", recentChatsSchema);