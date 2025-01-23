import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

interface AuthenticateRequest extends Request {
  user?: any;
}

export const verify = async (
  req: AuthenticateRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { rentify_token } = req.cookies;
    // console.log(rentify_token);

    if (!rentify_token) {
      res.status(401).json({ message: "token not valid" });
      return;
    }
    const decoded = jwt.verify(
      rentify_token,
      process.env.JWT_SECRET as string
    ) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({ message: "You need to login first" });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    res
      .status(401)
      .json({ message: "iinternal server error", error: error.message });
  }
};

export const authorizationRole = (role: string) => {
  return (req: AuthenticateRequest, res: Response, next: NextFunction) => {
    try {
      // Assuming the user's role is available in `req.user.role`
      if (req.user && req.user.role === role) {
        next(); // Role matches, proceed to the next middleware or controller
      } else {
        res.status(403).json({ message: "Access denied. Admins only." });
        return;
      }
    } catch (error) {
      res.status(500).json({ message: "Internal server error." });
      return;
    }
  };
};
