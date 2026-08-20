import { defineField, defineType } from "sanity";

export const journalTeaser = defineType({
  name: "journalTeaser",
  title: "Oficio / presencia",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      initialValue: "El taller",
      description: "Ej: El taller",
    }),
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Texto",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "cta",
      title: "CTA",
      type: "ctaLink",
    }),
  ],
});
