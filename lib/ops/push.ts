import { createHash } from "node:crypto";

import webpush from "web-push";

import { getWriteClient } from "@/sanity/lib/write-client";

import {
  fetchSpecialDaysConfig,
  formatCivilDate,
  resolvePushAlertsForToday,
  todayInArgentina,
  type OpsSpecialDayAlert,
} from "./special-days";

export type PushSubscriptionKeys = {
  p256dh: string;
  auth: string;
};

export type StoredPushSubscription = {
  _id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

function vapidPublicKey(): string | undefined {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || undefined;
}

function vapidPrivateKey(): string | undefined {
  return process.env.VAPID_PRIVATE_KEY?.trim() || undefined;
}

function vapidSubject(): string {
  return (
    process.env.VAPID_SUBJECT?.trim() ||
    "mailto:ops@santoamore.com.ar"
  );
}

export function isPushConfigured(): boolean {
  return Boolean(vapidPublicKey() && vapidPrivateKey());
}

export function getVapidPublicKey(): string | null {
  return vapidPublicKey() ?? null;
}

function configureWebPush() {
  const pub = vapidPublicKey();
  const priv = vapidPrivateKey();
  if (!pub || !priv) {
    throw new Error("Push no configurado (faltan VAPID keys)");
  }
  webpush.setVapidDetails(vapidSubject(), pub, priv);
}

export function subscriptionDocumentId(endpoint: string): string {
  const hash = createHash("sha256").update(endpoint).digest("hex").slice(0, 32);
  return `opsPushSub.${hash}`;
}

export function receiptDocumentId(input: {
  subscriptionId: string;
  alertKey: string;
  occurrenceDate: string;
  sentCivilDate: string;
}): string {
  const raw = [
    input.subscriptionId,
    input.alertKey,
    input.occurrenceDate,
    input.sentCivilDate,
  ].join("|");
  const hash = createHash("sha256").update(raw).digest("hex").slice(0, 40);
  return `opsPushReceipt.${hash}`;
}

export async function savePushSubscription(input: {
  endpoint: string;
  keys: PushSubscriptionKeys;
  userAgent?: string;
}): Promise<{ id: string }> {
  const write = getWriteClient();
  const id = subscriptionDocumentId(input.endpoint);
  const now = new Date().toISOString();

  await write.createIfNotExists({
    _id: id,
    _type: "opsPushSubscription",
    endpoint: input.endpoint,
    p256dh: input.keys.p256dh,
    auth: input.keys.auth,
    userAgent: input.userAgent,
    createdAt: now,
    updatedAt: now,
  });

  await write
    .patch(id)
    .set({
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      userAgent: input.userAgent,
      updatedAt: now,
    })
    .commit();

  return { id };
}

export async function deletePushSubscriptionByEndpoint(
  endpoint: string,
): Promise<void> {
  const write = getWriteClient();
  const id = subscriptionDocumentId(endpoint);
  try {
    await write.delete(id);
  } catch {
    /* already gone */
  }
}

async function listSubscriptions(): Promise<StoredPushSubscription[]> {
  const write = getWriteClient();
  return write.fetch<StoredPushSubscription[]>(
    `*[_type == "opsPushSubscription"]{ _id, endpoint, p256dh, auth }`,
  );
}

function notificationPayload(alert: OpsSpecialDayAlert): string {
  const when =
    alert.isToday
      ? "Es hoy"
      : alert.daysUntil === 1
        ? "Mañana"
        : `Faltan ${alert.daysUntil} días`;

  const body = [when, alert.hint].filter(Boolean).join(" · ");

  return JSON.stringify({
    title: alert.title,
    body: body || `Prepará stock para ${alert.date}`,
    url: "/ops",
    tag: `sa-ops-${alert.key}-${alert.date}`,
    alertKey: alert.key,
  });
}

async function sendToSubscription(
  sub: StoredPushSubscription,
  alert: OpsSpecialDayAlert,
): Promise<"sent" | "skipped" | "gone" | "error"> {
  configureWebPush();

  const today = formatCivilDate(todayInArgentina());
  const write = getWriteClient();
  const receiptId = receiptDocumentId({
    subscriptionId: sub._id,
    alertKey: alert.key,
    occurrenceDate: alert.date,
    sentCivilDate: today,
  });

  const existing = await write.fetch<{ _id: string } | null>(
    `*[_id == $id][0]{ _id }`,
    { id: receiptId },
  );
  if (existing) return "skipped";

  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      notificationPayload(alert),
      {
        TTL: 60 * 60 * 12,
        urgency: alert.priority === "high" ? "high" : "normal",
      },
    );
  } catch (error) {
    const statusCode =
      error && typeof error === "object" && "statusCode" in error
        ? Number((error as { statusCode?: number }).statusCode)
        : undefined;

    if (statusCode === 404 || statusCode === 410) {
      await deletePushSubscriptionByEndpoint(sub.endpoint);
      return "gone";
    }

    console.error("[ops/push] send failed", sub._id, error);
    return "error";
  }

  try {
    await write.create({
      _id: receiptId,
      _type: "opsPushReceipt",
      subscriptionId: sub._id,
      alertKey: alert.key,
      occurrenceDate: alert.date,
      sentCivilDate: today,
      sentAt: new Date().toISOString(),
    });
  } catch (error) {
    // Otro worker pudo crear el recibo; el push ya salió.
    console.warn("[ops/push] receipt after send", error);
  }

  return "sent";
}

export async function dispatchSpecialDayPushes(): Promise<{
  alerts: number;
  alertKeys: string[];
  today: string;
  subscriptions: number;
  sent: number;
  skipped: number;
  gone: number;
  errors: number;
}> {
  if (!isPushConfigured()) {
    throw new Error("Push no configurado (faltan VAPID keys)");
  }

  const config = await fetchSpecialDaysConfig();
  const alerts = resolvePushAlertsForToday(config);
  const subscriptions = await listSubscriptions();

  let sent = 0;
  let skipped = 0;
  let gone = 0;
  let errors = 0;

  for (const alert of alerts) {
    for (const sub of subscriptions) {
      if (!sub.endpoint || !sub.p256dh || !sub.auth) {
        errors += 1;
        continue;
      }
      const result = await sendToSubscription(sub, alert);
      if (result === "sent") sent += 1;
      else if (result === "skipped") skipped += 1;
      else if (result === "gone") gone += 1;
      else errors += 1;
    }
  }

  return {
    alerts: alerts.length,
    alertKeys: alerts.map((a) => a.key),
    today: formatCivilDate(todayInArgentina()),
    subscriptions: subscriptions.length,
    sent,
    skipped,
    gone,
    errors,
  };
}
