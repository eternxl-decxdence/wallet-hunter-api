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
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173"); // Указание разрешенного источника
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Разрешение методов
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization"); // Разрешение заголовков
  res.header("Access-Control-Allow-Credentials", "true"); // Разрешение куков
  return res.sendStatus(200); // Отправляем статус OK
});
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
