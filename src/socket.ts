// socket.js (Separate Socket.IO server)
import { Server } from "socket.io";
import http from "http";
import { configDotenv } from "dotenv";
import { connectToDB } from "./config/db.js";
import { Message } from "./models/chat.Model.js";
import express from "express";

configDotenv();
const app = express();

// Create separate HTTP server for Socket.IO
const socketServer = http.createServer(app);
// const port = process.env.SOCKET_PORT || 5001;

// Initialize Socket.IO
const io = new Server(socketServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Database connection
connectToDB();

const users: Record<string, string> = {};

export const getReceiverSocketId = (receiverId: string) => {
  return users[receiverId];
};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const userId = socket.handshake.query.userId as string;
  if (userId && userId !== "undefined") {
    users[userId] = socket.id;
    console.log(`User registered: ${userId} -> ${socket.id}`);
  }

  io.emit("getOnlineUsers", Object.keys(users));

  socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
    try {
      if (!message || !senderId || !receiverId) return;
      const newMessage = new Message({
        sender: senderId,
        receiver: receiverId,
        text: message,
      });
      await newMessage.save();

      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
        console.log(`Sent newMessage event to ${receiverSocketId}`);
      }
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${userId}`);
    delete users[userId];
    io.emit("getOnlineUsers", Object.keys(users));
  });
});

// Start Socket.IO server
// socketServer.listen(port, () => {
//   console.log(`Socket.IO server running on port ${port}`);
// });

export { app, io, socketServer };
