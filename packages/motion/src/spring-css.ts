import { createGeneratorEasing, generateLinearEasing, spring } from "motion";

import type { Spring } from "./springs";

/**
 * A spring expressed as the two things a CSS transition needs, so a component
 * can spring without handing its animation over to JS.
 *
 * `duration` is the settling time, not the felt speed - the value first reaches
 * its target at the spring's `visualDuration` and spends the rest of it ringing
 * down. Anything timed against the move should stay keyed to `visualDuration`.
 */
export type SpringCss = {
  /** A `linear()` curve sampled off the spring. Overshoots past 1. */
  readonly easing: string;
  /** How long the whole spring takes to settle, in `ms`. */
  readonly duration: string;
};

/**
 * Samples a spring into a `linear()` easing curve.
 *
 * A CSS transition cannot describe a spring, but it can replay one: `linear()`
 * takes a list of progress stops, and stops above 1 are the overshoot. The
 * result is a real spring on properties Motion cannot drive from JS without
 * taking the element over - `grid-template-rows`, or anything whose transition
 * another library is watching for.
 *
 * Sampling is not free, so call this at module scope rather than per render.
 */
export function springToCss(config: Spring): SpringCss {
  const { ease, duration } = createGeneratorEasing(config, 100, spring);

  return {
    easing: generateLinearEasing(ease, duration * 1000),
    duration: `${Math.round(duration * 1000)}ms`,
  };
}
