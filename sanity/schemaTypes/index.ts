import type { SchemaTypeDefinition } from "sanity";

import { category } from "./category";
import { home } from "./home";
import { ctaLink } from "./objects/ctaLink";
import { collectionDrop } from "./objects/collectionDrop";
import { collectionsSection } from "./objects/collectionsSection";
import { featuredProductsSection } from "./objects/featuredProductsSection";
import { heroSection } from "./objects/heroSection";
import { journalTeaser } from "./objects/journalTeaser";
import { opsPushReceipt } from "./opsPushReceipt";
import { opsPushSubscription } from "./opsPushSubscription";
import { opsSpecialDays } from "./opsSpecialDays";
import { order } from "./order";
import { page } from "./page";
import { product } from "./product";
import { saleSnapshot } from "./saleSnapshot";

export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  home,
  category,
  product,
  page,
  order,
  saleSnapshot,
  opsSpecialDays,
  opsPushSubscription,
  opsPushReceipt,
  // Objects
  ctaLink,
  heroSection,
  collectionDrop,
  collectionsSection,
  journalTeaser,
  featuredProductsSection,
];
