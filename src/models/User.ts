import mongoose, { Schema, Document } from "mongoose";
import { Server } from "./Server.ts";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface IUser extends Document {
  username: string;
  password: string;
  subscriptionExpirationDate: Date;
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
  generateAuthToken(): string;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subscriptionExpirationDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

UserSchema.pre("save", async function (next) {
  if (this.isNew) {
    const existingServer = await Server.findOne({
      owner: this._id,
      serverName: "local"
    });
    if (!existingServer) {
      const newServer = new Server({
        owner: this._id,
        serverName: "local",
        lastActive: new Date()
      });

      await newServer.save();
    }
  }
  next();
});

UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET!, {
    expiresIn: "1h"
  });
  return token;
};

export const User = mongoose.model<IUser>("User", UserSchema);
