import { Server, Socket } from "socket.io";
import { createServer } from "http";
import express from "express";
interface Message {
  sender: string;
  receiver: string;
  _id: string;
  content: string;
  status?: string;
}

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  },
});
const users: Record<string, string> = {}; // Stores userId -> socketId mapping

io.on("connection", (socket: Socket) => {
  const userId = socket.handshake.query.userId as string;
  console.log("User connected:", userId);

  if (userId) {
    users[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(users));
  }

  socket.on("sendMessage", async (message: Message) => {
    const receiverSocketId = users[message.receiver];
    const senderSocketId = users[message.sender];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
      io.to(senderSocketId).emit("messageDelivered", {
        ...message,
        status: "delivered",
      });
    }
  });

  const updateLastSeen = async (userId: string): Promise<void> => {
    try {
      await fetch("http://localhost:5000/api/chat/update-last-seen", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
    } catch (error) {
      console.error("Error updating last seen:", error);
    }
  };

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
