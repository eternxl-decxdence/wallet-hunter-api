import { Request, Response } from "express";
import { User } from "../models/User.ts";

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

    const token = user.generateAuthToken();
    res.status(200).json({ token, userId: user._id });
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

    const user = new User({ username, password });
    await user.save();

    const token = user.generateAuthToken();
    res.status(201).json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}
