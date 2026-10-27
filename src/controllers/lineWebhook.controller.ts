import crypto from "crypto";
import { Request, Response } from "express";
import { LineWebhookEvent, processLineEvent } from "../services/line/line.service";

function isValidSignature(rawBody: Buffer, receivedSignature: string): boolean {
  const channelSecret = process.env.LINE_CHANNEL_SECRET?.trim();
  if (!channelSecret || !receivedSignature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", channelSecret)
    .update(rawBody)
    .digest("base64");
  const received = Buffer.from(receivedSignature);
  const expected = Buffer.from(expectedSignature);
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

export async function lineWebhook(req: Request, res: Response) {
  const rawBody = req.body;
  const signature = req.get("x-line-signature") ?? "";

  if (!Buffer.isBuffer(rawBody) || !isValidSignature(rawBody, signature)) {
    return res.status(401).json({ success: false, error: "Invalid signature" });
  }

  let body: { events?: LineWebhookEvent[] };
  try {
    body = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return res.status(400).json({ success: false, error: "Invalid JSON" });
  }

  res.sendStatus(200);
  void Promise.all((body.events ?? []).map(processLineEvent)).catch((error) => {
    console.error("LINE webhook processing failed", error);
  });
}

