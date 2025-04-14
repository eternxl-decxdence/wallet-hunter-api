import { Router } from "express";
import { getUser, login, register } from "../controllers/userController.ts";
import { authAdminToken } from "../middleware/authAdminToken.ts";
import { authToken } from "../middleware/authToken.ts";
import { refreshUserAccessToken } from "../controllers/tokenController.ts";
const router = Router();

router.post("/register", authAdminToken, register);
router.post("/login", login);
router.get("/getdata", authToken, getUser);
router.post("/refreshToken", refreshUserAccessToken);
export default router;
