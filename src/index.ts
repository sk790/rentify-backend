import express from "express";
import { connectToDB } from "./config/db.js";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

configDotenv();
const PORT = process.env.PORT || 5000;

import authRouter from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();

// Middleware
connectToDB();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);
app.use("/api/auth", authRouter);
app.use("/api/product", productRoutes);
app.use("/api/chat", chatRoutes);

// Ensure Vercel serverless functions return the Express app
if (process.env.NODE_ENV === "development") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
export default app;
