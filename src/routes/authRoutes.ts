import express from "express";
import {
  login,
  signUp,
  logOut,
  getMyProfile,
  getUserDetails,
  updateAvatar,
  updateProfile,
} from "../controllers/auth.controller.js";
import { authorizationRole, verify } from "../middlewares/verify.js";

const router = express.Router();

router.route("/login").post(login);
router.route("/signup").post(signUp);
router.route("/me").get(verify, getMyProfile);
router.route("/logout").get(verify, logOut);
router.route("/:userId").get(getUserDetails);
router.route("/avatar").put(verify, updateAvatar);
router.route("/update-profile").put(verify, updateProfile);

export default router;
