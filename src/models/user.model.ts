import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: { type: String, default: "anonymous" },
  role: {
    type: String,
    enum: ["user", "sp"],
    default: "user",
  },
  description: {
    type: String,
  },
  gender: { type: String, enum: ["male", "female", ""], default: "" },
  password: { type: String, required: true },
  phone: { type: String, unique: true, required: true },
  address: { type: String },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  rented: [{ type: mongoose.Schema.ObjectId, ref: "Product" }],
  avatar: {
    type: String,
    default:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtuphMb4mq-EcVWhMVT8FCkv5dqZGgvn_QiA&s",
  },
  userCordinates: {
    //user cordinates always dynamic
    latitude: { type: Number },
    longitude: { type: Number },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  products: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  ],
  isBlocked: { type: Boolean, default: false },
});
const User = mongoose.model("User", userSchema);
export default User;
