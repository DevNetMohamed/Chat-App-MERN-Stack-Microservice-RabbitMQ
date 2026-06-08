import express from "express";
import * as UserController from "../../controllers/User.js";
import { isAuth } from "@chat-app/shared";
const router = express.Router();
router.post("/login", UserController.loginUser);
router.post("/verify", UserController.VerifyUser);
router.get("/profile", isAuth, UserController.myProfile);
router.put("/update-user", isAuth, UserController.updateName);
router.get("/user/all", isAuth, UserController.getAllUser);
router.get("/user/:id", isAuth, UserController.getAUser);

export default router;
