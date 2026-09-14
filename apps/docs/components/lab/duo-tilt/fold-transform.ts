/**
 * The layout math shared by both renderers: which edge is the hinge, how far
 * open the panel is, and the CSS transform that puts it there. Both CssFold
 * and WebglFold apply this to their own element every frame, so the two
 * renderers tilt in space identically - only what happens to the pixels
 * inside differs.
 */
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

/**
 * `rotateY` alone reads as fairly flat unless the panel sits very close to
 * the eye (a small `perspective`), which then distorts its corners. Adding a
 * `scaleX(cos tilt)` on top forces the panel to reach a true edge-on sliver
 * at full tilt regardless of the perspective distance chosen - closer to how
 * a hinged screen actually looks closing.
 */
export function applyFoldPose(el: HTMLElement, pose: FoldPose) {
  const { hingeLeft, tiltDeg, tiltRad } = pose;
  const signedDeg = hingeLeft ? tiltDeg : -tiltDeg;
  el.style.transformOrigin = hingeLeft ? "0% 50%" : "100% 50%";
  el.style.transform = `rotateY(${signedDeg}deg) scaleX(${Math.cos(tiltRad)})`;
}
