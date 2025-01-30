var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import { connectToDB } from "./config/db.js";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Server } from "socket.io";
import { Message } from "./models/chat.Model.js";
configDotenv();
import authRouter from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
const port = process.env.PORT || 5000;
const app = express();
// Middleware
connectToDB();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
}));
app.use("/api/auth", authRouter);
app.use("/api/product", productRoutes);
app.use("/api/chat", chatRoutes);
const expressServer = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
export const io = new Server(expressServer, {
    cors: {
        origin: "*", // Adjust this to match your front-end origin
    },
});
const users = {}; // Store userId -> socketId mapping
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
        try {
            if (!message || !senderId || !receiverId)
                return;
            const newMessage = new Message({
                sender: senderId,
                receiver: receiverId,
                text: message,
            });
            yield newMessage.save();
            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMessage", newMessage);
                console.log(`Sent newMessage event to ${receiverSocketId}`);
            }
        }
        catch (error) {
            console.error("Error saving message:", error);
        }
    }));
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${userId}`);
        delete users[userId];
        io.emit("getOnlineUsers", Object.keys(users));
    });
});
