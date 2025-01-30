import mongoose from "mongoose";
export const connectToDB = async () => {
  try {
    const res = await mongoose.connect(
      "mongodb+srv://saurabhk2890:oeTJRCysjKdYIBHU@cluster0.5fqky.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
      { dbName: "rentify" }
    );
    console.log("Connected to databasee", res.connection.host);
  } catch (error) {
    console.log("db failed", error);
  }
};
