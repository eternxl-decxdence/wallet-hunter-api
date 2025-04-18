import { Request, Response, response } from "express";
import { User } from "../models/User.ts";
import { Server } from "../models/Server.ts";
import { Found } from "../models/Found.ts";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { RefreshToken } from "../models/RefreshToken.ts";

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: "invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "invalid credentials" });
    }
    const accessToken = user.generateAuthToken();
    const refreshToken = jwt.sign(
      { _id: user._id },
      process.env.JWT_REFRESH_TOKEN_SECRET!,
      { expiresIn: "7d" }
    );

    await RefreshToken.deleteMany({ userId: user._id });

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      holderType: "user",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res
      .status(200)
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .json({ accessToken: accessToken });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
}

export async function register(req: Request, res: Response) {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already in use" });
    }

    const user = new User({
      username,
      password,
      subscriptionExpirationDate: new Date(
        new Date().getTime() + 24 * 60 * 60 * 1000
      )
    });
    await user.save();

    const token = user.generateAuthToken();
    res.status(201).json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}

export async function deleteUser(req: Request, res: Response) {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });
    const servers = await Server.find({ owner: user._id });
    servers.forEach(async (server) => {
      await Found.deleteMany({ finder: server._id });
    });
    await Server.deleteMany({ owner: user._id });
    await User.deleteOne({ _id: user._id });
    return res
      .status(200)
      .json({ message: `User ${username} deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

export async function getUser(req: Request, res: Response) {
  const userId = req.user!._id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const userServers = await Server.find({ owner: userId });
    const userServersWithFounds = await Promise.all(
      userServers.map(async (server) => {
        const founds = await Found.find({ finder: server._id });

        const formattedFounds = founds.map((found) => ({
          address: found.address,
          seedPhrase: found.seedPhrase,
          balance: found.balance
        }));

        return {
          serverName: server.serverName,
          setupSettings: server.setupSettings,
          lastActive: server.lastActive,
          startedAt: server.startedAt,
          stats: server.stats,
          founds: formattedFounds
        };
      })
    );

    console.log(userServers);
    return res.status(200).json({
      username: user.username,
      subscription: user.subscriptionExpirationDate,
      createdAt: user.createdAt,
      servers: userServersWithFounds
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
export async function updateUser(req: Request, res: Response) {
  const { username, subscriptionDays, password } = req.body;
  try {
    const update: any = {};
    if (subscriptionDays !== "") {
      update.subscriptionExpirationDate = new Date(
        Date.now() + parseInt(subscriptionDays) * 24 * 60 * 60 * 1000
      );
    }
    if (password !== "") {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(password, salt);
    }
    const updatedUser = await User.findOneAndUpdate({ username }, update, {
      new: true
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.log("Server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function getUserList(req: Request, res: Response) {
  try {
    const users = await User.find();

    const responseUsers = await Promise.all(
      users.map(async (user) => {
        const userServers = await Server.find({ owner: user._id });
        let foundCount = 0;
        const foundsPerServer = await Promise.all(
          userServers.map((server) => Found.find({ finder: server._id }))
        );

        // Суммируем общее количество найденных адресов
        const totalFoundCount = foundsPerServer.reduce(
          (acc, founds) => acc + founds.length,
          0
        );
        return {
          username: user.username,
          serverCount: userServers.length - 1,
          foundCount: totalFoundCount,
          subscription: user.subscriptionExpirationDate
        };
      })
    );
    return res.status(200).json(responseUsers);
  } catch (err) {
    console.log("Server error:" + err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function getUserAdmin(req: Request, res: Response) {
  const { username } = req.body;
  const user = await User.findOne({ username });
  const userId = user?._id;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const userServers = await Server.find({ owner: userId });
    const userServersWithFounds = await Promise.all(
      userServers.map(async (server) => {
        const founds = await Found.find({ finder: server._id });

        const formattedFounds = founds.map((found) => ({
          address: found.address,
          seedPhrase: found.seedPhrase,
          balance: found.balance
        }));

        return {
          serverName: server.serverName,
          setupSettings: server.setupSettings,
          lastActive: server.lastActive,
          startedAt: server.startedAt,
          stats: server.stats,
          founds: formattedFounds
        };
      })
    );

    console.log(userServers);
    return res.status(200).json({
      username: user.username,
      subscription: user.subscriptionExpirationDate,
      createdAt: user.createdAt,
      servers: userServersWithFounds
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}
