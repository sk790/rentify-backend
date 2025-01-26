var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Server } from "../models/server.js";
export const shutDownServer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield Server.findOneAndUpdate({ isDown: false });
    res.status(200).json({ msg: "Server shutting down", isDown: false });
});
export const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield Server.create({ isDown: false });
    res.status(200).json({ msg: "Server created" });
});
export const restartServer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield Server.findOneAndUpdate({ isDown: true });
    res.status(200).json({ msg: "Server restarting" });
});
export const status = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const server = yield Server.findOne({});
    console.log(server);
    res.status(200).json({ msg: "Server status", status: server.isDown });
    return;
});
