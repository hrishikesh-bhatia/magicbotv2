import express from "express";
import { replyController } from "../controllers/reply.controller.js";

const router = express.Router();

router.post("/reply", replyController);

export default router;