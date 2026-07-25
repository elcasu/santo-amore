import { defineField, defineType } from "sanity";

export const product = defineType({
  name: "product",
  title: "Producto",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Nombre",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sku",
      title: "SKU",
      type: "string",
      description: "Identificador estable para checkout / MercadoPago.",
    }),
    defineField({
      name: "mainImage",
      title: "Imagen principal",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Texto alternativo",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "images",
      title: "Galería",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Texto alternativo",
              type: "string",
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "categories",
      title: "Categorías",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
    }),
    defineField({
      name: "price",
      title: "Precio (ARS)",
      type: "number",
      description: "Precio de venta actual.",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "unitCost",
      title: "Costo unitario (ARS)",
      type: "number",
      description:
        "Costo actual (materiales/mano de obra). Solo se usa al crear ventas nuevas; no reescribe métricas históricas.",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "compareAtPrice",
      title: "Precio anterior (ARS)",
      type: "number",
      description: "Opcional: precio tachado / promo.",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "commerceStatus",
      title: "Estado de comercio",
      type: "string",
      options: {
        list: [
          { title: "Disponible", value: "available" },
          { title: "Próximamente", value: "coming_soon" },
          { title: "Agotado", value: "sold_out" },
          { title: "Encargo / made to order", value: "made_to_order" },
        ],
        layout: "radio",
      },
      initialValue: "available",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "trackInventory",
      title: "Controlar stock numérico",
      type: "boolean",
      description:
        "Si está activo, la UI usa la cantidad. Si no, solo importa el estado de comercio.",
      initialValue: false,
      hidden: ({ parent }) =>
        parent?.commerceStatus === "coming_soon" ||
        parent?.commerceStatus === "made_to_order",
    }),
    defineField({
      name: "stockQty",
      title: "Cantidad en stock",
      type: "number",
      description: "Unidades disponibles. Con 0 se trata como agotado en la UI.",
      validation: (rule) => rule.min(0).integer(),
      hidden: ({ parent }) => !parent?.trackInventory,
    }),
    defineField({
      name: "maxPerOrder",
      title: "Máximo por pedido",
      type: "number",
      description: "Tope de unidades en carrito (útil para piezas únicas).",
      validation: (rule) => rule.min(1).integer(),
      hidden: ({ parent }) =>
        parent?.commerceStatus === "coming_soon" ||
        parent?.commerceStatus === "sold_out",
    }),
    defineField({
      name: "comingSoonLabel",
      title: "Label próximamente",
      type: "string",
      description: 'Ej: "Próximamente · Agosto"',
      hidden: ({ parent }) => parent?.commerceStatus !== "coming_soon",
    }),
    defineField({
      name: "leadTimeDays",
      title: "Lead time (días)",
      type: "number",
      description: "Tiempo estimado de elaboración para encargos.",
      validation: (rule) => rule.min(1).integer(),
      hidden: ({ parent }) => parent?.commerceStatus !== "made_to_order",
    }),
    defineField({
      name: "collectionLabel",
      title: "Label de colección",
      type: "string",
      description: "Ej: New Heritage Collection",
    }),
    defineField({
      name: "description",
      title: "Descripción corta",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "body",
      title: "Detalle",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "featured",
      title: "Destacado",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "mainImage",
      price: "price",
      status: "commerceStatus",
    },
    prepare({ title, media, price, status }) {
      const priceLabel =
        typeof price === "number"
          ? `$${price.toLocaleString("es-AR")}`
          : undefined;
      const statusLabel =
        typeof status === "string" ? status.replaceAll("_", " ") : undefined;
      return {
        title,
        media,
        subtitle: [priceLabel, statusLabel].filter(Boolean).join(" · "),
      };
    },
  },
});
