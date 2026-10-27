import LineGroup from "../../models/lineGroup.model";

type LineGroupSummary = { groupId: string; groupName?: string; pictureUrl?: string };

export type LineWebhookEvent = {
  type: string;
  timestamp?: number;
  source?: { type?: string; groupId?: string; userId?: string };
};

function getAccessToken(): string {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim();
  if (!token) throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not configured");
  return token;
}

async function getGroupSummary(groupId: string): Promise<LineGroupSummary | null> {
  const response = await fetch(
    `https://api.line.me/v2/bot/group/${encodeURIComponent(groupId)}/summary`,
    { headers: { Authorization: `Bearer ${getAccessToken()}` } },
  );

  if (!response.ok) {
    console.error("Unable to read LINE group summary", { groupId, status: response.status });
    return null;
  }

  return (await response.json()) as LineGroupSummary;
}

export async function processLineEvent(event: LineWebhookEvent): Promise<void> {
  const groupId = event.source?.groupId;
  if (event.source?.type !== "group" || !groupId) return;

  if (event.type === "leave") {
    await LineGroup.update(
      { status: "inactive", leftAt: new Date(), lastSeenAt: new Date() },
      { where: { groupId } },
    );
    return;
  }

  if (event.type !== "join" && event.type !== "message") return;

  const summary = await getGroupSummary(groupId);
  await LineGroup.upsert({
    groupId,
    name: summary?.groupName ?? null,
    pictureUrl: summary?.pictureUrl ?? null,
    status: "active",
    joinedAt: new Date(event.timestamp ?? Date.now()),
    leftAt: null,
    lastSeenAt: new Date(),
  });
}

export async function pushTextMessage(groupId: string, text: string, imageUrl?: string) {
  const messages:any[]=[];
  if(imageUrl)messages.push({type:"image",originalContentUrl:imageUrl,previewImageUrl:imageUrl});
  if(text)messages.push({type:"text",text});
  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: { Authorization: `Bearer ${getAccessToken()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ to: groupId, messages }),
  });
  const raw = await response.text();
  let body: any = null;
  try { body = raw ? JSON.parse(raw) : null; } catch { body = { message: raw }; }
  if (!response.ok) {
    const error = new Error(body?.message || `LINE API error ${response.status}`) as Error & { code?: string };
    error.code = String(response.status);
    throw error;
  }
  return { lineMessageId: body?.sentMessages?.[0]?.id ?? null };
}


