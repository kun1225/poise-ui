/** Shared depth-of-field settings for both renderers. */
export interface BlurConfig {
  strength: number;
  fullAngle: number;
  anglePower: number;
  fullDistance: number;
  distancePower: number;
  edgeBlur: number;
  gradientOpacity: number;
  gradientStart: number;
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
