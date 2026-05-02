import express from "express";
import { healthController } from "../controllers/health.controller.js";

const router = express.Router();

/**
 * Route: GET /v1/healthz
 * Purpose: Liveness probe and diagnostic verification.
 * Behavior: The judge harness polls this every 60s to ensure uptime and 
 * verify that all base contexts (Categories, Merchants, Customers) 
 * have been successfully loaded[cite: 2, 12].
 */
router.get("/healthz", healthController);

export default router;