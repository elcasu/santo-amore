import { defineField, defineType } from "sanity";

/**
 * Suscripción Web Push de un dispositivo Ops.
 * Se crea/actualiza desde /api/ops/push/subscribe; no editar a mano.
 */
export const opsPushSubscription = defineType({
  name: "opsPushSubscription",
  title: "Ops · Push subscription",
  type: "document",
  fields: [
    defineField({
      name: "endpoint",
      title: "Endpoint",
      type: "url",
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "p256dh",
      title: "Key p256dh",
      type: "string",
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "auth",
      title: "Key auth",
      type: "string",
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "userAgent",
      title: "User-Agent",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "createdAt",
      title: "Creada",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "updatedAt",
      title: "Actualizada",
      type: "datetime",
      readOnly: true,
    }),
  ],
  preview: {
    select: { endpoint: "endpoint", updatedAt: "updatedAt" },
    prepare: ({ endpoint, updatedAt }) => ({
      title: "Push Ops",
      subtitle: [
        endpoint ? String(endpoint).slice(0, 48) : null,
        updatedAt ? String(updatedAt).slice(0, 10) : null,
      ]
        .filter(Boolean)
        .join(" · "),
    }),
  },
});
