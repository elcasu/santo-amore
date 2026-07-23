import type { SchemaTypeDefinition } from "sanity";

import { category } from "./category";
import { home } from "./home";
import { ctaLink } from "./objects/ctaLink";
import { collectionDrop } from "./objects/collectionDrop";
import { collectionsSection } from "./objects/collectionsSection";
import { featuredProductsSection } from "./objects/featuredProductsSection";
import { heroSection } from "./objects/heroSection";
import { journalTeaser } from "./objects/journalTeaser";
import { page } from "./page";
import { product } from "./product";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  home,
  category,
  product,
  page,
  // Objects
  ctaLink,
  heroSection,
  collectionDrop,
  collectionsSection,
  journalTeaser,
  featuredProductsSection,
];
