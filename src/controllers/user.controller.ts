import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { z } from "zod";
import User from "../models/user.model";
import { writeAudit } from "../services/audit.service";

const createSchema = z.object({
  username: z.string().trim().min(3).max(100).regex(/^[A-Za-z0-9._-]+$/),
  password: z.string().min(8).max(200), displayName: z.string().trim().min(1).max(255),
  department: z.string().trim().max(255).nullable().optional(), role: z.enum(["admin", "sender"]),
});
const updateSchema = z.object({ displayName: z.string().trim().min(1).max(255).optional(), department: z.string().trim().max(255).nullable().optional(), role: z.enum(["admin", "sender"]).optional(), status: z.enum(["active", "inactive"]).optional(), password: z.string().min(8).max(200).optional() });

export async function listUsers(_req: Request, res: Response) {
  const data = await User.findAll({ attributes: ["id", "username", "displayName", "department", "role", "status", "lastLoginAt", "createdAt", "updatedAt"], order: [["displayName", "ASC"]] });
  return res.json({ success: true, data });
}
export async function createUser(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: parsed.error.flatten() });
  if (await User.findOne({ where: { username: parsed.data.username } })) return res.status(409).json({ success: false, error: "Username already exists" });
  const user = await User.create({ username: parsed.data.username, passwordHash: await bcrypt.hash(parsed.data.password, 12), displayName: parsed.data.displayName, department: parsed.data.department ?? null, role: parsed.data.role, lastLoginAt: null });
  await writeAudit(req, "user.create", "user", String(user.id), { username: user.username, role: user.role });
  return res.status(201).json({ success: true, data: pickPublic(user) });
}
export async function updateUser(req: Request, res: Response) {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success || Object.keys(parsed.data).length === 0) return res.status(400).json({ success: false, error: "No valid changes" });
  const user = await User.findByPk(Number(req.params.id));
  if (!user) return res.status(404).json({ success: false, error: "User not found" });
  if (user.id === req.auth!.userId && parsed.data.status === "inactive") return res.status(400).json({ success: false, error: "You cannot disable your own account" });
  const { password, ...changes } = parsed.data;
  await user.update({ ...changes, ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {}) });
  await writeAudit(req, "user.update", "user", String(user.id), { role: user.role, status: user.status });
  return res.json({ success: true, data: pickPublic(user) });
}
function pickPublic(user: User) { return { id: user.id, username: user.username, displayName: user.displayName, department: user.department, role: user.role, status: user.status, lastLoginAt: user.lastLoginAt, createdAt: user.createdAt, updatedAt: user.updatedAt }; }

