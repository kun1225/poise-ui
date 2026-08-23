import assert from "node:assert/strict";
import test from "node:test";

import { smoothBands } from "../src/relight-image/relight-image-depth.ts";

test("smoothBands preserves a constant depth field", () => {
  const values = new Float32Array(25).fill(0.4);

  smoothBands({ values, width: 5, height: 5 }, 3);

  for (const value of values) {
    assert.ok(Math.abs(value - 0.4) < 0.000001);
  }
});

test("smoothBands keeps depth samples finite and normalized", () => {
  const values = new Float32Array([0, 0, 0, 0, 1, 0, 0, 0, 0]);

  smoothBands({ values, width: 3, height: 3 }, 2);

  for (const value of values) {
    assert.ok(Number.isFinite(value));
    assert.ok(value >= 0 && value <= 1);
  }
});
