import { Request, Response } from "express";
import { Server } from "../models/server.js";

export const shutDownServer = async (req: Request, res: Response) => {
  await Server.findOneAndUpdate({ isDown: false });
  res.status(200).json({ msg: "Server shutting down", isDown: false });
};

export const create = async (req: Request, res: Response) => {
  await Server.create({ isDown: false });
  res.status(200).json({ msg: "Server created" });
};

export const restartServer = async (req: Request, res: Response) => {
  await Server.findOneAndUpdate({ isDown: true });
  res.status(200).json({ msg: "Server restarting" });
};
export const status = async (req: Request, res: Response) => {
  const server = await Server.findOne({});
  console.log(server);

  res.status(200).json({ msg: "Server status", status: server.isDown });
  return;
};
