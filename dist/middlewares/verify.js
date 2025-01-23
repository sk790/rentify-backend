var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
export const verify = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rentify_token } = req.cookies;
        // console.log(rentify_token);
        if (!rentify_token) {
            res.status(401).json({ message: "token not valid" });
            return;
        }
        const decoded = jwt.verify(rentify_token, process.env.JWT_SECRET);
        const user = yield User.findById(decoded.id);
        if (!user) {
            res.status(401).json({ message: "You need to login first" });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res
            .status(401)
            .json({ message: "iinternal server error", error: error.message });
    }
});
export const authorizationRole = (role) => {
    return (req, res, next) => {
        try {
            // Assuming the user's role is available in `req.user.role`
            if (req.user && req.user.role === role) {
                next(); // Role matches, proceed to the next middleware or controller
            }
            else {
                res.status(403).json({ message: "Access denied. Admins only." });
                return;
            }
        }
        catch (error) {
            res.status(500).json({ message: "Internal server error." });
            return;
        }
    };
};
