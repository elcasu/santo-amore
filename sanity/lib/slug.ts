export const SLUG_MAX_LENGTH = 96;

/** El slug va en la URL `/producto/[slug]`: mayúsculas, espacios o acentos rompen el detalle. */
export function toSlug(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, "");
}
