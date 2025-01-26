import { Request, Response } from "express";
import { Product } from "../models/product.model.js";
import User from "../models/user.model.js";
import useGetDistance from "../utils/useGetDistance.js";
import mongoose from "mongoose";
import { Favorite } from "../models/favorite.model.js";
interface AuthenticatedRequest extends Request {
  user?: any;
}
//user route
export const addProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    console.log("calling add product");
    const { formData, images } = req.body;

    const {
      productName,
      description,
      cordinets,
      address,
      category,
      period,
      price,
      status,
      title,
    } = formData;

    const newProduct = await Product.create({
      productName,
      description,
      productCordinates: cordinets,
      address,
      category,
      timePeriod: period,
      price,
      title,
      status,
      images,
      user: req.user._id,
    });
    await User.findByIdAndUpdate(req.user._id, {
      $push: { products: newProduct._id },
    });
    res.status(200).json({ msg: "product created", newProduct });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ msg: "internal server error", error: error.message });
    console.log(error);

    return;
  }
};

export const removeProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    console.log("calling remove product");

    const product = await Product.findById(req.params.productId);
    if (!product) {
      res.status(404).json({ msg: "Product not found" });
      return;
    }

    const favorites = await Favorite.find({ product: product._id });

    if (favorites.length > 0) {
      // Extract user IDs from the favorites
      const userIds = favorites.map((fav) => fav.user.toString());

      // Remove the product from all users' favorites
      await User.updateMany(
        { _id: { $in: userIds } },
        { $pull: { favorites: product._id, products: product._id } }
      );

      // Delete all Favorite entries linked to this product
      await Favorite.deleteMany({ product: product._id });
    }

    // Finally, delete the product
    await Product.findByIdAndDelete(product._id);
    res.status(200).json({ msg: "Product deleted" });
    return;
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
    return;
  }
};

export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  console.log("calling update product");

  try {
    const { description, timePeriod, price, address, status } = req.body;
    const product = await Product.findById(req.params.productId);
    if (!product) {
      res.status(400).json({ message: "product not find" });
      return;
    }

    if (product.user._id.toString() !== req.user._id.toString()) {
      res.status(400).json({ message: "You can not edit this product" });
      return;
    }
    await product.updateOne({
      description,
      timePeriod,
      price,
      address,
      status,
    });
    res.status(200).json({ message: "product updated" });
    return;
  } catch (error) {
    res.status(500).json({ message: "internal server error", error });
    return;
  }
};

export const getProductDetail = async (req: Request, res: Response) => {
  console.log("calling get product detail");

  try {
    const product = await Product.findById(req.params.productId).populate(
      "user"
    );
    if (!product) {
      res.status(404).json({ msg: "Product not found" });
      return;
    }
    res.status(200).json({ msg: "product", product });
    return;
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
    console.log(error);
    return;
  }
};
export const getAllProducts = async (req: Request, res: Response) => {
  console.log("calling get all products");

  const { category, limit, userCoords, areaRange, startIndex } = req.query;
  // console.log(req.query);

  try {
    let products: any;
    let len: number = 0;
    if (category) {
      len = await Product.find({ category }).countDocuments();
      products = await Product.find({ category })
        .populate("user")
        .limit(parseInt(limit as string) || 10)
        .sort({ createdAt: -1 })
        .skip(parseInt(startIndex as string) || 0);
    } else {
      products = await Product.find()
        .populate("user")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit as string) || 10);
    }
    if (!products) {
      res.status(404).json({ msg: "Product not found" });
      return;
    }
    // console.log(products, "cat");

    const distances: any = [];
    if ((userCoords && areaRange) || category) {
      const parsedUserCoords = JSON.parse(userCoords as string);
      const parsedAreaRange = parseInt(areaRange as string);

      // Calculate distances and filter products
      const productsByDistance = products.filter((product: any) => {
        const distance = useGetDistance(
          {
            latitude: parsedUserCoords.latitude,
            longitude: parsedUserCoords.longitude,
          },
          {
            latitude: product.productCordinates.latitude,
            longitude: product.productCordinates.longitude,
          }
        );

        if (distance <= parsedAreaRange) {
          distances.push(distance.toFixed(2)); // Store all distances
          return { ...products, distance };
        }
      });

      res.status(200).json({
        msg: "Filtered products",
        products: productsByDistance,
        distances,
        categoryProductLenght: len,
      });
      return;
    }
    res.status(200).json({ msg: "products", products });
    return;
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
    console.log(error);
    return;
  }
};

export const addToFavorite = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  console.log("calling add to favorite");

  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      res.status(404).json({ msg: "Product not found" });
      return;
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ msg: "User not found" });
      return;
    }
    const favorite = await Favorite.findOne({
      product: product._id,
      user: req.user._id,
    });
    if (favorite) {
      await user.updateOne({ $pull: { favorites: product._id } });
      await Favorite.findByIdAndDelete(favorite._id);
      res.status(200).json({ msg: "Product removed from favoritess" });
      return;
    } else {
      await Favorite.create({
        product: product._id,
        user: req.user._id,
      });
      await user.updateOne({ $push: { favorites: product._id } });
      res.status(200).json({ msg: "Product added to favorites" });
      return;
    }
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal Server error", error: error.message });
    console.log(error);
    return;
  }
};

export const getFavoriteProducts = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  console.log("calling get favorite products");

  try {
    // console.log({ user: req.user._id });
    const favorite = await Favorite.find({ user: req.user._id }).populate(
      "product"
    );
    if (!favorite) {
      res.status(404).json({ msg: "User not found" });
      return;
    }
    // console.log(favorite);

    res
      .status(200)
      .json({ msg: "Favorite products", favoriteProducts: favorite });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal Server error", error: error.message });
    return;
  }
};
export const updateStatus = async (req: Request, res: Response) => {
  console.log("calling update status");
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      res.status(404).json({ msg: "Product not found" });
      return;
    }
    if (product.status === "Available") {
      await product.updateOne({ status: "Rented" });
    } else {
      await product.updateOne({ status: "Available" });
    }
    res.status(200).json({ msg: "Product status updated" });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Internal Server error", error: error.message });
    return;
  }
};
