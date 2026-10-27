import { Request, Response } from "express";
import { z } from "zod";
import MessageTemplate from "../models/messageTemplate.model";
import { writeAudit } from "../services/audit.service";

const schema = z.object({ name: z.string().trim().min(1).max(255), content: z.string().trim().min(1).max(5000), status: z.enum(["active", "inactive"]).optional() });

export async function listTemplates(_req: Request, res: Response) {
  const data = await MessageTemplate.findAll({ order: [["name", "ASC"]] });
  return res.json({ success: true, data });
}
export async function createTemplate(req: Request, res: Response) {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.flatten() });
  const item = await MessageTemplate.create({ ...parsed.data, createdBy: req.auth!.userId });
  await writeAudit(req, "template.create", "message_template", String(item.id));
  return res.status(201).json({ success: true, data: item });
}
export async function updateTemplate(req: Request, res: Response) {
  const parsed = schema.partial().safeParse(req.body);
  if (!parsed.success || Object.keys(parsed.data).length === 0) return res.status(400).json({ success: false, error: "No valid changes" });
  const item = await MessageTemplate.findByPk(Number(req.params.id));
  if (!item) return res.status(404).json({ success: false, error: "Template not found" });
  await item.update(parsed.data);
  await writeAudit(req, "template.update", "message_template", String(item.id));
  return res.json({ success: true, data: item });
}
export async function deleteTemplate(req: Request, res: Response) {
  const item = await MessageTemplate.findByPk(Number(req.params.id));
  if (!item) return res.status(404).json({ success: false, error: "Template not found" });
  await item.update({ status: "inactive" });
  await writeAudit(req, "template.disable", "message_template", String(item.id));
  return res.sendStatus(204);
}

