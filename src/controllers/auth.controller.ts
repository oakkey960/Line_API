import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { z } from "zod";
import User from "../models/user.model";
import { signAccessToken } from "../middleware/auth.middleware";
import { writeAudit } from "../services/audit.service";

const loginSchema = z.object({ username: z.string().trim().min(1).max(100), password: z.string().min(8).max(200) });

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ success: false, error: "Invalid username or password format" });

  const user = await User.findOne({ where: { username: parsed.data.username } });
  if (!user || user.status !== "active" || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    return res.status(401).json({ success: false, error: "Invalid username or password" });
  }

  await user.update({ lastLoginAt: new Date() });
  req.auth = { userId: user.id, username: user.username, role: user.role };
  await writeAudit(req, "auth.login", "user", String(user.id));
  const token = signAccessToken(req.auth);
  return res.json({ success: true, token, user: publicUser(user) });
}

export async function me(req: Request, res: Response) {
  const user = await User.findByPk(req.auth!.userId);
  if (!user || user.status !== "active") return res.status(401).json({ success: false, error: "User unavailable" });
  return res.json({ success: true, user: publicUser(user) });
}

export function logout(_req: Request, res: Response) { return res.sendStatus(204); }

function publicUser(user: User) {
  return { id: user.id, username: user.username, displayName: user.displayName, department: user.department, role: user.role, status: user.status, lastLoginAt: user.lastLoginAt };
}

