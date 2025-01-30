import express from "express";
import { connectToDB } from "./config/db.js";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, socketServer } from "./socket.js";
configDotenv();
import authRouter from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
// const app = express();
const port = process.env.PORT || 5000;
// const server = http.createServer(app);
// Initialize Socket.IO
// export const io = new Server(server, {
//   cors: {
//     origin: "*", // Adjust this to match your front-end origin
//     methods: ["GET", "POST"],
//   },
// });
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
// const users: Record<string, string> = {}; // Store userId -> socketId mapping
// export const getReceiverSocketId = (receiverId: string) => {
//   return users[receiverId];
// };
// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);
//   const userId = socket.handshake.query.userId as string;
//   if (userId && userId !== "undefined") {
//     users[userId] = socket.id;
//     console.log(`User registered: ${userId} -> ${socket.id}`);
//   }
//   io.emit("getOnlineUsers", Object.keys(users));
//   socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
//     try {
//       if (!message || !senderId || !receiverId) return;
//       const newMessage = new Message({
//         sender: senderId,
//         receiver: receiverId,
//         text: message,
//       });
//       await newMessage.save();
//       const receiverSocketId = getReceiverSocketId(receiverId);
//       if (receiverSocketId) {
//         io.to(receiverSocketId).emit("newMessage", newMessage);
//         console.log(`Sent newMessage event to ${receiverSocketId}`);
//       }
//     } catch (error) {
//       console.error("Error saving message:", error);
//     }
//   });
//   socket.on("disconnect", () => {
//     console.log(`User disconnected: ${userId}`);
//     delete users[userId];
//     io.emit("getOnlineUsers", Object.keys(users));
//   });
// });
// For local development, listen on a port
// if (process.env.NODE_ENV !== "production") {
socketServer.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
// }
// Default export for Vercel
// export default server;
// export default app;
