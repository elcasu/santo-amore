import type { StructureResolver } from "sanity/structure";

const HIDDEN_TYPES = new Set(["home", "saleSnapshot"]);

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
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => !HIDDEN_TYPES.has(item.getId() ?? ""),
      ),
    ]);
