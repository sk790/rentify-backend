import { Request, Response } from "express";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { privateDecrypt } from "crypto";
import { SOCKET_SERVER_URL } from "../index.js";

interface AuthenticateRequest extends Request {
  user?: any;
}
export const signUp = async (req: Request, res: Response): Promise<void> => {
  const { phone, password } = req.body;
  // console.log();

  if (!phone || !password) {
    res.status(400).json({ msg: "All field are required" });
    return;
  }
  const user = await User.findOne({ phone });
  if (user) {
    res.status(400).json({ msg: "user alresdy exist" });
    return;
  }
  const newUser = await User.create(req.body);
  const token = jwt.sign(
    { id: newUser._id, role: newUser.role },
    process.env.JWT_SECRET
  );

  res
    .status(200)
    .cookie("rentify_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
    })
    .json({ msg: "signup successfull", token });
  return;
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { phone, password } = req.body;
  // console.log(phone, password);
  console.log("calling login");

  try {
    if (!phone || !password) {
      res.status(400).json({ msg: "all field are required" });
      return;
    }
    const user = await User.findOne({ phone });
    if (!user) {
      res.status(404).json({ msg: "user not found with this phone number" });
      return;
    }
    if (password !== user.password) {
      res.status(400).json({ msg: "password wrong" });
      return;
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET
    );
    res
      .status(200)
      .cookie("rentify_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000),
      })
      .json({ msg: "login successfull", token });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal Server error", error: error.message });
    return;
  }
};

export const getUserDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId).populate("products");
    if (!user) {
      res.status(404).json({ msg: "user not found" });
      return;
    }
    res.status(200).json({ user });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal Server error", error: error.message });
    return;
  }
};
export const getMyProfile = async (
  req: AuthenticateRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate(["products", "favorites", "rented"]);

    if (!user) {
      res.status(404).json({ msg: "user not found" });
      return;
    }
    // await fetch(`${SOCKET_SERVER_URL}/getOnlineUsers`);
    res.status(200).json({ user });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal Server error", error: error.message });
    return;
  }
};
export const logOut = (req: Request, res: Response): void => {
  console.log("calling log out");
  try {
    res
      .status(200)
      .clearCookie("rentify_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .json({ msg: "log out successfull" });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal Server error", error: error.message });
    return;
  }
};
export const updateAvatar = async (req: AuthenticateRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ msg: "User not found" });
      return;
    }
    await user.updateOne({ avatar: req.body.avatar });
    res.status(200).json({ msg: "Profile updated successfull" });
    return;
  } catch (error) {
    res.status(500).json({ msg: "INterna; server error" });
    return;
  }
};
export const updateProfile = async (
  req: AuthenticateRequest,
  res: Response
) => {
  console.log("update profile");
  const { name, address, description } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ msg: "User not found" });
    }
    await user.updateOne({ name, description, address });
    res.status(200).json({ msg: "Profile updated successfull" });
    return;
  } catch (error) {
    res.status(500).json({ msg: "INterna; server error" });
    return;
  }
};
