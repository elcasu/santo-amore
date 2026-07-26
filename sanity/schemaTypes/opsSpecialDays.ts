import { defineArrayMember, defineField, defineType } from "sanity";

import {
  DEFAULT_PUSH_REPEAT_DAYS,
  DEFAULT_SPECIAL_DAYS,
  DEFAULT_SPECIAL_DAYS_LEAD,
} from "@/lib/ops/special-days-defaults";

/** Singleton: calendario de días especiales para avisos en /ops. */
export const opsSpecialDays = defineType({
  name: "opsSpecialDays",
  title: "Días especiales",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Nombre interno",
      type: "string",
      initialValue: "Días especiales",
      hidden: true,
    }),
    defineField({
      name: "defaultLeadDays",
      title: "Anticipación por defecto (días)",
      description:
        "Cuántos días antes avisar (banner + primera push). Cada ítem puede sobreescribirlo.",
      type: "number",
      initialValue: DEFAULT_SPECIAL_DAYS_LEAD,
      validation: (rule) => rule.required().integer().min(0).max(60),
    }),
    defineField({
      name: "pushRepeatDays",
      title: "Reenviar push cada (días)",
      description:
        "Tras la primera push (al entrar en la ventana), vuelve a avisar cada N días hasta el evento. 1 = todos los días.",
      type: "number",
      initialValue: DEFAULT_PUSH_REPEAT_DAYS,
      validation: (rule) => rule.required().integer().min(1).max(30),
    }),
    defineField({
      name: "items",
      title: "Días especiales",
      type: "array",
      initialValue: DEFAULT_SPECIAL_DAYS,
      of: [
        defineArrayMember({
          type: "object",
          name: "opsSpecialDayItem",
          fields: [
            defineField({
              name: "key",
              title: "Clave",
              type: "string",
              description: "Identificador estable (ej. dia-madre). No cambiar.",
              validation: (rule) =>
                rule.required().regex(/^[a-z0-9-]+$/, {
                  name: "slug",
                  invert: false,
                }),
            }),
            defineField({
              name: "title",
              title: "Nombre",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "enabled",
              title: "Activo",
              type: "boolean",
              initialValue: true,
            }),
            defineField({
              name: "priority",
              title: "Prioridad",
              type: "string",
              options: {
                list: [
                  { title: "Alta", value: "high" },
                  { title: "Normal", value: "normal" },
                ],
                layout: "radio",
              },
              initialValue: "normal",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "recurrence",
              title: "Tipo de fecha",
              type: "string",
              options: {
                list: [
                  { title: "Fija (mes + día)", value: "fixed" },
                  {
                    title: "N-ésimo día de la semana del mes",
                    value: "nthWeekday",
                  },
                ],
                layout: "radio",
              },
              initialValue: "fixed",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "month",
              title: "Mes",
              type: "number",
              options: {
                list: [
                  { title: "Enero", value: 1 },
                  { title: "Febrero", value: 2 },
                  { title: "Marzo", value: 3 },
                  { title: "Abril", value: 4 },
                  { title: "Mayo", value: 5 },
                  { title: "Junio", value: 6 },
                  { title: "Julio", value: 7 },
                  { title: "Agosto", value: 8 },
                  { title: "Septiembre", value: 9 },
                  { title: "Octubre", value: 10 },
                  { title: "Noviembre", value: 11 },
                  { title: "Diciembre", value: 12 },
                ],
              },
              validation: (rule) => rule.required().integer().min(1).max(12),
            }),
            defineField({
              name: "day",
              title: "Día del mes",
              type: "number",
              hidden: ({ parent }) => parent?.recurrence !== "fixed",
              validation: (rule) =>
                rule.custom((value, context) => {
                  const parent = context.parent as { recurrence?: string };
                  if (parent?.recurrence !== "fixed") return true;
                  if (value == null) return "Requerido para fecha fija";
                  if (!Number.isInteger(value) || value < 1 || value > 31) {
                    return "Día entre 1 y 31";
                  }
                  return true;
                }),
            }),
            defineField({
              name: "weekday",
              title: "Día de la semana",
              type: "number",
              hidden: ({ parent }) => parent?.recurrence !== "nthWeekday",
              options: {
                list: [
                  { title: "Domingo", value: 0 },
                  { title: "Lunes", value: 1 },
                  { title: "Martes", value: 2 },
                  { title: "Miércoles", value: 3 },
                  { title: "Jueves", value: 4 },
                  { title: "Viernes", value: 5 },
                  { title: "Sábado", value: 6 },
                ],
              },
              validation: (rule) =>
                rule.custom((value, context) => {
                  const parent = context.parent as { recurrence?: string };
                  if (parent?.recurrence !== "nthWeekday") return true;
                  if (value == null) return "Requerido";
                  if (!Number.isInteger(value) || value < 0 || value > 6) {
                    return "0–6";
                  }
                  return true;
                }),
            }),
            defineField({
              name: "nth",
              title: "Cuál en el mes",
              description: "1 = primero, 2 = segundo… −1 = último",
              type: "number",
              hidden: ({ parent }) => parent?.recurrence !== "nthWeekday",
              options: {
                list: [
                  { title: "1º", value: 1 },
                  { title: "2º", value: 2 },
                  { title: "3º", value: 3 },
                  { title: "4º", value: 4 },
                  { title: "Último", value: -1 },
                ],
              },
              validation: (rule) =>
                rule.custom((value, context) => {
                  const parent = context.parent as { recurrence?: string };
                  if (parent?.recurrence !== "nthWeekday") return true;
                  if (value == null) return "Requerido";
                  if (![1, 2, 3, 4, -1].includes(value)) {
                    return "Usá 1–4 o −1";
                  }
                  return true;
                }),
            }),
            defineField({
              name: "leadDays",
              title: "Anticipación (override)",
              description: "Vacío = usar el default del documento",
              type: "number",
              validation: (rule) => rule.integer().min(0).max(60),
            }),
            defineField({
              name: "pushRepeatDays",
              title: "Reenviar push cada (override)",
              description: "Vacío = usar el default del documento",
              type: "number",
              validation: (rule) => rule.integer().min(1).max(30),
            }),
            defineField({
              name: "hint",
              title: "Nota para Ops",
              type: "string",
            }),
          ],
          preview: {
            select: {
              title: "title",
              enabled: "enabled",
              priority: "priority",
              recurrence: "recurrence",
              month: "month",
              day: "day",
            },
            prepare: ({
              title,
              enabled,
              priority,
              recurrence,
              month,
              day,
            }) => ({
              title: title || "Día",
              subtitle: [
                enabled === false ? "Off" : "On",
                priority === "high" ? "Prioridad alta" : "Normal",
                recurrence === "fixed" && month && day
                  ? `${day}/${month}`
                  : recurrence === "nthWeekday"
                    ? `móvil · mes ${month}`
                    : null,
              ]
                .filter(Boolean)
                .join(" · "),
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Días especiales" };
    },
  },
});
