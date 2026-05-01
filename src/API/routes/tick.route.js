import express from "express";
import { handleTick } from "../controllers/tick.controller.js";

const router = express.Router();

router.post("/tick", handleTick);

export default router;