import { Router } from "express";

import authRoutes from "./authRoutes.ts";
import userRoutes from "./userRoutes.ts";

const router = Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);

export default router;
