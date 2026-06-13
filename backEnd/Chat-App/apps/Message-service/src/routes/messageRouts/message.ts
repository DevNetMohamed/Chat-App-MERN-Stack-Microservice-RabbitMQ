import { isAuth, upload } from "@chat-app/shared";
import * as MessageController from "../index.routes.js";
import { Router } from "express";
const router = Router();
router.use(isAuth);
router.post("/message", MessageController.sendMessage);
router.post("/madia", upload.single("file"), MessageController.sendMessage);
router.get("/getMessageByChat/:chatId", MessageController.getMessageByChat);

export default router;
