import mongoose from "mongoose";
const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: { type: String, required: true },
    status: {
        type: String,
        enum: ["sent", "delivered", "read", "pending"],
        default: "pending",
    },
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who deleted this message
}, { timestamps: true });
export const Message = mongoose.model("Message", messageSchema);
