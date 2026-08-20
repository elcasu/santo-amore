export type FieldCell = { x: number; y: number };

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function easeOutCubic(t: number) {
  const x = clamp(t, 0, 1);
  return 1 - (1 - x) ** 3;
}

/** 1 at the pointer, 0 at/beyond radius. */
export function proximityT(distance: number, radius: number) {
  if (radius <= 0) return 0;
  return easeOutCubic(1 - clamp(distance / radius, 0, 1));
}

export function cellTransform(
  t: number,
  rest: { scale: number; alpha: number },
  peak: { scale: number; alpha: number },
) {
  return {
    scale: lerp(rest.scale, peak.scale, t),
    alpha: lerp(rest.alpha, peak.alpha, t),
  };
}

/** Pulls a control toward the pointer, stronger when closer. */
export function magneticOffset(
  dx: number,
  dy: number,
  radius: number,
  maxPull: number,
) {
  const dist = Math.hypot(dx, dy);
  const t = proximityT(dist, radius);
  if (dist === 0) return { x: 0, y: 0 };
  return {
    x: (dx / dist) * maxPull * t,
    y: (dy / dist) * maxPull * t,
  };
}

export function shouldAnimatePointerMotion(opts: {
  prefersReducedMotion: boolean;
  hasFinePointer: boolean;
}) {
  return !opts.prefersReducedMotion && opts.hasFinePointer;
}

export function layoutFieldCells(opts: {
  width: number;
  height: number;
  gap: number;
  padding?: number;
}): FieldCell[] {
  const gap = Math.max(1, opts.gap);
  const padding = opts.padding ?? gap / 2;
  const innerW = Math.max(0, opts.width - padding * 2);
  const innerH = Math.max(0, opts.height - padding * 2);
  const cols = Math.max(1, Math.floor(innerW / gap) + 1);
  const rows = Math.max(1, Math.floor(innerH / gap) + 1);
  const gridW = (cols - 1) * gap;
  const gridH = (rows - 1) * gap;
  const ox = (opts.width - gridW) / 2;
  const oy = (opts.height - gridH) / 2;
  const cells: FieldCell[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ x: ox + c * gap, y: oy + r * gap });
    }
  }

  return cells;
}

export function idleAttractor(
  nowMs: number,
  width: number,
  height: number,
  drift = { x: 0.28, y: 0.26 },
) {
  const t = nowMs / 1000;
  return {
    x: width * (0.62 + drift.x * Math.sin(t * 0.35)),
    y: height * (0.48 + drift.y * Math.cos(t * 0.27)),
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const n = hex.replace("#", "").trim();
  if (n.length === 3) {
    return [
      parseInt(n[0] + n[0], 16),
      parseInt(n[1] + n[1], 16),
      parseInt(n[2] + n[2], 16),
    ];
  }
  return [
    parseInt(n.slice(0, 2), 16),
    parseInt(n.slice(2, 4), 16),
    parseInt(n.slice(4, 6), 16),
  ];
}

export function mixHex(a: string, b: string, t: number) {
  const ta = clamp(t, 0, 1);
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const toHex = (n: number) =>
    Math.round(n).toString(16).padStart(2, "0");
  return `#${toHex(lerp(ar, br, ta))}${toHex(lerp(ag, bg, ta))}${toHex(lerp(ab, bb, ta))}`;
}
