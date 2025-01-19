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
    const {
      productName,
      description,
      cordinets,
      address,
      category,
      period,
      price,
      title,
    } = req.body;
    console.log(cordinets);

    const newProduct = await Product.create({
      productName,
      description,
      productCordinates: cordinets,
      address,
      category,
      timePeriod: period,
      price,
      title,
      images: [
        "https://cdn.bikedekho.com/processedimages/yamaha/r15-v4/source/r15-v466e5433ef20f5.jpg",
      ],
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
    const product = await Product.findById(req.params.productId);
    if (!product) {
      res.status(404).json({ msg: "Product not found" });
      return;
    }
    // if (product.user._id !== req.user._id) {
    //   res.status(400).json({ msg: "You can not delete this product" });
    //   return;
    // }
    await Product.findByIdAndDelete(product._id);
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { products: product._id },
    });
    res.status(200).json({ msg: "Product deleted" });
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
    const {
      productName,
      description,
      subCategoryId,
      deposit,
      images,
      availability,
      location,
    } = req.body;
    const product = await Product.findById(req.params.productId);
    if (!product) {
      res.status(400).json({ message: "product not find" });
      return;
    }
    if (product.user !== req.user._id) {
      res.status(400).json({ message: "You can not edit this product" });
      return;
    }
    const newProduct = await product.updateOne({
      productName,
      description,
      subCategoryId,
      deposit,
      availability,
      location,
      images: [
        "https://cdn.bikedekho.com/processedimages/yamaha/r15-v4/source/r15-v466e5433ef20f5.jpg",
      ],
    });
    res.status(200).json({ message: "product updated", newProduct });
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

  const { category, limit, userCoords, areaRange } = req.query;

  try {
    let products: any;
    if (req.query.category) {
      products = await Product.find({ category })
        .populate("user")
        .limit(parseInt(limit as string) || 10)
        .sort({ createdAt: -1 });
    } else {
      products = await Product.find().populate("user").sort({ createdAt: -1 });
    }
    if (!products) {
      res.status(404).json({ msg: "Product not found" });
      return;
    }

    const distances: any = [];
    if (userCoords && areaRange) {
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
    const favorite = await Favorite.findOne({ product: product._id });
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
    console.log(favorite);

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
