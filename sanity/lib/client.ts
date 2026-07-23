import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // En local, API directo para ver Publish al instante (CDN cachea).
  useCdn: process.env.NODE_ENV === "production",
});
