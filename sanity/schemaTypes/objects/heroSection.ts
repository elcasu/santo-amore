import { defineField, defineType } from "sanity";

export const heroSection = defineType({
  name: "heroSection",
  title: "Hero",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: "Ej: The 2026 Curation",
    }),
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "titleHighlight",
      title: "Título destacado",
      type: "string",
      description: "Parte resaltada del título (ej: Modern Grace.)",
    }),
    defineField({
      name: "subtitle",
      title: "Subtítulo",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "backgroundImage",
      title: "Imagen de fondo",
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
      name: "primaryCta",
      title: "CTA principal",
      type: "ctaLink",
    }),
    defineField({
      name: "secondaryCta",
      title: "CTA secundario",
      type: "ctaLink",
    }),
  ],
});
