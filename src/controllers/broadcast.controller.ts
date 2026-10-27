import { Request, Response } from "express";
import { z } from "zod";
import Broadcast from "../models/broadcast.model";
import BroadcastRecipient from "../models/broadcastRecipient.model";
import LineGroup from "../models/lineGroup.model";
import User from "../models/user.model";
import { createAndSendBroadcast, retryBroadcastFailures } from "../services/broadcast.service";
import { writeAudit } from "../services/audit.service";

const createSchema = z.object({ message: z.string().trim().min(1).max(5000), groupIds: z.array(z.number().int().positive()).min(1).max(100), imageId:z.number().int().positive().nullable().optional() });

export async function createBroadcast(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.flatten() });
  try {
    const data = await createAndSendBroadcast(parsed.data.message, [...new Set(parsed.data.groupIds)], req.auth!.userId, parsed.data.imageId??null);
    await writeAudit(req, "broadcast.send", "broadcast", String(data.broadcast.id), { totalGroups: data.broadcast.totalGroups });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, error: error instanceof Error ? error.message : "Unable to send broadcast" });
  }
}

export async function listBroadcasts(req: Request, res: Response) {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const result = await Broadcast.findAndCountAll({ order: [["createdAt", "DESC"]], limit, offset: (page - 1) * limit });
  return res.json({ success: true, data: result.rows, pagination: { page, limit, total: result.count, totalPages: Math.ceil(result.count / limit) } });
}

export async function getBroadcast(req: Request, res: Response) {
  const broadcast = await Broadcast.findByPk(Number(req.params.id));
  if (!broadcast) return res.status(404).json({ success: false, error: "Broadcast not found" });
  const recipients = await BroadcastRecipient.findAll({ where: { broadcastId: broadcast.id } });
  const groups = await LineGroup.findAll({ where: { id: recipients.map((item) => item.lineGroupId) }, attributes: ["id", "name", "internalName"] });
  const groupMap = new Map(groups.map((group) => [group.id, group]));
  const recipientDetails = recipients.map((recipient) => ({ ...recipient.toJSON(), group: groupMap.get(recipient.lineGroupId) ?? null }));
  const sender = await User.findByPk(broadcast.sentBy, { attributes: ["id", "username", "displayName"] });
  return res.json({ success: true, data: { broadcast, recipients: recipientDetails, sender } });
}

export async function retryBroadcast(req: Request, res: Response) {
  const broadcast = await Broadcast.findByPk(Number(req.params.id));
  if (!broadcast) return res.status(404).json({ success: false, error: "Broadcast not found" });
  const data = await retryBroadcastFailures(broadcast);
  await writeAudit(req, "broadcast.retry", "broadcast", String(broadcast.id));
  return res.json({ success: true, data });
}

