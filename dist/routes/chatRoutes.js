import express from "express";
import { sendMessage } from "../controllers/chat.controller.js";
import { verify } from "../middlewares/verify.js";
const router = express.Router();
router.route("/send-message/:recieverId").post(verify, sendMessage);
export default router;
