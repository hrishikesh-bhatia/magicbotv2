import express from "express";
import { metadataController } from "../controllers/metadata.controller.js";

const router = express.Router();

/**
 * Route: GET /v1/metadata
 * Purpose: Bot identity and approach disclosure[cite: 2, 7].
 * Behavior: Returns team details, technical approach, and versioning. 
 * This is used by the judge to understand the 'brain' behind your 
 * deterministic logic and intent parsing[cite: 2, 13].
 */
router.get("/metadata", metadataController);

export default router;