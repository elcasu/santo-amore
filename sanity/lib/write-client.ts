import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

export function getWriteClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "SANITY_API_WRITE_TOKEN no configurado. Necesario para crear/actualizar pedidos.",
    );
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
  });
}
