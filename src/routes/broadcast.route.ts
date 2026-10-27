import { Router } from "express";
import { createBroadcast, getBroadcast, listBroadcasts, retryBroadcast } from "../controllers/broadcast.controller";
import { authenticate } from "../middleware/auth.middleware";
const router = Router();
router.use(authenticate);
router.get("/", listBroadcasts);
router.post("/", createBroadcast);
router.get("/:id", getBroadcast);
router.post("/:id/retry", retryBroadcast);
export default router;

