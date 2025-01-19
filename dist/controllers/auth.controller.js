var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
export const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, password } = req.body;
    if (!phone || !password) {
        res.status(400).json({ msg: "All field are required" });
        return;
    }
    const user = yield User.findOne({ phone });
    if (user) {
        res.status(400).json({ msg: "user alresdy exist" });
        return;
    }
    const newUser = yield User.create(req.body);
    const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET);
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
});
export const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { phone, password } = req.body;
    console.log(phone, password);
    try {
        if (!phone || !password) {
            res.status(400).json({ msg: "all field are required" });
            return;
        }
        const user = yield User.findOne({ phone });
        if (!user) {
            res.status(404).json({ msg: "user not found with this phone number" });
            return;
        }
        if (password !== user.password) {
            res.status(400).json({ msg: "password wrong" });
            return;
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
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
    }
    catch (error) {
        res
            .status(500)
            .json({ msg: "Internal Server error", error: error.message });
        return;
    }
});
export const getUserDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findById(req.params.userId).populate("products");
        if (!user) {
            res.status(404).json({ msg: "user not found" });
            return;
        }
        res.status(200).json({ user });
        return;
    }
    catch (error) {
        res
            .status(500)
            .json({ msg: "Internal Server error", error: error.message });
        return;
    }
});
export const getMyProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User.findById(req.user.id)
            .select("-password")
            .populate(["products", "favorites"]);
        if (!user) {
            res.status(404).json({ msg: "user not found" });
            return;
        }
        res.status(200).json({ user });
        return;
    }
    catch (error) {
        res
            .status(500)
            .json({ msg: "Internal Server error", error: error.message });
        return;
    }
});
export const logOut = (req, res) => {
    res
        .status(200)
        .clearCookie("rentify_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    })
        .json({ msg: "log out successfull" });
    return;
};
