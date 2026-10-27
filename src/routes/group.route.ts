import { Router } from "express";
import { listGroups, testGroup, updateGroup } from "../controllers/group.controller";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
const router = Router();
router.use(authenticate);
router.get("/", listGroups);
router.patch("/:id", requireAdmin, updateGroup);
router.post("/:id/test", requireAdmin, testGroup);
export default router;

