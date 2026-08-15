/**
 * Shared motion vocabulary. Plain data with no imports, so it is valid as both
 * a React `transition` prop and a vanilla Motion `animate()` options object.
 */
export type Spring = {
  readonly type: "spring";
  readonly stiffness: number;
  readonly damping: number;
};

export const springs = {
  /** Buttons, toggles, anything under the pointer. */
  snappy: { type: "spring", stiffness: 500, damping: 35 },
  /** Panels, popovers, layout shifts. */
  smooth: { type: "spring", stiffness: 300, damping: 30 },
  /** Deliberate overshoot. Use sparingly. */
  bouncy: { type: "spring", stiffness: 400, damping: 18 },
} as const satisfies Record<string, Spring>;

export type SpringName = keyof typeof springs;
