import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();

import router from "./routes/index.ts";
import { Admin } from "./models/Admin.ts";

const app = express();

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
mongoose
  .connect(process.env.MONGO_URI!, {
    tls: true,
    tlsCAFile: "../../global-bundle.pem"
  })
  .then(() => console.log("[ MONGO ] Database connected"))
  .catch((error) => console.error("[ MONGO ] Database error:", error));
//create superadmin account before starting//

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
export default app;
