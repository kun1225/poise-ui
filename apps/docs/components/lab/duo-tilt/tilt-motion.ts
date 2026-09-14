/** Interaction tuning based on Apple's iPhone Duo product viewer. */
import type { SpringConfig } from "./spring";

/** Spring used after release. */
export const FOLD_SPRING: SpringConfig = Object.freeze({
  stiffness: 20,
  damping: 0.95,
});

/** Drag interpolation factor. */
export const LERP_DRAG = 0.2;

/** Release travel duration in seconds. */
export const THROW_SECONDS = 0.025;

/** Rubber-band resistance strength. */
export const FALLOFF_STRENGTH = 2;

/** Maximum fold angle in either direction. */
export const LIMIT_DEG = 180;

/** Angle where rubber-band resistance begins. */
export const FALLOFF_DEG = 170;

/** Fold angle change per drag pixel. */
export const DEGREES_PER_PIXEL = 0.55;

/** Apply rubber-band resistance past the falloff point. */
function resist(overshootDeg: number): number {
  const d = Math.min((overshootDeg * Math.PI) / 180, 1);
  const eased = d * Math.pow(1 / (d + 1), FALLOFF_STRENGTH);
  return (eased * 180) / Math.PI;
}

/** Softens a drag target once it pushes past the falloff point. */
export function rubberBand(angleDeg: number): number {
  if (angleDeg > FALLOFF_DEG)
    return FALLOFF_DEG + resist(angleDeg - FALLOFF_DEG);
  if (angleDeg < -FALLOFF_DEG)
    return -FALLOFF_DEG - resist(-FALLOFF_DEG - angleDeg);
  return angleDeg;
}

/** The hard stop Apple applies after the lerp, never before it. */
export function clampFold(angleDeg: number): number {
  return Math.max(-LIMIT_DEG, Math.min(LIMIT_DEG, angleDeg));
}
