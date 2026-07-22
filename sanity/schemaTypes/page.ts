import { defineField, defineType } from "sanity";

export const page = defineType({
  name: "page",
  title: "Página",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
      description: "Ej: nosotros, envios, contacto",
    }),
    defineField({
      name: "excerpt",
      title: "Resumen",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "body",
      title: "Contenido",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
});
