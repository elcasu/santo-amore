import { defineField, defineType } from "sanity";

/** Singleton: una sola home editable en Studio. */
export const home = defineType({
  name: "home",
  title: "Home",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Nombre interno",
      type: "string",
      initialValue: "Home",
      hidden: true,
    }),
    defineField({
      name: "hero",
      title: "Hero",
      type: "heroSection",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "collections",
      title: "Featured Collections",
      type: "collectionsSection",
    }),
    defineField({
      name: "journal",
      title: "Journal",
      type: "journalTeaser",
    }),
    defineField({
      name: "featuredProducts",
      title: "Piezas destacadas",
      type: "featuredProductsSection",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Home" };
    },
  },
});
