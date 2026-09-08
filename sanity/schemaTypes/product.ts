import { defineField, defineType, getPublishedId } from "sanity";
import type { ValidationContext } from "sanity";

import { AutoSlugInput } from "../components/auto-slug-input";
import { TitleDefaultAltInput } from "../components/title-default-alt-input";
import { apiVersion } from "../env";
import { SLUG_MAX_LENGTH, toSlug } from "../lib/slug";

/** Unicidad entre productos (excluye draft/versiones del documento actual). */
async function isUniqueProductSlug(
  slug: string,
  context: Pick<ValidationContext, "document" | "getClient">,
): Promise<boolean> {
  const { document, getClient } = context;
  if (!document?._id) return true;

  const client = getClient({ apiVersion });
  return client.fetch(
    `!defined(*[
      _type == "product" &&
      !sanity::versionOf($published) &&
      slug.current == $slug
    ][0]._id)`,
    { slug, published: getPublishedId(document._id) },
    { tag: "validation.product-slug-unique" },
  );
}

function productImageAltField() {
  return defineField({
    name: "alt",
    title: "Texto alternativo",
    type: "string",
    description:
      "Al subir la imagen, si está vacío se completa con el nombre del producto.",
    components: { input: TitleDefaultAltInput },
  });
}

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
      description: "Se genera solo a partir del nombre; podés editarlo si hace falta.",
      options: {
        source: "title",
        maxLength: SLUG_MAX_LENGTH,
        slugify: toSlug,
        isUnique: isUniqueProductSlug,
      },
      components: { input: AutoSlugInput },
      validation: (rule) =>
        rule.required().custom(async (value, context) => {
          const current = value?.current ?? "";
          if (!current) return true;
          if (current !== toSlug(current)) {
            return `Solo minúsculas, números y guiones (sin espacios ni acentos). Sugerido: "${toSlug(current)}"`;
          }
          if (!(await isUniqueProductSlug(current, context))) {
            return "Ya existe otro producto con este slug.";
          }
          return true;
        }),
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
      description:
        "Si la foto viene de WhatsApp y en el teléfono no queda seleccionada, guardala en Galería y elegila de ahí.",
      options: { hotspot: true },
      fields: [productImageAltField()],
    }),
    defineField({
      name: "images",
      title: "Galería",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [productImageAltField()],
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
      description: "Ej: Muñeca, Mesa, Encargo",
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
