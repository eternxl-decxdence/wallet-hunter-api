import { Request, Response } from "express";
import { Server } from "../models/Server.ts";

export async function getServers(req: Request, res: Response) {
  try {
    const userId = req.user!._id;
    if (!userId)
      return res.status(401).json({ message: "User not authorized" });

    const servers = await Server.find({ ownerId: userId });

    if (servers.length === 0)
      return res.status(404).json({ message: "Servers not found" });

    return res.status(200).json(servers);
  } catch (error) {
    console.error("[SERVER]" + error);
    return res.status(500).json({ message: "Server error" });
  }
}
