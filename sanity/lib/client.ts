import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // En local, API directo para ver Publish al instante (CDN cachea).
  useCdn: process.env.NODE_ENV === "production",
});

// El CDN cachea ~60s: una lectura posterior a un patch devuelve el valor viejo.
// Ops escribe y relee en la misma request, así que siempre va al API directo.
export const freshClient = client.withConfig({ useCdn: false });
