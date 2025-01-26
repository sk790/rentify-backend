import mongoose from "mongoose";
const serverSchema = new mongoose.Schema({
    isDown: {
        type: Boolean,
        default: false,
    },
});
export const Server = mongoose.model("Server", serverSchema);
