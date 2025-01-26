var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Product } from "../models/product.model.js";
import User from "../models/user.model.js";
import useGetDistance from "../utils/useGetDistance.js";
import { Favorite } from "../models/favorite.model.js";
//user route
export const addProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("calling add product");
        const { formData, images } = req.body;
        const { productName, description, cordinets, address, category, period, price, status, title, } = formData;
        const newProduct = yield Product.create({
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
        yield User.findByIdAndUpdate(req.user._id, {
            $push: { products: newProduct._id },
        });
        res.status(200).json({ msg: "product created", newProduct });
        return;
    }
    catch (error) {
        res
            .status(500)
            .json({ msg: "internal server error", error: error.message });
        console.log(error);
        return;
    }
});
export const removeProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("calling remove product");
        const product = yield Product.findById(req.params.productId);
        if (!product) {
            res.status(404).json({ msg: "Product not found" });
            return;
        }
        const favorites = yield Favorite.find({ product: product._id });
        if (favorites.length > 0) {
            // Extract user IDs from the favorites
            const userIds = favorites.map((fav) => fav.user.toString());
            // Remove the product from all users' favorites
            yield User.updateMany({ _id: { $in: userIds } }, { $pull: { favorites: product._id, products: product._id } });
            // Delete all Favorite entries linked to this product
            yield Favorite.deleteMany({ product: product._id });
        }
        // Finally, delete the product
        yield Product.findByIdAndDelete(product._id);
        res.status(200).json({ msg: "Product deleted" });
        return;
    }
    catch (error) {
        res.status(500).json({ msg: "internal server error" });
        return;
    }
});
export const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("calling update product");
    try {
        const { description, timePeriod, price, address, status } = req.body;
        const product = yield Product.findById(req.params.productId);
        if (!product) {
            res.status(400).json({ message: "product not find" });
            return;
        }
        if (product.user._id.toString() !== req.user._id.toString()) {
            res.status(400).json({ message: "You can not edit this product" });
            return;
        }
        yield product.updateOne({
            description,
            timePeriod,
            price,
            address,
            status,
        });
        res.status(200).json({ message: "product updated" });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "internal server error", error });
        return;
    }
});
export const getProductDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("calling get product detail");
    try {
        const product = yield Product.findById(req.params.productId).populate("user");
        if (!product) {
            res.status(404).json({ msg: "Product not found" });
            return;
        }
        res.status(200).json({ msg: "product", product });
        return;
    }
    catch (error) {
        res.status(500).json({ msg: "internal server error" });
        console.log(error);
        return;
    }
});
export const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("calling get all products");
    const { category, limit, userCoords, areaRange, startIndex } = req.query;
    // console.log(req.query);
    try {
        let products;
        let len = 0;
        if (category) {
            len = yield Product.find({ category }).countDocuments();
            products = yield Product.find({ category })
                .populate("user")
                .limit(parseInt(limit) || 10)
                .sort({ createdAt: -1 })
                .skip(parseInt(startIndex) || 0);
        }
        else {
            products = yield Product.find()
                .populate("user")
                .sort({ createdAt: -1 })
                .limit(parseInt(limit) || 10);
        }
        if (!products) {
            res.status(404).json({ msg: "Product not found" });
            return;
        }
        // console.log(products, "cat");
        const distances = [];
        if ((userCoords && areaRange) || category) {
            const parsedUserCoords = JSON.parse(userCoords);
            const parsedAreaRange = parseInt(areaRange);
            // Calculate distances and filter products
            const productsByDistance = products.filter((product) => {
                const distance = useGetDistance({
                    latitude: parsedUserCoords.latitude,
                    longitude: parsedUserCoords.longitude,
                }, {
                    latitude: product.productCordinates.latitude,
                    longitude: product.productCordinates.longitude,
                });
                if (distance <= parsedAreaRange) {
                    distances.push(distance.toFixed(2)); // Store all distances
                    return Object.assign(Object.assign({}, products), { distance });
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
    }
    catch (error) {
        res.status(500).json({ msg: "internal server error" });
        console.log(error);
        return;
    }
});
export const addToFavorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("calling add to favorite");
    try {
        const product = yield Product.findById(req.params.productId);
        if (!product) {
            res.status(404).json({ msg: "Product not found" });
            return;
        }
        const user = yield User.findById(req.user._id);
        if (!user) {
            res.status(404).json({ msg: "User not found" });
            return;
        }
        const favorite = yield Favorite.findOne({
            product: product._id,
            user: req.user._id,
        });
        if (favorite) {
            yield user.updateOne({ $pull: { favorites: product._id } });
            yield Favorite.findByIdAndDelete(favorite._id);
            res.status(200).json({ msg: "Product removed from favoritess" });
            return;
        }
        else {
            yield Favorite.create({
                product: product._id,
                user: req.user._id,
            });
            yield user.updateOne({ $push: { favorites: product._id } });
            res.status(200).json({ msg: "Product added to favorites" });
            return;
        }
    }
    catch (error) {
        res
            .status(500)
            .json({ msg: "Internal Server error", error: error.message });
        console.log(error);
        return;
    }
});
export const getFavoriteProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("calling get favorite products");
    try {
        // console.log({ user: req.user._id });
        const favorite = yield Favorite.find({ user: req.user._id }).populate("product");
        if (!favorite) {
            res.status(404).json({ msg: "User not found" });
            return;
        }
        // console.log(favorite);
        res
            .status(200)
            .json({ msg: "Favorite products", favoriteProducts: favorite });
        return;
    }
    catch (error) {
        res
            .status(500)
            .json({ msg: "Internal Server error", error: error.message });
        return;
    }
});
export const updateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("calling update status");
    try {
        const product = yield Product.findById(req.params.productId);
        if (!product) {
            res.status(404).json({ msg: "Product not found" });
            return;
        }
        if (product.status === "Available") {
            yield product.updateOne({ status: "Rented" });
        }
        else {
            yield product.updateOne({ status: "Available" });
        }
        res.status(200).json({ msg: "Product status updated" });
        return;
    }
    catch (error) {
        res
            .status(500)
            .json({ msg: "Internal Server error", error: error.message });
        return;
    }
});
