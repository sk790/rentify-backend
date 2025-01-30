var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import User from "../models/user.model.js";
import { Message } from "../models/chat.Model.js";
export const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { senderId, receiverId, text } = req.body;
        // const sender = await User.findById(senderId);
        const message = new Message({
            sender: senderId,
            receiver: receiverId,
            text,
        });
        yield message.save();
        res.status(201).json({ msg: "Message sent successfully!", message });
        return;
    }
    catch (error) {
        res.status(500).json({ msg: "Internal Server error", error });
    }
});
export const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("calling get messages");
    const { chatUserId } = req.params;
    const userId = req.user._id;
    try {
        const messages = yield Message.find({
            $or: [
                { sender: userId, receiver: chatUserId },
                { sender: chatUserId, receiver: userId },
            ],
        }).sort({ createdAt: 1 });
        res.status(200).json({ messages });
        return;
    }
    catch (error) {
        res
            .status(500)
            .json({ msg: "Internal Server error", error: error.message });
        return;
    }
});
export const getConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user._id;
    try {
        const messages = yield Message.find({
            $or: [{ sender: userId }, { receiver: userId }],
            // deletedBy: { $ne: userId }, // Exclude deleted conversations
        }).sort({ createdAt: -1 });
        const users = new Set();
        messages.forEach((msg) => {
            users.add(msg.sender.toString());
            users.add(msg.receiver.toString());
        });
        // users.delete(userId); // Remove self from conversations
        const conversations = yield User.find({ _id: { $in: Array.from(users) } });
        res.status(200).json(conversations);
        return;
    }
    catch (error) {
        res
            .status(500)
            .json({ msg: "Internal Server error", error: error.message });
        return;
    }
});
