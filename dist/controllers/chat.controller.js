var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Conversation, Message } from "../models/chat.Model.js";
export const startConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { msg } = req.body;
    const senderId = req.user._id;
    const recieverId = req.params.userId;
    let conversation = yield Conversation.findOne({
        participants: { $all: [recieverId, senderId] },
    });
    if (!conversation) {
        // Create a new conversation
        conversation = new Conversation({ participants: [recieverId, senderId] });
        const message = new Message({
            conversation: conversation._id,
            content: msg,
            sender: senderId,
        });
        yield message.save();
        yield conversation.save();
    }
    return conversation;
});
export const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { msg } = req.body;
    const senderId = req.user._id;
    const recieverId = req.params.recieverId;
    if (!recieverId) {
        res.status(404).json({ msg: "Reciever id must" });
        return;
    }
    let conversation = yield Conversation.findOne({
        participants: { $all: [recieverId, senderId] },
    });
    if (!conversation) {
        conversation = new Conversation({ participants: [recieverId, senderId] });
        yield conversation.save();
    }
    const message = new Message({
        conversation: conversation._id,
        sender: senderId,
        content: msg,
    });
    yield conversation.save();
    yield message.save();
    res.status(200).json({ msg: "message sent" });
    return;
});
export const getMessages = (conversationId) => __awaiter(void 0, void 0, void 0, function* () {
    const messages = yield Message.find({ conversation: conversationId })
        .populate("sender", "username")
        .sort("timestamp");
    return messages;
});
