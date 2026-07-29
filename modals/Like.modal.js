import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema({
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
    }
}, {
    timestamps: true
})

export default mongoose.model("Like", likeSchema)