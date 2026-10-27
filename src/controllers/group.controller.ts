import { Request, Response } from "express";
import { z } from "zod";
import LineGroup from "../models/lineGroup.model";
import { pushTextMessage } from "../services/line/line.service";
import { writeAudit } from "../services/audit.service";

const updateSchema = z.object({ internalName: z.string().trim().max(255).nullable().optional(), category: z.string().trim().max(100).nullable().optional(), enabled: z.boolean().optional() });

export async function listGroups(_req: Request, res: Response) {
  const groups = await LineGroup.findAll({ order: [["status", "ASC"], ["name", "ASC"]] });
  return res.json({ success: true, data: groups });
}

export async function updateGroup(req: Request, res: Response) {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.flatten() });
  const group = await LineGroup.findByPk(Number(req.params.id));
  if (!group) return res.status(404).json({ success: false, error: "Group not found" });
  await group.update(parsed.data);
  await writeAudit(req, "group.update", "line_group", String(group.id), parsed.data);
  return res.json({ success: true, data: group });
}

export async function testGroup(req: Request, res: Response) {
  const group = await LineGroup.findByPk(Number(req.params.id));
  if (!group || group.status !== "active") return res.status(404).json({ success: false, error: "Active group not found" });
  const result = await pushTextMessage(group.groupId, "ทดสอบการเชื่อมต่อจาก Hospital LINE Broadcast ✅");
  await writeAudit(req, "group.test", "line_group", String(group.id));
  return res.json({ success: true, data: result });
}

