import { Router } from "express";
import { createUser, listUsers, updateUser } from "../controllers/user.controller";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
const router = Router();
router.use(authenticate, requireAdmin);
router.get("/users", listUsers);
router.post("/users", createUser);
router.patch("/users/:id", updateUser);
export default router;
