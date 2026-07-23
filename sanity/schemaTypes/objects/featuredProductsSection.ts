import { defineField, defineType } from "sanity";

export const featuredProductsSection = defineType({
  name: "featuredProductsSection",
  title: "Piezas destacadas",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Título de sección",
      type: "string",
    }),
    defineField({
      name: "viewAllCta",
      title: "CTA ver todas",
      type: "ctaLink",
    }),
    defineField({
      name: "products",
      title: "Productos",
      type: "array",
      of: [{ type: "reference", to: [{ type: "product" }] }],
      description:
        "Si está vacío, se usan productos marcados como Destacado.",
      validation: (rule) => rule.max(6),
    }),
  ],
});
