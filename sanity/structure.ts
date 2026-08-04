import type { StructureResolver } from "sanity/structure";

const HIDDEN_TYPES = new Set([
  "home",
  "siteSettings",
  "saleSnapshot",
  "opsSpecialDays",
  "opsPushSubscription",
  "opsPushReceipt",
]);

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Contenido")
    .items([
      S.listItem()
        .title("Home")
        .id("home")
        .child(
          S.document().schemaType("home").documentId("home").title("Home"),
        ),
      S.listItem()
        .title("Datos del negocio")
        .id("siteSettings")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("Datos del negocio"),
        ),
      S.listItem()
        .title("Días especiales")
        .id("opsSpecialDays")
        .child(
          S.document()
            .schemaType("opsSpecialDays")
            .documentId("opsSpecialDays")
            .title("Días especiales"),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !HIDDEN_TYPES.has(item.getId() ?? ""),
      ),
    ]);
