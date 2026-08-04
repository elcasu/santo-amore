import { describe, expect, it, vi } from "vitest";

vi.mock("@/sanity/lib/client", () => ({ client: {} }));
vi.mock("@/sanity/lib/write-client", () => ({
  getWriteClient: () => ({}),
}));

import {
  daysBetween,
  formatCivilDate,
  nextOccurrence,
  nthWeekdayInMonth,
  occurrenceInYear,
  resolveActiveAlerts,
  shouldSendPushToday,
  todayInArgentina,
  type SpecialDaysConfig,
} from "@/lib/ops/special-days";

describe("civil date helpers", () => {
  it("formats civil dates", () => {
    expect(formatCivilDate({ y: 2026, m: 3, d: 8 })).toBe("2026-03-08");
  });

  it("computes daysBetween", () => {
    expect(
      daysBetween({ y: 2026, m: 3, d: 1 }, { y: 2026, m: 3, d: 8 }),
    ).toBe(7);
  });

  it("reads today in Argentina timezone", () => {
    // 2026-01-15 02:00 UTC = 2026-01-14 23:00 in AR (UTC-3)
    const date = todayInArgentina(new Date("2026-01-15T02:00:00.000Z"));
    expect(date).toEqual({ y: 2026, m: 1, d: 14 });
  });
});

describe("nthWeekdayInMonth / occurrence", () => {
  it("finds third Sunday of March 2026 (Mother's Day AR style example)", () => {
    // Sunday = 0
    expect(nthWeekdayInMonth(2026, 3, 0, 3)).toEqual({
      y: 2026,
      m: 3,
      d: 15,
    });
  });

  it("finds last weekday of month with nth=-1", () => {
    // Last Friday of July 2026
    expect(nthWeekdayInMonth(2026, 7, 5, -1)).toEqual({
      y: 2026,
      m: 7,
      d: 31,
    });
  });

  it("resolves fixed and nthWeekday occurrences", () => {
    expect(
      occurrenceInYear(
        { recurrence: "fixed", month: 12, day: 25 },
        2026,
      ),
    ).toEqual({ y: 2026, m: 12, d: 25 });

    expect(
      occurrenceInYear(
        { recurrence: "nthWeekday", month: 5, weekday: 0, nth: 2 },
        2026,
      ),
    ).toEqual(nthWeekdayInMonth(2026, 5, 0, 2));
  });

  it("rolls nextOccurrence to next year when date already passed", () => {
    const today = { y: 2026, m: 12, d: 26 };
    expect(
      nextOccurrence(
        {
          key: "navidad",
          title: "Navidad",
          enabled: true,
          priority: "high",
          recurrence: "fixed",
          month: 12,
          day: 25,
        },
        today,
      ),
    ).toEqual({ y: 2027, m: 12, d: 25 });
  });
});

describe("shouldSendPushToday", () => {
  it("sends on event day and at window entry", () => {
    expect(shouldSendPushToday(0, 7, 2)).toBe(true);
    expect(shouldSendPushToday(7, 7, 2)).toBe(true);
  });

  it("sends on repeat cadence inside window", () => {
    // lead=7, daysUntil=5 → daysIntoWindow=2 → every 2 days → true
    expect(shouldSendPushToday(5, 7, 2)).toBe(true);
    expect(shouldSendPushToday(6, 7, 2)).toBe(false);
  });

  it("rejects outside lead window", () => {
    expect(shouldSendPushToday(8, 7, 2)).toBe(false);
    expect(shouldSendPushToday(-1, 7, 2)).toBe(false);
  });
});

describe("resolveActiveAlerts", () => {
  const config: SpecialDaysConfig = {
    defaultLeadDays: 7,
    pushRepeatDays: 2,
    items: [
      {
        key: "navidad",
        title: "Navidad",
        enabled: true,
        priority: "high",
        recurrence: "fixed",
        month: 12,
        day: 25,
      },
      {
        key: "disabled",
        title: "Off",
        enabled: false,
        priority: "normal",
        recurrence: "fixed",
        month: 12,
        day: 24,
      },
    ],
  };

  it("returns alerts inside lead window sorted by daysUntil", () => {
    const alerts = resolveActiveAlerts(config, { y: 2026, m: 12, d: 20 });
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatchObject({
      key: "navidad",
      daysUntil: 5,
      isToday: false,
      date: "2026-12-25",
    });
  });

  it("marks isToday when daysUntil is 0", () => {
    const alerts = resolveActiveAlerts(config, { y: 2026, m: 12, d: 25 });
    expect(alerts[0]?.isToday).toBe(true);
  });
});
