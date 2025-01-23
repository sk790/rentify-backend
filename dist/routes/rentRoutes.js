import expres from "express";
import { verify } from "../middlewares/verify.js";
import { getUserRentedProducts, toggleRent, } from "../controllers/rent.controller.js";
const router = expres.Router();
router.route("/toggle/:productId").put(verify, toggleRent);
router.route("/get-rented").get(verify, getUserRentedProducts);
export default router;
