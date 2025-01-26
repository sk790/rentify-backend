import express from "express";
import { create, restartServer, shutDownServer, status, } from "../controllers/admin.controller.js";
const router = express.Router();
router.route("/create").post(create);
router.route("/down").post(shutDownServer);
router.route("/up").post(restartServer);
router.route("/status").get(status);
export default router;
