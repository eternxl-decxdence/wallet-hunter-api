import { Router } from "express";

import userRoutes from "./userRoutes.ts";

import serverRoutes from "./serverRoutes.ts";
import adminRoutes from "./adminRoutes.ts";
import foundRoutes from "./foundRoutes.ts";
const router = Router();

router.use("/user", userRoutes);
router.use("/server", serverRoutes);
router.use("/admin", adminRoutes);
router.use("/found", foundRoutes);
export default router;
