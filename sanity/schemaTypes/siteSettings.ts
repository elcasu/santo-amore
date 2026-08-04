import { defineField, defineType } from "sanity";

/** Singleton: datos de marca visibles en el chrome del store. */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Datos del negocio",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Nombre interno",
      type: "string",
      initialValue: "Datos del negocio",
      hidden: true,
    }),
    defineField({
      name: "locationLabel",
      title: "Ubicación",
      description:
        "Texto visible en header y footer (ej. Mar del Plata, Argentina).",
      type: "string",
      initialValue: "Mar del Plata, Argentina",
      validation: (rule) => rule.required().min(2).max(80),
    }),
    defineField({
      name: "countryCode",
      title: "País (ISO)",
      description:
        "Código de país de 2 letras para la bandera (ej. AR = Argentina).",
      type: "string",
      initialValue: "AR",
      validation: (rule) =>
        rule.required().regex(/^[A-Za-z]{2}$/, {
          name: "ISO alpha-2",
          invert: false,
        }),
    }),
  ],
  preview: {
    select: { locationLabel: "locationLabel", countryCode: "countryCode" },
    prepare({ locationLabel, countryCode }) {
      return {
        title: "Datos del negocio",
        subtitle: [countryCode?.toUpperCase(), locationLabel]
          .filter(Boolean)
          .join(" · ") || "Sin ubicación",
      };
    },
  },
});
