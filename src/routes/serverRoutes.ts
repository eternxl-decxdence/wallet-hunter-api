import { Router } from "express";
import { authToken } from "../middleware/authToken.ts";
import {
  getServers,
  authServer,
  updateServerStats
} from "../controllers/serverController.ts";
const router = Router();

router.post("/auth", authToken, authServer);
router.get("/list", authToken, getServers);
router.post("/update", authToken, updateServerStats);

export default router;
