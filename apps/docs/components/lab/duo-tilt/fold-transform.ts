/** Shared fold pose math for both renderers. */
export interface FoldPose {
  hingeLeft: boolean;
  tiltDeg: number;
  tiltRad: number;
}

export function foldPose(angleDeg: number): FoldPose {
  const hingeLeft = angleDeg >= 0;
  const tiltDeg = Math.min(Math.abs(angleDeg), 180) / 2;
  const tiltRad = (tiltDeg * Math.PI) / 180;
  return { hingeLeft, tiltDeg, tiltRad };
}

/** Apply the fold transform, including edge-on scaling at full tilt. */
export function applyFoldPose(el: HTMLElement, pose: FoldPose) {
  const { hingeLeft, tiltDeg, tiltRad } = pose;
  const signedDeg = hingeLeft ? tiltDeg : -tiltDeg;
  el.style.transformOrigin = hingeLeft ? "0% 50%" : "100% 50%";
  el.style.transform = `rotateY(${signedDeg}deg) scaleX(${Math.cos(tiltRad)})`;
}
