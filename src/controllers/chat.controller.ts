import { Request, Response } from "express";
import User from "../models/user.model.js";
import { Message } from "../models/chat.Model.js";
import { SOCKET_SERVER_URL } from "../index.js";
interface AuthenticateRequest extends Request {
  user?: any;
}
export const sendMessage = async (req: Request, res: Response) => {
  console.log("calling send message");
  try {
    const { senderId, receiverId, text } = req.body;
    // const sender = await User.findById(senderId);

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      text,
      status: "sent",
    });
    await message.save();

    res.status(201).json({ msg: "Message sent successfully!", message });
    return;
  } catch (error) {
    res.status(500).json({ msg: "Internal Server error", error });
    console.log(error);
    return;
  }
};

export const getMessages = async (req: AuthenticateRequest, res: Response) => {
  console.log("calling get messages");
  const { chatUserId } = req.params;
  const userId = req.user._id;
  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: chatUserId },
        { sender: chatUserId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });
    res.status(200).json({ messages });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal Server error", error: error.message });
    return;
  }
};

export const getConversations = async (
  req: AuthenticateRequest,
  res: Response
) => {
  const userId = req.user._id;
  try {
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
      // deletedBy: { $ne: userId }, // Exclude deleted conversations
    }).sort({ createdAt: -1 });

    const users = new Set();
    messages.forEach((msg) => {
      users.add(msg.sender.toString());
      users.add(msg.receiver.toString());
    });
    users.delete(userId.toString()); // Remove current user from the set
    const conversations = await User.find({ _id: { $in: Array.from(users) } });
    res.status(200).json(conversations);
    return;
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal Server error", error: error.message });
    return;
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  console.log("calling update status", status);

  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      res.status(404).json({ msg: "Message not found" });
      return;
    }
    await message.updateOne({ status });
    res.status(200).json({ msg: "Message status updated" });
    return;
  } catch (error) {}
};

// export const getUndeliveredMessages = async (
//   req: AuthenticateRequest,
//   res: Response
// ) => {
//   // Implementation to fetch undelivered messages from your database
//   console.log("calling get undelivered messages");
//   try {
//     const messages = await Message.find({
//       status: "sent",
//       sender: req.user._id,
//       receiver: req.params.receiverId,
//     });
//     res.status(200).json({ messages });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };
