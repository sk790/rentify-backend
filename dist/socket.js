var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// socket.js (Separate Socket.IO server)
import { Server } from "socket.io";
import http from "http";
import { configDotenv } from "dotenv";
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
// connectToDB();
const users = {};
export const getReceiverSocketId = (receiverId) => {
    return users[receiverId];
};
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    const userId = socket.handshake.query.userId;
    if (userId && userId !== "undefined") {
        users[userId] = socket.id;
        console.log(`User registered: ${userId} -> ${socket.id}`);
    }
    io.emit("getOnlineUsers", Object.keys(users));
    socket.on("sendMessage", (_a) => __awaiter(void 0, [_a], void 0, function* ({ senderId, receiverId, message }) {
        if (!message || !senderId || !receiverId)
            return;
        const newMessage = {
            sender: senderId,
            receiver: receiverId,
            text: message,
        };
        console.log(newMessage);
        if (senderId === receiverId)
            return;
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
            console.log(`Sent newMessage event to ${receiverSocketId}`);
        }
    }));
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
