import jwt from "jsonwebtoken";
import { RefreshToken } from "../models/RefreshToken.ts";
import { User } from "../models/User.ts";
import { Admin } from "../models/Admin.ts";
import { Request, Response } from "express";

export async function refreshUserAccessToken(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) res.status(401).json({ error: "No token provided" });
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET!
    ) as { _id: string };

    const savedToken = await RefreshToken.findOne({
      token: refreshToken,
      userId: decoded._id,
      holderType: "user"
    });
    if (!savedToken)
      return res.status(403).json({ error: "Invalid refresh token" });
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newAccessToken = user.generateAuthToken();
    return res.status(200).json({ accessToken: newAccessToken });
  } catch {
    return res
      .status(500)
      .json({ message: "Server error. Submit a bug report to administator" });
  }
}

export async function refreshAdminAccessToken(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ error: "No token provided" });
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET!
    ) as { _id: string };

    const savedToken = await RefreshToken.findOne({
      token: refreshToken,
      userId: decoded._id,
      holderType: "admin"
    });
    if (!savedToken)
      return res.status(403).json({ error: "Invalid refresh token" });
    const user = await Admin.findById(decoded._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newAccessToken = user.generateAuthToken();
    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.log("Refresh error: " + error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    return res
      .status(500)
      .json({ message: "Server error. Submit a bug report to administator" });
  }
}
