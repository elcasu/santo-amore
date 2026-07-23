import { defineField, defineType } from "sanity";

export const collectionsSection = defineType({
  name: "collectionsSection",
  title: "Featured Collections",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Título de sección",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Descripción",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "exploreCta",
      title: "CTA explorar",
      type: "ctaLink",
    }),
    defineField({
      name: "drops",
      title: "Productos destacados",
      type: "array",
      of: [{ type: "collectionDrop" }],
      description:
        "Elegí productos del catálogo. Título, imagen y link salen del producto.",
      validation: (rule) => rule.max(6),
    }),
  ],
});
