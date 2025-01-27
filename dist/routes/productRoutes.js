import express from "express";
import { verify } from "../middlewares/verify.js";
import { addProduct, addToFavorite, getAllProducts, getProductDetail, removeProduct, updateProduct, updateStatus, } from "../controllers/product.controller.js";
const router = express.Router();
//user routes
router.route("/listing").post(verify, addProduct);
router.route("/products").get(getAllProducts);
router.route("/favorite/:productId").put(verify, addToFavorite);
router.route("/rented/:productId").put(verify, updateStatus);
router
    .route("/:productId")
    .get(getProductDetail)
    .delete(verify, removeProduct)
    .put(verify, updateProduct);
router.route("/status-update/:productId").put(verify, updateStatus);
export default router;
// when i hit getallproducts route then default hit getproductdetail why?
// ChatGPT said:
// ChatGPT
// The issue occurs because the route /:productId is more generic and matches any route path that follows the pattern /<something>. When you hit /products, the /:productId route is being matched instead of /products.
// This happens because Express evaluates routes in the order they are defined. Since /:productId appears before /products, it takes precedence when both routes could match.
