"use client";

import { useEffect, useRef } from "react";
import { set, setIfMissing, useFormValue, type ObjectInputProps } from "sanity";

import { toSlug } from "../lib/slug";

type SlugValue = { _type?: string; current?: string };

/** Genera el slug desde `title` sin pedir el botón Generate; no pisa overrides manuales. */
export function AutoSlugInput(props: ObjectInputProps<SlugValue>) {
  const { value, onChange, schemaType, renderDefault } = props;
  const title = useFormValue(["title"]);
  const lastAutoSlug = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (typeof title !== "string" || !title.trim()) return;

    const next = toSlug(title);
    if (!next) return;

    const current = value?.current;

    if (lastAutoSlug.current === undefined && current === next) {
      lastAutoSlug.current = next;
      return;
    }

    const unlocked = !current || current === lastAutoSlug.current;
    if (!unlocked || current === next) return;

    lastAutoSlug.current = next;
    onChange([
      setIfMissing({ _type: schemaType.name }),
      set(next, ["current"]),
    ]);
  }, [title, value?.current, onChange, schemaType.name]);

  return renderDefault(props);
}
