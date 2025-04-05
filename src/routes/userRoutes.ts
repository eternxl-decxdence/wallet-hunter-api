import { Router } from "express";
import { getServers } from "../controllers/serverController.ts";
import { authToken } from "../middleware/authToken.ts";

const router = Router();

router.get("/servers", authToken, getServers);
export default router;
