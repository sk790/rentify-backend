import express, { Request, Response } from "express";
import { connectToDB } from "./config/db.js";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import http from "http"; // Required for server creation
import { Server } from "socket.io"; // Importing Socket.IO

configDotenv();

import authRouter from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import rentedProductsRoutes from "./routes/rentRoutes.js";
import admin from "./routes/serverRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();
const port = process.env.PORT;

// Create an HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this to match your front-end origin
    methods: ["GET", "POST"],
  },
});

// Middleware
connectToDB();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);
app.use("/api/auth", authRouter);
app.use("/api/product", productRoutes);
app.use("/api/rent", rentedProductsRoutes);
app.use("/api/admin", admin);
app.use("/api/chat", chatRoutes);

// Store connected users and their sockets
const connectedUsers: { [userId: string]: string } = {};

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Register a user by their userId
  socket.on("register", ({ userId }) => {
    connectedUsers[userId] = socket.id;
    console.log(`User registered: ${userId}`);
  });

  // Handle private messaging
  socket.on("privateMessage", ({ senderId, receiverId, message }) => {
    const receiverSocketId = connectedUsers[receiverId];

    if (receiverSocketId) {
      // Send message to the receiver
      io.to(receiverSocketId).emit("receiveMessage", {
        senderId,
        message,
      });
    } else {
      console.log(`User ${receiverId} is not connected.`);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    for (const userId in connectedUsers) {
      if (connectedUsers[userId] === socket.id) {
        delete connectedUsers[userId];
        console.log(`User disconnected: ${userId}`);
        break;
      }
    }
  });
});

// Start the server
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
