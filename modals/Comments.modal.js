import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        characterId: {
            type: Schema.Types.ObjectId,
            ref: "Character",
            required: true,
            index: true
        },
        comment: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Comment", commentSchema);