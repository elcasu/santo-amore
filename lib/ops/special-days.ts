import { client } from "@/sanity/lib/client";
import { getWriteClient } from "@/sanity/lib/write-client";

import {
  DEFAULT_PUSH_REPEAT_DAYS,
  DEFAULT_SPECIAL_DAYS,
  DEFAULT_SPECIAL_DAYS_LEAD,
  type SpecialDayPriority,
  type SpecialDayRecurrence,
  type SpecialDaySeed,
} from "./special-days-defaults";

const TZ = "America/Argentina/Buenos_Aires";

export type CivilDate = { y: number; m: number; d: number };

export type OpsSpecialDayItem = SpecialDaySeed & {
  leadDays?: number;
  pushRepeatDays?: number;
};

export type OpsSpecialDayAlert = {
  key: string;
  title: string;
  priority: SpecialDayPriority;
  hint?: string;
  date: string;
  daysUntil: number;
  leadDays: number;
  pushRepeatDays: number;
  isToday: boolean;
};

export type SpecialDaysConfig = {
  defaultLeadDays: number;
  pushRepeatDays: number;
  items: OpsSpecialDayItem[];
};

type SanityDoc = {
  defaultLeadDays?: number;
  pushRepeatDays?: number;
  items?: OpsSpecialDayItem[];
};

const query = `*[_type == "opsSpecialDays" && _id == "opsSpecialDays"][0]{
  defaultLeadDays,
  pushRepeatDays,
  items[]{
    key,
    title,
    enabled,
    priority,
    recurrence,
    month,
    day,
    weekday,
    nth,
    leadDays,
    pushRepeatDays,
    hint
  }
}`;

export function todayInArgentina(now = new Date()): CivilDate {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);

  return { y: get("year"), m: get("month"), d: get("day") };
}

export function formatCivilDate(date: CivilDate): string {
  return `${date.y}-${String(date.m).padStart(2, "0")}-${String(date.d).padStart(2, "0")}`;
}

export function daysBetween(from: CivilDate, to: CivilDate): number {
  const a = Date.UTC(from.y, from.m - 1, from.d);
  const b = Date.UTC(to.y, to.m - 1, to.d);
  return Math.round((b - a) / 86_400_000);
}

function weekdayOf(date: CivilDate): number {
  // UTC noon avoids DST edge cases; weekday is calendar-stable for civil dates.
  return new Date(Date.UTC(date.y, date.m - 1, date.d, 12)).getUTCDay();
}

export function nthWeekdayInMonth(
  year: number,
  month: number,
  weekday: number,
  nth: number,
): CivilDate {
  if (nth === -1) {
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const last: CivilDate = { y: year, m: month, d: lastDay };
    const diff = (weekdayOf(last) - weekday + 7) % 7;
    return { y: year, m: month, d: lastDay - diff };
  }

  const first: CivilDate = { y: year, m: month, d: 1 };
  const offset = (weekday - weekdayOf(first) + 7) % 7;
  const day = 1 + offset + (nth - 1) * 7;
  return { y: year, m: month, d: day };
}

export function occurrenceInYear(
  item: Pick<
    OpsSpecialDayItem,
    "recurrence" | "month" | "day" | "weekday" | "nth"
  >,
  year: number,
): CivilDate | null {
  if (item.recurrence === "fixed") {
    if (!item.month || !item.day) return null;
    return { y: year, m: item.month, d: item.day };
  }
  if (
    item.recurrence === "nthWeekday" &&
    item.month &&
    item.weekday != null &&
    item.nth != null
  ) {
    return nthWeekdayInMonth(year, item.month, item.weekday, item.nth);
  }
  return null;
}

export function nextOccurrence(
  item: OpsSpecialDayItem,
  today: CivilDate,
): CivilDate | null {
  const thisYear = occurrenceInYear(item, today.y);
  if (thisYear && daysBetween(today, thisYear) >= 0) return thisYear;
  return occurrenceInYear(item, today.y + 1);
}

