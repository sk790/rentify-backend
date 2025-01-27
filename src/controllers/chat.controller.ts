import { Request, Response } from "express";
import { Conversation, Message } from "../models/chat.Model.js";

interface AuthenticateRequest extends Request {
  user?: any;
}

export const startConversation = async (
  req: AuthenticateRequest,
  res: Response
) => {
  const { msg } = req.body;
  const senderId = req.user._id;
  const recieverId = req.params.userId;
  let conversation = await Conversation.findOne({
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
    await message.save();
    await conversation.save();
  }
  return conversation;
};

export const sendMessage = async (req: AuthenticateRequest, res: Response) => {
  const { msg } = req.body;
  const senderId = req.user._id;
  const recieverId = req.params.recieverId;
  if (!recieverId) {
    res.status(404).json({ msg: "Reciever id must" });
    return;
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [recieverId, senderId] },
  });
  if (!conversation) {
    conversation = new Conversation({ participants: [recieverId, senderId] });
    await conversation.save();
  }
  const message = new Message({
    conversation: conversation._id,
    sender: senderId,
    content: msg,
  });
  await conversation.save();
  await message.save();
  res.status(200).json({ msg: "message sent" });
  return;
};

export const getMessages = async (conversationId: string) => {
  const messages = await Message.find({ conversation: conversationId })
    .populate("sender", "username")
    .sort("timestamp");
  return messages;
};
