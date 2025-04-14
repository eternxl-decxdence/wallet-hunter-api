import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

import router from "./routes/index.ts";
import { Admin } from "./models/Admin.ts";

const app = express();
const filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const dirname = path.dirname(filename);
app.use(morgan("dev"));
app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/api", router);
console.log(dirname);
mongoose
  .connect(process.env.MONGO_URI!, {
    tls: true,
    tlsCAFile: path.join(dirname, "../global-bundle.pem")
  })
  .then(async () => {
    console.log("[ MONGO ] Database connected");
    const existingAdmin = await Admin.findOne({
      username: "sudo",
      role: "superadmin"
    });
    if (!existingAdmin) {
      const admin = new Admin({
        username: "sudo",
        password: "superuserlogin123",
        role: "superadmin"
      });
      await admin.save();
    }
  })
  .catch((error) => console.error("[ MONGO ] Database error:", error));

export default app;