function normalizeItem(raw: OpsSpecialDayItem): OpsSpecialDayItem | null {
  if (!raw?.key || !raw.title || !raw.month) return null;
  const recurrence: SpecialDayRecurrence =
    raw.recurrence === "nthWeekday" ? "nthWeekday" : "fixed";
  const priority: SpecialDayPriority =
    raw.priority === "high" ? "high" : "normal";
  return {
    key: raw.key,
    title: raw.title,
    enabled: raw.enabled !== false,
    priority,
    recurrence,
    month: raw.month,
    day: raw.day,
    weekday: raw.weekday,
    nth: raw.nth,
    leadDays: raw.leadDays,
    pushRepeatDays: raw.pushRepeatDays,
    hint: raw.hint,
  };
}

function normalizeRepeatDays(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isInteger(value) && value >= 1) {
    return value;
  }
  return fallback;
}

export async function fetchSpecialDaysConfig(): Promise<SpecialDaysConfig> {
  try {
    // Sin CDN: el cron y Ops deben ver el Publish al instante.
    const sanity = process.env.SANITY_API_WRITE_TOKEN
      ? getWriteClient()
      : client;
    const doc = await sanity.fetch<SanityDoc | null>(query);
    if (doc?.items?.length) {
      const items = doc.items
        .map(normalizeItem)
        .filter((item): item is OpsSpecialDayItem => item != null);
      return {
        defaultLeadDays:
          typeof doc.defaultLeadDays === "number" && doc.defaultLeadDays >= 0
            ? doc.defaultLeadDays
            : DEFAULT_SPECIAL_DAYS_LEAD,
        pushRepeatDays: normalizeRepeatDays(
          doc.pushRepeatDays,
          DEFAULT_PUSH_REPEAT_DAYS,
        ),
        items,
      };
    }
  } catch (error) {
    console.error("[ops/special-days] fetch Sanity", error);
  }

  return {
    defaultLeadDays: DEFAULT_SPECIAL_DAYS_LEAD,
    pushRepeatDays: DEFAULT_PUSH_REPEAT_DAYS,
    items: DEFAULT_SPECIAL_DAYS.map((item) => ({ ...item })),
  };
}

/**
 * Primera push al entrar en la ventana (daysUntil === leadDays),
 * luego cada `repeatDays`, e incluye el día del evento.
 */
export function shouldSendPushToday(
  daysUntil: number,
  leadDays: number,
  repeatDays: number,
): boolean {
  if (daysUntil < 0 || daysUntil > leadDays) return false;
  if (daysUntil === 0) return true;
  const daysIntoWindow = leadDays - daysUntil;
  const repeat = Math.max(1, repeatDays);
  return daysIntoWindow % repeat === 0;
}

export function resolveActiveAlerts(
  config: SpecialDaysConfig,
  today = todayInArgentina(),
): OpsSpecialDayAlert[] {
  const alerts: OpsSpecialDayAlert[] = [];

  for (const item of config.items) {
    if (!item.enabled) continue;
    const next = nextOccurrence(item, today);
    if (!next) continue;

    const leadDays =
      typeof item.leadDays === "number" && item.leadDays >= 0
        ? item.leadDays
        : config.defaultLeadDays;
    const pushRepeatDays = normalizeRepeatDays(
      item.pushRepeatDays,
      config.pushRepeatDays,
    );
    const daysUntil = daysBetween(today, next);
    if (daysUntil < 0 || daysUntil > leadDays) continue;

    alerts.push({
      key: item.key,
      title: item.title,
      priority: item.priority,
      hint: item.hint,
      date: formatCivilDate(next),
      daysUntil,
      leadDays,
      pushRepeatDays,
      isToday: daysUntil === 0,
    });
  }

  alerts.sort((a, b) => {
    if (a.daysUntil !== b.daysUntil) return a.daysUntil - b.daysUntil;
    if (a.priority !== b.priority) {
      return a.priority === "high" ? -1 : 1;
    }
    return a.title.localeCompare(b.title, "es");
  });

  return alerts;
}

export function resolvePushAlertsForToday(
  config: SpecialDaysConfig,
  today = todayInArgentina(),
): OpsSpecialDayAlert[] {
  return resolveActiveAlerts(config, today).filter((alert) =>
    shouldSendPushToday(alert.daysUntil, alert.leadDays, alert.pushRepeatDays),
  );
}

export async function getOpsSpecialDayAlerts(): Promise<OpsSpecialDayAlert[]> {
  const config = await fetchSpecialDaysConfig();
  return resolveActiveAlerts(config);
}
