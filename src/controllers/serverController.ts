import { Request, Response } from "express";
import { Server } from "../models/Server.ts";
import { User } from "../models/User.ts";

export async function getServers(req: Request, res: Response) {
  try {
    const userId = req.user!._id;
    console.log(userId);
    if (!userId)
      return res.status(401).json({ message: "User not authorized" });

    const servers = await Server.find({ owner: userId });

    if (servers.length === 0)
      return res.status(404).json({ message: "Servers not found" });

    return res.status(200).json(servers);
  } catch (error) {
    console.error("[SERVER]" + error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function authServer(req: Request, res: Response) {
  const { serverName, setupSettings } = req.body;
  try {
    const userId = req.user!._id;
    if (!userId)
      return res.status(401).json({ message: "User not authorized" });
    const existingServer = await Server.findOne({
      owner: userId,
      serverName: serverName
    });
    if (!existingServer) {
      const server = new Server({
        owner: userId,
        serverName: serverName,
        setupSettings: setupSettings,
        lastActive: new Date(),
        startedAt: new Date()
      });

      await server.save();
      return res.status(200).json({
        serverId: server._id,
        message: "Registered new Server"
      });
    }
    existingServer.set({
      setupSettings: setupSettings,
      lastActive: new Date(),
      startedAt: new Date()
    });

    await existingServer.save();
    return res.status(200).json({
      serverId: existingServer._id,
      message: "Authenticated server"
    });
  } catch (error) {
    console.error("[SERVER]" + error);
    return res.status(500).json({ message: "Server error" });
  }
}
export async function updateServerStats(req: Request, res: Response) {
  const { serverName, setupSettings, stats } = req.body;
  try {
    const userId = req.user!._id;
    if (!userId)
      return res.status(401).json({ message: "User not authorized" });
    const server = await Server.findOne({
      owner: userId,
      serverName: serverName
    });
    if (!server) {
      console.warn(
        `[WARN] Server "${serverName}" not found for user ${userId}`
      );
      return res
        .status(200)
        .json({ message: "Server not found, skipping update" });
    }
    server.set({
      setupSettings: setupSettings,
      stats: stats,
      lastActive: new Date()
    });
    await server.save();
    return res.status(200).json({ message: "Updated server" });
  } catch (error) {
    console.error("[SERVER]" + error);
    return res.status(500).json({ message: "Server error" });
  }
}
export async function deleteServer(res: Response, req: Request) {
  const { serverName, username } = req.body;
  try {
    const owner = await User.findOne({ username });
    if (!owner) res.status(404).json({ message: "Owner not found" });
    await Server.deleteOne({ owner: owner!._id, serverName });
    res.status(200).json({ message: "Server deleted" });
  } catch (error) {
    console.error("[SERVER]" + error);
    return res.status(500).json({ message: "Server error" });
  }
}
