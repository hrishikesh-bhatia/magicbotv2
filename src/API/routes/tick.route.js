import express from "express";
import { handleTick } from "../controllers/tick.controller.js";

const router = express.Router();

/**
 * Route: POST /v1/tick
 * Purpose: Periodic wake-up call from the judge harness[cite: 2, 10].
 * Behavior: Triggered every 5 simulated minutes. The bot inspects active triggers 
 * and decides whether to initiate new conversations based on urgency and 
 * merchant context.
 */
router.post("/tick", handleTick);

export default router;