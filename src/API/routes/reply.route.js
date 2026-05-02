import express from "express";
import { handleReply } from "../controllers/reply.controller.js";

const router = express.Router();

/**
 * Route: POST /v1/reply
 * Purpose: Receive and process a reply from a simulated merchant or customer[cite: 2, 8].
 * Behavior: Triggered by the judge harness when a reply is generated. The bot must 
 * analyze the intent (positive, hostile, auto-reply, etc.) and return the next 
 * action—send, wait, or end—within 30 seconds[cite: 2, 14, 22].
 */
router.post("/reply", handleReply);

export default router;