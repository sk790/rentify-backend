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
import { Rent } from "../models/rent.model.js";
export const toggleRent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield Product.findById(req.params.productId);
        if (!product) {
            res.status(404).json({ msg: "Product not found" });
            return;
        }
        const existInRent = yield Rent.findById(product._id);
        if (existInRent) {
            yield User.updateOne({ _id: req.user._id }, { $pull: { rented: product._id } });
            yield Rent.findByIdAndDelete({
                product: product._id,
                owner: req.user._id,
            });
            res.status(200).json({ msg: "product remove from the rented" });
            return;
        }
        else {
            yield Rent.create({ product: product._id, owner: req.user._id });
            yield User.updateOne({ _id: req.user._id }, { $push: { rented: product._id } });
            res.status(200).json({ msg: "product added in rented" });
            return;
        }
    }
    catch (error) {
        res.status(500).json({ msg: "Internal server error" });
        return;
    }
});
export const getUserRentedProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const products = yield Rent.findById({ owner: req.user._id });
        res.status(200).json({ rentedProducts: products });
        return;
    }
    catch (error) {
        res.status(500).json({ msg: "Internal server error" });
        return;
    }
});
