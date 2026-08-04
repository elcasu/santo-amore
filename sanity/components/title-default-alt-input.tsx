"use client";

import { useEffect, useRef } from "react";
import { set, useFormValue, type StringInputProps } from "sanity";

type ImageParent = {
  asset?: { _ref?: string };
};

/**
 * Rellena `alt` con el título solo al subir/cambiar la imagen (si el título ya existe).
 * No sincroniza mientras se escribe el título: eso hacía scroll automático al campo alt.
 */
export function TitleDefaultAltInput(props: StringInputProps) {
  const { value, onChange, renderDefault, path, elementProps } = props;
  const title = useFormValue(["title"]);
  const imagePath = path.slice(0, -1);
  const image = useFormValue(imagePath) as ImageParent | undefined;
  const assetId = image?.asset?._ref;
  const prevAssetId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!assetId) {
      prevAssetId.current = undefined;
      return;
    }
    if (assetId === prevAssetId.current) return;
    prevAssetId.current = assetId;

    if (typeof value === "string" && value.trim()) return;
    if (typeof title !== "string" || !title.trim()) return;

    onChange(set(title));
  }, [assetId, title, value, onChange]);

  const titleHint =
    typeof title === "string" && title.trim() ? title : undefined;

  return renderDefault({
    ...props,
    elementProps: {
      ...elementProps,
      placeholder: titleHint ?? elementProps.placeholder,
    },
  });
}
