import express from "express";
import { contextController } from "../controllers/context.controller.js";

const router = express.Router();

/**
 * Route: POST /v1/context
 * Purpose: Receive incremental context updates (category, merchant, customer, trigger)[cite: 2, 5].
 * Metadata: Handled by the contextController with version-idempotency[cite: 11].
 */
router.post("/context", contextController);

export default router;