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

/**
 * Android (sobre todo fotos bajadas de WhatsApp) a menudo entrega JPEG/PNG
 * con MIME vacío o application/octet-stream. Sanity exige image/* y descarta
 * el archivo en silencio.
 */
export function ensureImageFileMime(file: File): File {
  if (file.type.toLowerCase().startsWith("image/")) return file;

  const type = file.type.toLowerCase();
  if (type && !UNTRUSTWORTHY_MIME.has(type)) return file;

  const mime = mimeFromFilename(file.name);
  if (!mime) return file;

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
      !input.files?.length ||
      typeof DataTransfer === "undefined"
    ) {
      return;
    }

    const original = Array.from(input.files);
    const fixed = original.map(ensureImageFileMime);
    if (fixed.every((file, index) => file === original[index])) return;

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
