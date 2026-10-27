import crypto from "crypto";
import { Request, Response } from "express";
import MediaFile from "../models/mediaFile.model";
import { writeAudit } from "../services/audit.service";

export async function uploadImage(req:Request,res:Response){
  if(!req.file)return res.status(400).json({success:false,error:"กรุณาเลือกไฟล์รูปภาพ"});
  const file=await MediaFile.create({originalName:req.file.originalname,mimeType:req.file.mimetype,sizeBytes:req.file.size,checksum:crypto.createHash("sha256").update(req.file.buffer).digest("hex"),data:req.file.buffer,createdBy:req.auth!.userId});
  await writeAudit(req,"media.upload","media_file",String(file.id),{mimeType:file.mimeType,sizeBytes:file.sizeBytes});
  return res.status(201).json({success:true,data:{id:file.id,originalName:file.originalName,mimeType:file.mimeType,sizeBytes:file.sizeBytes,url:`/api/public/media/${file.id}`}});
}

export async function serveImage(req:Request,res:Response){
  const file=await MediaFile.findByPk(Number(req.params.id));
  if(!file)return res.status(404).send("Not found");
  res.setHeader("Content-Type",file.mimeType);res.setHeader("Content-Length",String(file.sizeBytes));res.setHeader("Cache-Control","public, max-age=31536000, immutable");res.setHeader("X-Content-Type-Options","nosniff");return res.send(file.data);
}

