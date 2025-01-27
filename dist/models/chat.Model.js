import mongoose from "mongoose";
const conversationSchema = new mongoose.Schema({
    participants: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    createdAt: { type: Date, default: Date.now },
});
export const Conversation = mongoose.model("Conversation", conversationSchema);
const messageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});
export const Message = mongoose.model("Message", messageSchema);
