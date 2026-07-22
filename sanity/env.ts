export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";

export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

/** Completá en `.env.local` (ver `.env.example`). Vacío hasta crear el proyecto en Sanity. */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
