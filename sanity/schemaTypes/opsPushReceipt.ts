import { defineField, defineType } from "sanity";

/**
 * Recibo idempotente de un envío push (evita duplicar si el cron corre 2× el mismo día).
 * _id estable: opsPushReceipt.{hash}
 */
export const opsPushReceipt = defineType({
  name: "opsPushReceipt",
  title: "Ops · Push receipt",
  type: "document",
  fields: [
    defineField({
      name: "subscriptionId",
      title: "Subscription ID",
      type: "string",
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "alertKey",
      title: "Día especial (key)",
      type: "string",
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "occurrenceDate",
      title: "Fecha del evento",
      type: "string",
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sentCivilDate",
      title: "Enviado el (AR)",
      type: "string",
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sentAt",
      title: "Enviado en",
      type: "datetime",
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      alertKey: "alertKey",
      sentCivilDate: "sentCivilDate",
      occurrenceDate: "occurrenceDate",
    },
    prepare: ({ alertKey, sentCivilDate, occurrenceDate }) => ({
      title: alertKey || "Push",
      subtitle: `${sentCivilDate ?? "?"} → evento ${occurrenceDate ?? "?"}`,
    }),
  },
});
