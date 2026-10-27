import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

type AuthPayload = { userId: number; username: string; role: "admin" | "sender" };

function getSecret() {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return secret;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const [scheme, token] = (req.get("authorization") ?? "").split(" ");
  if (scheme !== "Bearer" || !token) return res.status(401).json({ success: false, error: "Unauthorized" });
  try {
    req.auth = jwt.verify(token, getSecret()) as AuthPayload;
    return next();
  } catch {
    return res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.auth?.role !== "admin") return res.status(403).json({ success: false, error: "Admin access required" });
  return next();
}

export function signAccessToken(payload: AuthPayload) {
  return jwt.sign(payload, getSecret(), { expiresIn: "8h", issuer: "linebot-api" });
}

