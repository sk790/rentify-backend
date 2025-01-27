import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  timePeriod: {
    type: String,
    enum: ["Monthly", "Yearly", "Daily", "Weakly", "Hourly"],
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  images: [
    {
      type: String,
      default:
        "https://cdn.bikedekho.com/processedimages/yamaha/r15-v4/source/r15-v466e5433ef20f5.jpg",
      required: true,
    },
  ],

  address: {
    type: String,
  },
  productCordinates: {
    //product cordinates always static
    latitude: { type: Number },
    longitude: { type: Number },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Product = mongoose.model("Product", productSchema);
