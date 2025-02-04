var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Server } from "socket.io";
import { createServer } from "http";
import express from "express";
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
    },
});
const users = {}; // Stores userId -> socketId mapping
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User connected:", userId);
    if (userId) {
        users[userId] = socket.id;
        io.emit("getOnlineUsers", Object.keys(users));
    }
    socket.on("sendMessage", (message) => __awaiter(void 0, void 0, void 0, function* () {
        const receiverSocketId = users[message.receiver];
        const senderSocketId = users[message.sender];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", message);
            io.to(senderSocketId).emit("messageDelivered", Object.assign(Object.assign({}, message), { status: "delivered" }));
        }
    }));
    const updateLastSeen = (userId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield fetch("http://localhost:5000/api/chat/update-last-seen", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }),
            });
        }
        catch (error) {
            console.error("Error updating last seen:", error);
        }
    });
    socket.on("disconnect", () => {
        for (const id in users) {
            if (users[id] === socket.id) {
                console.log("User disconnected:", id);
                updateLastSeen(id);
                delete users[id];
                break;
            }
        }
        io.emit("getOnlineUsers", Object.keys(users));
    });
});
export { app, io, server };
