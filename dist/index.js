import express from "express";
import { connectToDB } from "./config/db.js";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
configDotenv();
import authRouter from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
const app = express();
const port = process.env.PORT;
// Middleware to parse JSON requests
connectToDB();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["*"],
    methods: ["PUT", "GET", "POST", "DELETE"],
}));
app.use("/api/auth", authRouter);
app.use("/api/product", productRoutes);
// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
