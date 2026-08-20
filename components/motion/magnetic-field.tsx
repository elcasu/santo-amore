"use client";

import { useEffect, useRef } from "react";

import {
  cellTransform,
  idleAttractor,
  layoutFieldCells,
  lerp,
  mixHex,
  proximityT,
  shouldAnimatePointerMotion,
  type FieldCell,
} from "@/lib/motion/proximity";

type Variant = "dark" | "light";

const VARIANTS: Record<
  Variant,
  {
    rest: { scale: number; alpha: number };
    peak: { scale: number; alpha: number };
    restColor: string;
    peakColor: string;
    gap: number;
    radius: number;
    restSize: number;
    followPointer: number;
    followIdle: number;
    idleDrift: { x: number; y: number };
  }
> = {
  dark: {
    rest: { scale: 1, alpha: 0.12 },
    peak: { scale: 2.4, alpha: 0.72 },
    restColor: "#fbf9f8",
    peakColor: "#ffc4ba",
    gap: 32,
    radius: 130,
    restSize: 4.5,
    followPointer: 0.14,
    followIdle: 0.03,
    idleDrift: { x: 0.12, y: 0.1 },
  },
  light: {
    rest: { scale: 1, alpha: 0.18 },
    peak: { scale: 2.8, alpha: 0.88 },
    restColor: "#e5beb8",
    peakColor: "#b71511",
    gap: 32,
    radius: 130,
    restSize: 5,
    followPointer: 0.2,
    followIdle: 0.04,
    idleDrift: { x: 0.28, y: 0.26 },
  },
};

export function MagneticField({
  variant = "dark",
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    const wrapEl = wrapRef.current;
    if (!canvasEl || !wrapEl) return;

    const gfx = canvasEl.getContext("2d");
    if (!gfx) return;

    const canvas: HTMLCanvasElement = canvasEl;
    const wrap: HTMLDivElement = wrapEl;
    const ctx: CanvasRenderingContext2D = gfx;

    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fineMq = window.matchMedia("(pointer: fine)");
    const cfg = VARIANTS[variant];

    let cells: FieldCell[] = [];
    let raf = 0;
    let running = true;
    let visible = true;
    let pointer: { x: number; y: number } | null = null;
    let attractor = { x: 0, y: 0 };
    let w = 0;
    let h = 0;

    function layout() {
      const rect = wrap.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cells = layoutFieldCells({ width: w, height: h, gap: cfg.gap });
      if (attractor.x === 0 && attractor.y === 0) {
        attractor = { x: w * 0.65, y: h * 0.45 };
      }
      paint(performance.now());
    }

    function paint(now: number) {
      if (w === 0 || h === 0) return;

      const pointerOk = shouldAnimatePointerMotion({
        prefersReducedMotion: reduceMq.matches,
        hasFinePointer: fineMq.matches,
      });
      const target =
        pointerOk && pointer
          ? pointer
          : reduceMq.matches
            ? { x: w * 0.65, y: h * 0.45 }
            : idleAttractor(now, w, h, cfg.idleDrift);
      const follow = pointer ? cfg.followPointer : cfg.followIdle;
      attractor.x = lerp(attractor.x, target.x, follow);
      attractor.y = lerp(attractor.y, target.y, follow);

      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";

      for (const cell of cells) {
        const dist = Math.hypot(cell.x - attractor.x, cell.y - attractor.y);
        const t = proximityT(dist, cfg.radius);
        const { scale, alpha } = cellTransform(t, cfg.rest, cfg.peak);
        if (alpha < 0.02) continue;
        const size = cfg.restSize * scale;
        const half = size / 2;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = mixHex(cfg.restColor, cfg.peakColor, t);
        ctx.lineWidth = Math.max(1, size * 0.2);
        ctx.beginPath();
        ctx.moveTo(cell.x - half, cell.y);
        ctx.lineTo(cell.x + half, cell.y);
        ctx.moveTo(cell.x, cell.y - half);
        ctx.lineTo(cell.x, cell.y + half);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    }

    function tick(now: number) {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      if (visible) paint(now);
    }

    function onPointerMove(e: PointerEvent) {
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < -48 || y < -48 || x > rect.width + 48 || y > rect.height + 48) {
        pointer = null;
        return;
      }
      pointer = { x, y };
    }

    function onPointerLeave() {
      pointer = null;
    }

    layout();

    const ro = new ResizeObserver(layout);
    ro.observe(wrap);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.01 },
    );
    io.observe(wrap);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    if (!reduceMq.matches) {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [variant]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
