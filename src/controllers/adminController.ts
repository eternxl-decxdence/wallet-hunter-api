import { Request, Response } from "express";
import { Admin } from "../models/Admin.ts";
import { RefreshToken } from "../models/RefreshToken.ts";
import jwt from "jsonwebtoken";

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  try {
    const user = await Admin.findOne({ username });

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
    const admin = await Admin.findById(req.admin!._id);
    if (admin!.role != "superadmin")
      return res.status(403).json({ error: "Not enough rights to register" });
    const existingUser = await Admin.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already in use" });
    }

    const user = new Admin({ username, password, role: "admin" });
    await user.save();

    const token = user.generateAuthToken();
    res.status(201).json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}

export async function deleteAdmin(req: Request, res: Response) {
  const { username } = req.body;
  try {
    const admin = await Admin.findById(req.admin!._id);
    if (admin!.role !== "superadmin")
      return res
        .status(401)
        .json({ error: "Not enough rights to delete admin" });
    await Admin.deleteOne({ username });
    return res
      .status(200)
      .json({ message: `Admin ${username} deleted successfully` });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
}

export async function updateAdmin(req: Request, res: Response) {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findById(req.admin!._id);

    if (admin!.role !== "superadmin")
      return res.status(403).json({ message: "Not enough rights " });

    const targetUser = await Admin.findOne({ username });
    if (!targetUser) return res.status(404).json({ message: "User not found" });

    if (password !== undefined) {
      targetUser.password = password;
    }
    await targetUser.save();
    return res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.log("Server error:" + err);
    return res.status(500).json({ error: "Server error" });
  }
}
export async function getAdmin(req: Request, res: Response) {
  const adminId = req.admin!._id;
  try {
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    return res.status(200).json({ username: admin.username, role: admin.role });
  } catch (err) {
    console.log("Server error:" + err);
    return res.status(500).json({ error: "Server error" });
  }
}
export async function getAdminList(req: Request, res: Response) {
  const admin = await Admin.findById(req.admin!._id);
  if (admin!.role !== "superadmin")
    return res
      .status(403)
      .json({ error: "Not enough rights to acces this path" });
  try {
    const admins = await Admin.find({ role: "admin" });
    const returnAdmins = admins.map((admin) => {
      return { username: admin.username };
    });

    return res.status(200).json(returnAdmins);
  } catch (err) {
    console.log("Server error:" + err);
    return res.status(500).json({ error: "Server error" });
  }
}
