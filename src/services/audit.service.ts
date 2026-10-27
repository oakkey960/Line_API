import { Request } from "express";
import AuditLog from "../models/auditLog.model";

export async function writeAudit(req: Request, action: string, entityType?: string, entityId?: string, metadata?: Record<string, unknown>) {
  await AuditLog.create({
    userId: req.auth?.userId ?? null,
    action,
    entityType: entityType ?? null,
    entityId: entityId ?? null,
    metadata: metadata ?? null,
    ipAddress: req.ip ?? null,
  });
}

