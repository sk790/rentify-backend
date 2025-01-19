var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import mongoose from "mongoose";
export const connectToDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield mongoose.connect("mongodb+srv://saurabhk2890:oeTJRCysjKdYIBHU@cluster0.5fqky.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", { dbName: "rentify" });
        console.log("Connected to database", res.connection.host);
    }
    catch (error) {
        console.log("db failed", error);
    }
});
