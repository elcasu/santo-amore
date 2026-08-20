"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import {
  magneticOffset,
  shouldAnimatePointerMotion,
} from "@/lib/motion/proximity";

export function Magnetic({
  children,
  className = "",
  radius = 90,
  maxPull = 10,
}: {
  children: ReactNode;
  className?: string;
  radius?: number;
  maxPull?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");
    const sync = () =>
      setEnabled(
        shouldAnimatePointerMotion({
          prefersReducedMotion: reduce.matches,
          hasFinePointer: fine.matches,
        }),
      );
    sync();
    reduce.addEventListener("change", sync);
    fine.addEventListener("change", sync);
    return () => {
      reduce.removeEventListener("change", sync);
      fine.removeEventListener("change", sync);
    };
  }, []);

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!enabled || !el) return;
    const rect = el.getBoundingClientRect();
    const { x, y } = magneticOffset(
      e.clientX - (rect.left + rect.width / 2),
      e.clientY - (rect.top + rect.height / 2),
      radius,
      maxPull,
    );
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  function onPointerLeave() {
    if (!ref.current) return;
    ref.current.style.transform = "translate3d(0, 0, 0)";
  }

  return (
    <div
      ref={ref}
      className={className}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{
        transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: enabled ? "transform" : undefined,
      }}
    >
      {children}
    </div>
  );
}
