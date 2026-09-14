/**
 * Depth-of-field tuning, ported from solotilt.com's shader uniforms
 * (`u_blurAngle`, `u_blurSpread`, `u_blackGradient`). Both renderers read the
 * same defaults so the controls panel can tune them in one place.
 */
export interface BlurConfig {
  /** Base blur strength, roughly px of blur per unit of panel width. */
  strength: number;
  /** Tilt angle (deg) at which the angle-driven blur factor maxes out. */
  fullAngle: number;
  /** Response curve exponent for the angle-driven factor. */
  anglePower: number;
  /** Fraction of panel width from the hinge where the distance factor maxes out. */
  fullDistance: number;
  /** Response curve exponent for the distance-driven factor. */
  distancePower: number;
  /** Blur multiplier right at the hinge, before the distance factor kicks in. */
  edgeBlur: number;
  /** Max opacity of the black fade near the far edge. */
  gradientOpacity: number;
  /** Distance from hinge (0-1) where the black fade starts. */
  gradientStart: number;
  /** Distance from hinge (0-1) where the black fade reaches full opacity. */
  gradientEnd: number;
}

export const DEFAULT_BLUR_CONFIG: BlurConfig = Object.freeze({
  strength: 0.0315,
  fullAngle: 90,
  anglePower: 0.5,
  fullDistance: 0.7,
  distancePower: 1.45,
  edgeBlur: 0.18,
  gradientOpacity: 0.7,
  gradientStart: 0.26,
  gradientEnd: 1,
});
