import { isAuth, upload } from "@chat-app/shared";
import * as MessageController from "../../controllers/sendMessage.js";
import { Router } from "express";
const router = Router();
router.use(isAuth);
router.post("/message", MessageController.sendMessage);
router.post(
  "/madia",
  isAuth,
  upload.single("file"),
  MessageController.sendMessage,
);

export default router;
