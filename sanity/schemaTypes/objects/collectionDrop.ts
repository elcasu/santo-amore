import { defineField, defineType } from "sanity";

/** Ítem de vitrina: producto del catálogo + layout. */
export const collectionDrop = defineType({
  name: "collectionDrop",
  title: "Producto en vitrina",
  type: "object",
  fields: [
    defineField({
      name: "product",
      title: "Producto",
      type: "reference",
      to: [{ type: "product" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: "Opcional. Ej: Encargo. Si vacío, se usa el label de colección del producto.",
    }),
    defineField({
      name: "description",
      title: "Descripción (override)",
      type: "text",
      rows: 2,
      description:
        "Opcional. Si vacío, se usa la descripción corta del producto.",
    }),
    defineField({
      name: "span",
      title: "Tamaño en grilla",
      type: "string",
      options: {
        list: [
          { title: "Ancho (wide)", value: "wide" },
          { title: "Alto (tall)", value: "tall" },
          { title: "Cuadrado", value: "square" },
        ],
        layout: "radio",
      },
      initialValue: "square",
    }),
  ],
  preview: {
    select: {
      title: "product.title",
      subtitle: "label",
      media: "product.mainImage",
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || "Sin producto",
        subtitle: subtitle || "Vitrina",
        media,
      };
    },
  },
});
