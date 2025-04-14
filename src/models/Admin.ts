import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import mongoose, { Schema, Document } from "mongoose";

interface IAdmin extends Document {
  username: string;
  password: string;
  role: "admin" | "superadmin";
  comparePassword(password: string): Promise<boolean>;
  generateAuthToken(): string;
}

const AdminSchema = new Schema<IAdmin>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "superadmin"], default: "admin" }
});

AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});
AdminSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

AdminSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id },
    process.env.JWT_ACCESS_TOKEN_SECRET!,
    {
      expiresIn: "1h"
    }
  );
  return token;
};

export const Admin = mongoose.model<IAdmin>("Admin", AdminSchema);
