import { defineField, defineType } from "sanity";

export const order = defineType({
  name: "order",
  title: "Pedido",
  type: "document",
  fields: [
    defineField({
      name: "orderNumber",
      title: "Número de pedido",
      type: "string",
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "status",
      title: "Estado de pago",
      type: "string",
      options: {
        list: [
          { title: "Pendiente", value: "pending" },
          { title: "Pagado", value: "paid" },
          { title: "Rechazado", value: "rejected" },
          { title: "Cancelado", value: "cancelled" },
        ],
        layout: "radio",
      },
      initialValue: "pending",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "fulfillmentStatus",
      title: "Estado de preparación / envío",
      type: "string",
      options: {
        list: [
          { title: "Por preparar", value: "to_prepare" },
          { title: "Preparando", value: "preparing" },
          { title: "Enviado", value: "shipped" },
          { title: "Entregado", value: "delivered" },
        ],
        layout: "radio",
      },
      initialValue: "to_prepare",
    }),
    defineField({
      name: "externalReference",
      title: "Referencia externa",
      type: "string",
      description: "ID usado con MercadoPago (external_reference).",
      readOnly: true,
    }),
    defineField({
      name: "items",
      title: "Ítems",
      type: "array",
      of: [
        {
          type: "object",
          name: "orderItem",
          fields: [
            defineField({ name: "productId", type: "string", title: "Product ID" }),
            defineField({ name: "title", type: "string", title: "Título" }),
            defineField({ name: "slug", type: "string", title: "Slug" }),
            defineField({ name: "sku", type: "string", title: "SKU" }),
            defineField({
              name: "qty",
              type: "number",
              title: "Cantidad",
              validation: (rule) => rule.min(1).integer(),
            }),
            defineField({
              name: "unitPrice",
              type: "number",
              title: "Precio unitario (ARS)",
            }),
          ],
          preview: {
            select: { title: "title", qty: "qty", unitPrice: "unitPrice" },
            prepare: ({ title, qty, unitPrice }) => ({
              title: title || "Ítem",
              subtitle: `${qty ?? 0} × $${unitPrice ?? 0}`,
            }),
          },
        },
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "customer",
      title: "Cliente",
      type: "object",
      fields: [
        defineField({ name: "name", type: "string", title: "Nombre" }),
        defineField({ name: "email", type: "string", title: "Email" }),
        defineField({ name: "phone", type: "string", title: "Teléfono" }),
      ],
    }),
    defineField({
      name: "shipping",
      title: "Envío",
      type: "object",
      fields: [
        defineField({ name: "address", type: "string", title: "Dirección" }),
        defineField({ name: "city", type: "string", title: "Ciudad" }),
        defineField({ name: "province", type: "string", title: "Provincia" }),
        defineField({ name: "postalCode", type: "string", title: "Código postal" }),
        defineField({ name: "notes", type: "text", title: "Notas" }),
      ],
    }),
    defineField({
      name: "subtotal",
      title: "Subtotal (ARS)",
      type: "number",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "currency",
      title: "Moneda",
      type: "string",
      initialValue: "ARS",
      readOnly: true,
    }),
    defineField({
      name: "mpPreferenceId",
      title: "MP Preference ID",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "mpPaymentId",
      title: "MP Payment ID",
      type: "string",
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: "orderNumber",
      status: "status",
      fulfillmentStatus: "fulfillmentStatus",
      subtotal: "subtotal",
      customer: "customer.name",
    },
    prepare: ({ title, status, fulfillmentStatus, subtotal, customer }) => ({
      title: title || "Pedido",
      subtitle: `${status ?? "?"}${fulfillmentStatus ? ` / ${fulfillmentStatus}` : ""} · ${customer ?? "—"} · $${subtotal ?? 0}`,
    }),
  },
  orderings: [
    {
      title: "Más recientes",
      name: "createdDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
  ],
});
