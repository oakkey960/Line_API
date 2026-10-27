import express from "express";
import { serveImage } from "../controllers/media.controller";
const router = express.Router();
router.get("/media/:id",serveImage);
// const apiLogger = require("../middleware/apiLogger");
// const {
//   authenticateToken,
//   authorizeRole,
// } = require("../middleware/authMiddleware");

//route
// router.use(authenticateToken, apiLogger, authorizeRole(1));

// router.get("/mapAll", AllChoiceController.mapAll);

export default router;
