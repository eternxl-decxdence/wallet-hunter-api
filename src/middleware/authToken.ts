import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.ts";

export function authToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(403).json({ error: "Access denied no token provided" });

  jwt.verify(
    token,
    process.env.JWT_ACCESS_TOKEN_SECRET!,
    async (err, decoded) => {
      if (err) {
        console.log(decoded, err);
        return res.status(401).json({ error: "Invalid or expired token" });
      }
      const user = await User.findById((decoded as { _id: string })._id);
      if (!user) return res.status(404).json({ error: "User not found" });

      req.user = user;
      next();
    }
  );
}
