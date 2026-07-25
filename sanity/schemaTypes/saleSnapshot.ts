import { defineField, defineType } from "sanity";

/**
 * Hecho analítico inmutable: se crea al confirmar pago.
 * Las métricas de /ops leen solo este tipo — no el catálogo ni campos editables del pedido.
 */
export const saleSnapshot = defineType({
  name: "saleSnapshot",
  title: "Snapshot de venta",
  type: "document",
  // No debe editarse a mano; se oculta del desk structure.
  fields: [
    defineField({
      name: "orderId",
      title: "Order ID",
      type: "string",
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "orderNumber",
      title: "Número de pedido",
      type: "string",
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "paidAt",
      title: "Pagado en",
      type: "datetime",
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "currency",
      title: "Moneda",
      type: "string",
      initialValue: "ARS",
      readOnly: true,
    }),
    defineField({
      name: "items",
      title: "Ítems (congelados)",
      type: "array",
      readOnly: true,
      of: [
        {
          type: "object",
          name: "saleSnapshotItem",
          fields: [
            defineField({ name: "productId", type: "string", title: "Product ID" }),
            defineField({ name: "sku", type: "string", title: "SKU" }),
            defineField({ name: "title", type: "string", title: "Título" }),
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
            defineField({
              name: "unitCost",
              type: "number",
              title: "Costo unitario (ARS)",
              description: "Snapshot al momento de la venta; puede faltar.",
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
      name: "revenue",
      title: "Revenue (ARS)",
      type: "number",
      validation: (rule) => rule.min(0),
      readOnly: true,
    }),
    defineField({
      name: "cogs",
      title: "COGS (ARS)",
      type: "number",
      validation: (rule) => rule.min(0),
      readOnly: true,
    }),
    defineField({
      name: "grossProfit",
      title: "Ganancia bruta (ARS)",
      type: "number",
      readOnly: true,
    }),
    defineField({
      name: "missingCostItemCount",
      title: "Ítems sin costo",
      type: "number",
      description: "Cantidad de líneas sin unitCost al momento del snapshot.",
      readOnly: true,
    }),
    defineField({
      name: "customerRegion",
      title: "Región (sin PII)",
      type: "object",
      readOnly: true,
      fields: [
        defineField({ name: "city", type: "string", title: "Ciudad" }),
        defineField({ name: "province", type: "string", title: "Provincia" }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "orderNumber",
      revenue: "revenue",
      paidAt: "paidAt",
    },
    prepare: ({ title, revenue, paidAt }) => ({
      title: title || "Venta",
      subtitle: `$${revenue ?? 0} · ${paidAt ? String(paidAt).slice(0, 10) : "—"}`,
    }),
  },
});
