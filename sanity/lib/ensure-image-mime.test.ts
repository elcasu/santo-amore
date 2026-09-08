import { describe, expect, it } from "vitest";

import {
  ensureImageFileMime,
  mimeFromFilename,
  needsImageMimeFix,
} from "./ensure-image-mime";

function makeFile(name: string, type = ""): File {
  return new File([new Uint8Array([0xff, 0xd8, 0xff])], name, type ? { type } : undefined);
}

describe("mimeFromFilename", () => {
  it("maps jpeg extensions used by WhatsApp Android downloads", () => {
    expect(mimeFromFilename("IMG-20260903-WA0001.jpg")).toBe("image/jpeg");
    expect(mimeFromFilename("foto.JPEG")).toBe("image/jpeg");
    expect(mimeFromFilename("foto.jfif")).toBe("image/jpeg");
  });

  it("returns undefined without a usable extension", () => {
    expect(mimeFromFilename("IMG-20260903-WA0001")).toBeUndefined();
    expect(mimeFromFilename(".jpg")).toBeUndefined();
  });
});

describe("needsImageMimeFix", () => {
  it("wants a rewrite for empty MIME and WhatsApp jpeg names", () => {
    expect(needsImageMimeFix({ name: "IMG-20260903-WA0001.jpg", type: "" })).toBe(
      "image/jpeg",
    );
    expect(
      needsImageMimeFix({
        name: "IMG-20260903-WA0001.jpg",
        type: "application/octet-stream",
      }),
    ).toBe("image/jpeg");
  });

  it("leaves real image and non-image types alone", () => {
    expect(needsImageMimeFix({ name: "pieza.jpg", type: "image/jpeg" })).toBeUndefined();
    expect(needsImageMimeFix({ name: "clip.mp4", type: "video/mp4" })).toBeUndefined();
    expect(
      needsImageMimeFix({ name: "nota.pdf", type: "application/octet-stream" }),
    ).toBeUndefined();
  });
});

describe("ensureImageFileMime", () => {
  it("rewrites empty MIME when the extension is jpeg", () => {
    const file = makeFile("IMG-20260903-WA0001.jpg");
    expect(file.type).toBe("");
    const fixed = ensureImageFileMime(file);
    expect(fixed.type).toBe("image/jpeg");
    expect(fixed.name).toBe(file.name);
  });

  it("rewrites application/octet-stream from Android Downloads", () => {
    const file = makeFile("IMG-20260903-WA0001.jpg", "application/octet-stream");
    expect(ensureImageFileMime(file).type).toBe("image/jpeg");
  });

  it("keeps a file that already has an image MIME", () => {
    const file = makeFile("pieza.jpg", "image/jpeg");
    expect(ensureImageFileMime(file)).toBe(file);
  });

  it("does not rewrite non-image MIME with a real type", () => {
    const file = makeFile("clip.mp4", "video/mp4");
    expect(ensureImageFileMime(file)).toBe(file);
  });

  it("leaves octet-stream alone when the extension is not an image", () => {
    const file = makeFile("nota.pdf", "application/octet-stream");
    expect(ensureImageFileMime(file)).toBe(file);
  });
});
