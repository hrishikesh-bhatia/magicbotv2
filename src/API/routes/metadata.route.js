import express from "express";
import { metadataController } from "../controllers/metadata.controller.js";

const router = express.Router();

router.get("/metadata", metadataController);

export default router;