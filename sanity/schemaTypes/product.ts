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
      description: "Precio de referencia. El checkout llega en fase 3.",
      validation: (rule) => rule.min(0),
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
    defineField({
      name: "available",
      title: "Disponible",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "mainImage",
      subtitle: "price",
    },
    prepare({ title, media, subtitle }) {
      return {
        title,
        media,
        subtitle:
          typeof subtitle === "number"
            ? `$${subtitle.toLocaleString("es-AR")}`
            : undefined,
      };
    },
  },
});
