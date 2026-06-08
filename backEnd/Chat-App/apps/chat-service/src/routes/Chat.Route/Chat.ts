import { Router } from "express";
import { CreateNewChat } from "../../controller/Chat.js";
import { isAuth } from "@chat-app/shared";
import { getAllChats } from "../index.route.js";
const router = Router();

router.post("/chat/new", isAuth, CreateNewChat);
router.get("/chat/all", isAuth, getAllChats);
export default router;
