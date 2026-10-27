import { Router } from "express";
import multer from "multer";
import { uploadImage } from "../controllers/media.controller";
import { authenticate } from "../middleware/auth.middleware";
const router=Router();
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:1024*1024},fileFilter:(_req,file,cb)=>{if(["image/jpeg","image/png"].includes(file.mimetype))cb(null,true);else cb(new Error("รองรับเฉพาะ JPEG และ PNG"));}});
router.post("/",authenticate,upload.single("image"),uploadImage);
export default router;

