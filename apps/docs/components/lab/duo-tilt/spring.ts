/** Analytic damped-spring solver based on Apple's Lotus engine. */

export interface SpringConfig {
  stiffness: number;
  damping: number;
}

export interface SpringState {
  value: number;
  velocity: number;
  moving: boolean;
}

const REST_THRESHOLD = 0.001;

export function springAt(value: number, velocity = 0): SpringState {
  return { value, velocity, moving: false };
}

export function springStep(
  state: SpringState,
  target: number,
  dt: number,
  { stiffness, damping }: SpringConfig,
): SpringState {
  const omega = Math.sqrt(stiffness);
  const x0 = state.value - target;
  const v0 = state.velocity;

  let x: number;
  let v: number;

  if (damping > 1) {
    const spread = omega * Math.sqrt(damping * damping - 1);
    const fast = -damping * omega - spread;
    const slow = -damping * omega + spread;
    const b = (fast * x0 - v0) / (fast - slow);
    const a = x0 - b;
    const eFast = Math.exp(fast * dt);
    const eSlow = Math.exp(slow * dt);
    x = a * eFast + b * eSlow;
    v = a * fast * eFast + b * slow * eSlow;
  } else if (damping === 1) {
    const c = v0 + omega * x0;
    const decay = Math.exp(-omega * dt);
    x = (x0 + c * dt) * decay;
    v = -omega * x + c * decay;
  } else {
    const damped = omega * Math.sqrt(1 - damping * damping);
    const c = (damping * omega * x0 + v0) / damped;
    const decay = Math.exp(-damping * omega * dt);
    x = decay * (x0 * Math.cos(damped * dt) + c * Math.sin(damped * dt));
    v =
      -damping * omega * x +
      decay * damped * (c * Math.cos(damped * dt) - x0 * Math.sin(damped * dt));
  }

  if (Math.abs(x) < REST_THRESHOLD && Math.abs(v) < REST_THRESHOLD) {
    return { value: target, velocity: 0, moving: false };
  }
  return { value: x + target, velocity: v, moving: true };
}
