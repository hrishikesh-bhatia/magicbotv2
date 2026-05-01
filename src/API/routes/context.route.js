import express from "express";
import { contextController } from "../controllers/context.controller.js";

const router = express.Router();

router.post("/context", contextController);

export default router;