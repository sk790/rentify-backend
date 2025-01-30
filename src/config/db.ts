import mongoose from "mongoose";
export const connectToDB = async () => {
  try {
    const res = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "rentify",
    });
    console.log("Connected to databasee", res.connection.host);
  } catch (error) {
    console.log("db failed", error);
  }
};
