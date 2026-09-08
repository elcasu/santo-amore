const EXT_TO_MIME: Record<string, string> = {
  avif: "image/avif",
  bmp: "image/bmp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  jfif: "image/jpeg",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  tif: "image/tiff",
  tiff: "image/tiff",
  webp: "image/webp",
};

const UNTRUSTWORTHY_MIME = new Set([
  "",
  "application/octet-stream",
  "application/download",
]);

export function mimeFromFilename(filename: string): string | undefined {
  const base = filename.split(/[/\\]/).pop() ?? filename;
  const dot = base.lastIndexOf(".");
  if (dot <= 0 || dot === base.length - 1) return undefined;
  return EXT_TO_MIME[base.slice(dot + 1).toLowerCase()];
}

export function needsImageMimeFix(file: Pick<File, "type" | "name">): string | undefined {
  if (file.type.toLowerCase().startsWith("image/")) return undefined;

  const type = file.type.toLowerCase();
  if (type && !UNTRUSTWORTHY_MIME.has(type)) return undefined;

  return mimeFromFilename(file.name);
}

function stampFileMime(file: File, mime: string): boolean {
  try {
    Object.defineProperty(file, "type", {
      configurable: true,
      enumerable: true,
      value: mime,
    });
    return file.type.toLowerCase() === mime;
  } catch {
    return false;
  }
}

/**
 * Android (fotos bajadas de WhatsApp) suele entregar JPEG/PNG con MIME vacío
 * o application/octet-stream. Sanity exige image/* y, si no matchea, descarta
 * el archivo en silencio. Preferimos sellar el File original: en Chrome Android
 * asignar input.files = DataTransfer a veces no pega.
 */
export function ensureImageFileMime(file: File): File {
  const mime = needsImageMimeFix(file);
  if (!mime) return file;
  if (stampFileMime(file, mime)) return file;

  return new File([file], file.name, {
    type: mime,
    lastModified: file.lastModified,
  });
}

let uninstall: (() => void) | undefined;

export function installImageMimeFix(): () => void {
  if (typeof document === "undefined") return () => undefined;
  if (uninstall) return uninstall;

  const onChange = (event: Event) => {
    const input = event.target;
    if (
      !(input instanceof HTMLInputElement) ||
      input.type !== "file" ||
      !input.files?.length
    ) {
      return;
    }

    const original = Array.from(input.files);
    const fixed = original.map(ensureImageFileMime);
    if (fixed.every((file, index) => file === original[index])) return;
    if (typeof DataTransfer === "undefined") return;

    const transfer = new DataTransfer();
    for (const file of fixed) transfer.items.add(file);
    input.files = transfer.files;
  };

  document.addEventListener("change", onChange, true);
  uninstall = () => {
    document.removeEventListener("change", onChange, true);
    uninstall = undefined;
  };
  return uninstall;
}
