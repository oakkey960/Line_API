import Broadcast from "../models/broadcast.model";
import BroadcastRecipient from "../models/broadcastRecipient.model";
import LineGroup from "../models/lineGroup.model";
import { pushTextMessage } from "./line/line.service";

async function deliver(recipient: BroadcastRecipient, message: string, imageUrl?: string) {
  const group = await LineGroup.findByPk(recipient.lineGroupId);
  if (!group || group.status !== "active" || !group.enabled) {
    await recipient.update({ status: "failed", errorCode: "GROUP_UNAVAILABLE", errorMessage: "Group is inactive, disabled, or missing", attemptCount: recipient.attemptCount + 1 });
    return false;
  }
  try {
    const result = await pushTextMessage(group.groupId, message, imageUrl);
    await recipient.update({ status: "sent", lineMessageId: result.lineMessageId, errorCode: null, errorMessage: null, attemptCount: recipient.attemptCount + 1, sentAt: new Date() });
    return true;
  } catch (error) {
    const value = error as Error & { code?: string };
    await recipient.update({ status: "failed", errorCode: value.code ?? "LINE_ERROR", errorMessage: value.message, attemptCount: recipient.attemptCount + 1 });
    return false;
  }
}

async function updateBroadcastSummary(broadcast: Broadcast) {
  const recipients = await BroadcastRecipient.findAll({ where: { broadcastId: broadcast.id } });
  const successCount = recipients.filter((item) => item.status === "sent").length;
  const failureCount = recipients.filter((item) => item.status === "failed").length;
  const status = successCount === recipients.length ? "completed" : successCount > 0 ? "partial" : "failed";
  await broadcast.update({ successCount, failureCount, status, sentAt: new Date() });
  return recipients;
}

export async function createAndSendBroadcast(message: string, groupIds: number[], userId: number, imageId: number | null) {
  const groups = await LineGroup.findAll({ where: { id: groupIds, status: "active", enabled: true } });
  if (groups.length !== new Set(groupIds).size) throw new Error("One or more selected groups are unavailable");
  const broadcast = await Broadcast.create({ message, sentBy: userId, totalGroups: groups.length, sentAt: null, imageId });
  const recipients = await BroadcastRecipient.bulkCreate(groups.map((group) => ({ broadcastId: broadcast.id, lineGroupId: group.id, lineMessageId: null, errorCode: null, errorMessage: null, sentAt: null })));
  const publicBase=process.env.PUBLIC_BASE_URL?.replace(/\/$/,"");
  const imageUrl=imageId&&publicBase?`${publicBase}/api/public/media/${imageId}`:undefined;
  if(imageId&&!imageUrl)throw new Error("PUBLIC_BASE_URL is required when sending an image");
  await Promise.all(recipients.map((recipient) => deliver(recipient, message, imageUrl)));
  const results = await updateBroadcastSummary(broadcast);
  return { broadcast: await broadcast.reload(), recipients: results };
}

export async function retryBroadcastFailures(broadcast: Broadcast) {
  const recipients = await BroadcastRecipient.findAll({ where: { broadcastId: broadcast.id, status: "failed" } });
  const publicBase=process.env.PUBLIC_BASE_URL?.replace(/\/$/,"");
  const imageUrl=broadcast.imageId&&publicBase?`${publicBase}/api/public/media/${broadcast.imageId}`:undefined;
  await Promise.all(recipients.map((recipient) => deliver(recipient, broadcast.message, imageUrl)));
  const results = await updateBroadcastSummary(broadcast);
  return { broadcast: await broadcast.reload(), recipients: results };
}

