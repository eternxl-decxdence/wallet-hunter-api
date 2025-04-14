import jwt from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";
import { Admin } from "../models/Admin.ts";

export async function authAdminToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
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
      const admin = await Admin.findById((decoded as { _id: string })._id);
      if (!admin) return res.status(404).json({ error: "Admin not found" });

      req.admin = admin;
      next();
    }
  );
}
