import jwt from "jsonwebtoken";

import mongoose, { Schema, Document } from "mongoose";

export interface IRefreshToken extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  token: string;
  expiresAt: Date;
  holderType: "user" | "admin";
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  holderType: { type: String, enum: ["user", "admin"], default: "user" }
});
export const RefreshToken = mongoose.model<IRefreshToken>(
  "RefreshToken",
  RefreshTokenSchema
);
