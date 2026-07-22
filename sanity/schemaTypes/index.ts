import type { SchemaTypeDefinition } from "sanity";

import { category } from "./category";
import { page } from "./page";
import { product } from "./product";

export const schemaTypes: SchemaTypeDefinition[] = [category, product, page];
