import express, { Router } from "express";
import { lineWebhook } from "../controllers/lineWebhook.controller";

const router = Router();
router.post("/", express.raw({ type: "application/json" }), lineWebhook);

export default router;

