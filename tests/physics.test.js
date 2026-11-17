import test from "node:test";
import assert from "node:assert/strict";
import { defaults, initialState, step, advice } from "../src/physics.js";
function fly(overrides = {}) {
  const s = initialState();
  s.status = "flying";
  for (let i = 0; i < 15000 && s.status === "flying"; i++)
    step(s, { ...defaults, ...overrides });
  return s;
}
test("balanced autopilot lands softly and inside the pad", () => {
  const s = fly();
  assert.equal(s.status, "landed");
  assert.ok(s.impact.speed < 3);
  assert.ok(s.impact.offset < 6);
  assert.ok(s.history.length > 10);
});
test("insufficient braking produces a hard touchdown with feedback", () => {
  const s = fly({ brake: 0.05 });
  assert.equal(s.status, "crashed");
  assert.ok(s.impact.speed > 3);
  assert.match(advice(s), /bromsrespons/);
});
test("without drift correction the vehicle misses the pad", () => {
  const s = fly({ drift: 0 });
  assert.equal(s.status, "crashed");
  assert.ok(s.impact.offset > 6);
});
test("reset is deterministic and finished runs stop integrating", () => {
  const a = fly(),
    b = fly();
  assert.deepEqual(a, b);
  const before = structuredClone(a);
  step(a, defaults);
  assert.deepEqual(a, before);
  assert.equal(initialState().time, 0);
});
test("all controls at extremes stay finite and conclude", () => {
  for (const p of [
    { brake: 0, stability: 0, drift: 0, wind: 0.6 },
    { brake: 2, stability: 2, drift: 2, wind: 0.6 },
  ]) {
    const s = fly(p);
    assert.notEqual(s.status, "flying");
    for (const k of ["x", "y", "vy", "angle", "fuel"])
      assert.ok(Number.isFinite(s[k]), k);
  }
});
