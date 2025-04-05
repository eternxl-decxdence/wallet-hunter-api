import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.ts";

const JWT_SECRET = process.env.JWT_SECRET!;

export function authToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ error: "Access denied no token provided" });

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });

    const user = await User.findById((decoded as { userId: string }).userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    req.user = user;
    next();
  });
}
