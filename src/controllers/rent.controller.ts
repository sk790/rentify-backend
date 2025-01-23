import { Request, Response } from "express";
import { Product } from "../models/product.model.js";
import User from "../models/user.model.js";
import { Rent } from "../models/rent.model.js";
interface AuthenticatedRequest extends Request {
  user?: any;
}
export const toggleRent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      res.status(404).json({ msg: "Product not found" });
      return;
    }
    const existInRent = await Rent.findById(product._id);
    if (existInRent) {
      await User.updateOne(
        { _id: req.user._id },
        { $pull: { rented: product._id } }
      );
      await Rent.findByIdAndDelete({
        product: product._id,
        owner: req.user._id,
      });
      res.status(200).json({ msg: "product remove from the rented" });
      return;
    } else {
      await Rent.create({ product: product._id, owner: req.user._id });
      await User.updateOne(
        { _id: req.user._id },
        { $push: { rented: product._id } }
      );
      res.status(200).json({ msg: "product added in rented" });
      return;
    }
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
    return;
  }
};

export const getUserRentedProducts = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const products = await Rent.findById({ owner: req.user._id });
    res.status(200).json({ rentedProducts: products });
    return;
  } catch (error) {
    res.status(500).json({ msg: "Internal server error" });
    return;
  }
};
