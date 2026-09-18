export const BRAND_SLATE = "#1e293b";
export const BRAND_STONE = "#fafaf9";

/** Plaque + cut-out F on a 32×32 canvas. Proportions from the approved mark. */
export const FACHADA_MARK = {
  canvas: 32,
  plaque: { x: 6.9, y: 2, w: 18.2, h: 28, r: 0.9 },
  stem: { x: 10.55, y: 7.2, w: 3.45, h: 17.55, r: 0.2 },
  window: { x: 15.35, w: 6.35, h: 3.75, r: 0.2, top: 7.2, bottom: 13.95 },
} as const;
