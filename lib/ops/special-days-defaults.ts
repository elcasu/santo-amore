/** Semilla compartida: schema Sanity + fallback si el singleton no existe. */

export type SpecialDayRecurrence = "fixed" | "nthWeekday";
export type SpecialDayPriority = "high" | "normal";

export type SpecialDaySeed = {
  key: string;
  title: string;
  enabled: boolean;
  priority: SpecialDayPriority;
  recurrence: SpecialDayRecurrence;
  month: number;
  day?: number;
  weekday?: number;
  nth?: number;
  hint?: string;
};

export const DEFAULT_SPECIAL_DAYS_LEAD = 7;
/** Cada cuántos días reenviar push dentro de la ventana (1 = todos los días). */
export const DEFAULT_PUSH_REPEAT_DAYS = 2;

export const DEFAULT_SPECIAL_DAYS: SpecialDaySeed[] = [
  {
    key: "dia-madre",
    title: "Día de la madre",
    enabled: true,
    priority: "high",
    recurrence: "nthWeekday",
    month: 10,
    weekday: 0,
    nth: 3,
    hint: "Revisar stock y piezas para regalo",
  },
  {
    key: "navidad",
    title: "Navidad",
    enabled: true,
    priority: "high",
    recurrence: "fixed",
    month: 12,
    day: 25,
    hint: "Temporada alta: stock y tiempos de envío",
  },
  {
    key: "san-valentin",
    title: "San Valentín",
    enabled: true,
    priority: "high",
    recurrence: "fixed",
    month: 2,
    day: 14,
    hint: "Revisar stock y piezas para regalo",
  },
  {
    key: "dia-amigo",
    title: "Día del amigo",
    enabled: true,
    priority: "high",
    recurrence: "fixed",
    month: 7,
    day: 20,
    hint: "Revisar stock y piezas para regalo",
  },
  {
    key: "dia-mujer",
    title: "Día de la mujer",
    enabled: true,
    priority: "high",
    recurrence: "fixed",
    month: 3,
    day: 8,
    hint: "Revisar stock y piezas para regalo",
  },
  {
    key: "dia-nino",
    title: "Día del niño",
    enabled: true,
    priority: "normal",
    recurrence: "nthWeekday",
    month: 8,
    weekday: 0,
    nth: 2,
  },
  {
    key: "dia-padre",
    title: "Día del padre",
    enabled: true,
    priority: "normal",
    recurrence: "nthWeekday",
    month: 6,
    weekday: 0,
    nth: 3,
  },
  {
    key: "reyes",
    title: "Reyes",
    enabled: true,
    priority: "normal",
    recurrence: "fixed",
    month: 1,
    day: 6,
  },
  {
    key: "dia-abuelos",
    title: "Día de los abuelos",
    enabled: true,
    priority: "normal",
    recurrence: "fixed",
    month: 7,
    day: 26,
  },
  {
    key: "dia-hermanos",
    title: "Día de los hermanos",
    enabled: true,
    priority: "normal",
    recurrence: "fixed",
    month: 4,
    day: 10,
  },
  {
    key: "dia-primos",
    title: "Día de los primos",
    enabled: false,
    priority: "normal",
    recurrence: "fixed",
    month: 7,
    day: 1,
    hint: "Sin fecha canónica fija: activá y ajustá mes/día en Studio",
  },
];
