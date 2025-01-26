import express, { Request, Response } from "express";
import { connectToDB } from "./config/db.js";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
configDotenv();
import authRouter from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import rentedProductsRoutes from "./routes/rentRoutes.js";
import admin from "./routes/serverRoutes.js";

const app = express();
const port = process.env.PORT;

// Middleware to parse JSON requests
connectToDB();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" })); // Adjust limit as needed
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

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
