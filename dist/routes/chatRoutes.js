import express from "express";
import { getConversations, getMessages, 
// getUndeliveredMessages,
sendMessage, updateStatus, } from "../controllers/chat.controller.js";
import { verify } from "../middlewares/verify.js";
const router = express.Router();
router.route("/send-message").post(verify, sendMessage);
router.route("/get-conversations").get(verify, getConversations);
router.route("/get-messages/:chatUserId").get(verify, getMessages);
router.route("/update-status/:messageId").post(updateStatus);
// router
//   .route("/get-undelivered-messages/:receiverId")
//   .get(verify, getUndeliveredMessages);
export default router;
