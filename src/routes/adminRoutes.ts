import { Router } from "express";
import { authAdminToken } from "../middleware/authAdminToken.ts";
import {
  deleteAdmin,
  getAdmin,
  getAdminList,
  login,
  register,
  updateAdmin
} from "../controllers/adminController.ts";

import {
  deleteUser,
  getUserAdmin,
  getUserList,
  updateUser
} from "../controllers/userController.ts";
import { deleteServer } from "../controllers/serverController.ts";
import { refreshAdminAccessToken } from "../controllers/tokenController.ts";

const router = Router();

router.get("/user/list", authAdminToken, getUserList);
router.get("/user/getUser", authAdminToken, getUserAdmin);
router.post("/user/delete", authAdminToken, deleteUser);
router.post("/user/update", authAdminToken, updateUser);

router.post("/server/delete", authAdminToken, deleteServer);

router.get("/list", authAdminToken, getAdminList);
router.post("/delete", authAdminToken, deleteAdmin);
router.post("/login", login);
router.post("/create", authAdminToken, register);
router.post("/update", authAdminToken, updateAdmin);
router.get("/getUser", authAdminToken, getAdmin);
router.post("/refreshToken", refreshAdminAccessToken);

export default router;
