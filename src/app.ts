import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

import router from "./routes/index.ts";

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api", router);

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("[ MONGO ] Database connected"))
  .catch((error) => console.error("[ MONGO ] Database error:", error));

export default app;
