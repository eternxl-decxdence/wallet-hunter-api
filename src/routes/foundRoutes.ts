import { Router } from "express";
import { authToken } from "../middleware/authToken.ts";
import { addFound } from "../controllers/foundController.ts";

const router = Router();

router.post("/add", authToken, addFound);

export default router;
