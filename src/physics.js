export const defaults = { brake: 1, stability: 1, drift: 1, wind: 0 };
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export function initialState() {
  return {
    x: 35,
    y: 120,
    vx: -2,
    vy: -12,
    angle: 0.15,
    omega: 0,
    fuel: 100,
    throttle: 0,
    time: 0,
    status: "ready",
    history: [],
    impact: null,
  };
}
export function step(s, p, dt = 1 / 120) {
  if (s.status !== "flying") return s;
  const targetV = -Math.max(0.8, Math.min(20, s.y * 0.4));
  const up = 9.81 + (targetV - s.vy) * 1.6 * p.brake;
  const ax = clamp((-s.x * 0.18 - s.vx * 0.8) * p.drift, -6, 6);
  const targetAngle = -Math.asin(clamp(ax / Math.max(8, up), -0.5, 0.5));
  s.omega +=
    ((targetAngle - s.angle) * 8 * p.stability -
      s.omega * 4 * Math.sqrt(p.stability)) *
    dt;
  s.angle += s.omega * dt;
  s.throttle =
    s.fuel > 0 ? clamp(up / (24 * Math.max(0.5, Math.cos(s.angle))), 0, 1) : 0;
  s.vx += (-Math.sin(s.angle) * s.throttle * 24 + p.wind) * dt;
  s.vy += (Math.cos(s.angle) * s.throttle * 24 - 9.81) * dt;
  s.x += s.vx * dt;
  s.y += s.vy * dt;
  s.fuel = Math.max(0, s.fuel - s.throttle * 1.4 * dt);
  s.time += dt;
  if (Math.floor(s.time * 5) > s.history.length)
    s.history.push({ time: s.time, y: s.y, vy: s.vy, x: s.x, angle: s.angle });
  if (s.y <= 0) {
    s.y = 0;
    s.impact = {
      speed: Math.abs(s.vy),
      drift: Math.abs(s.vx),
      angle: Math.abs((s.angle * 180) / Math.PI),
      offset: Math.abs(s.x),
    };
    s.status =
      s.impact.speed <= 3 &&
      s.impact.drift <= 2 &&
      s.impact.angle <= 8 &&
      s.impact.offset <= 6
        ? "landed"
        : "crashed";
  } else if (s.time > 100 || Math.abs(s.x) > 300 || s.y > 400)
    s.status = "aborted";
  return s;
}
export function advice(s) {
  if (s.status === "landed")
    return "Mjuk landning! Prova sidvind eller sänk ett reglage för att hitta autopilotens gränser.";
  if (!s.impact)
    return "Målet: under 3 m/s nedåt, under 2 m/s sidledes, högst 8° lutning och inom 6 m från mitten.";
  const a = s.impact;
  return [
    a.speed > 3 && "Hård träff: öka bromsresponsen.",
    a.offset > 6 &&
      "Utanför plattan: justera driftkorrigeringen eller kompensera för vinden.",
    a.angle > 8 && "För stor lutning: öka stabiliseringen.",
    a.drift > 2 && "Hög sidofart: öka driftkorrigeringen.",
  ]
    .filter(Boolean)
    .join(" ");
}
