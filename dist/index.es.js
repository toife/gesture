const j = (n, t = {}, E = {}) => {
  let i, s, w;
  const u = t?.options?.minMove || 5, M = t?.options?.minDist || 60, I = t?.options?.maxDuration || 280, C = t?.options?.minVelocity || 0.5, X = (e) => {
    n?.setPointerCapture && n.setPointerCapture(e.pointerId), !(t?.beforeEvent && !t.beforeEvent(e)) && (i = e.clientX, s = e.clientY, w = performance.now(), t.down && t.down({ sx: i, sy: s, st: w, e }), t?.afterEvent && t.afterEvent(e));
  }, Y = (e) => {
    if (t?.beforeEvent && !t.beforeEvent(e)) return;
    const c = e.clientX - i, f = e.clientY - s, m = Math.abs(c), r = Math.abs(f);
    let o;
    (m >= u || r >= u) && (m > r ? o = c > 0 ? "right" : "left" : o = f > 0 ? "down" : "up"), t.move && t.move({
      d: o,
      ex: e.clientX,
      ey: e.clientY,
      e,
      sx: i,
      sy: s,
      dx: c,
      dy: f
    }), t?.afterEvent && t.afterEvent(e);
  }, b = (e) => {
    if (e.target.releasePointerCapture(e.pointerId), t?.beforeEvent && !t.beforeEvent(e)) return;
    const c = e.clientX, f = e.clientY, m = performance.now(), r = c - i, o = f - s, a = m - w, v = Math.abs(r), p = Math.abs(o);
    if (t.fast && a <= I && (v >= M || p >= M)) {
      const D = v / a, P = p / a;
      if (D >= C || P >= C) {
        let L;
        v > p ? L = r > 0 ? "right" : "left" : L = o > 0 ? "down" : "up", t.fast({
          e,
          d: L,
          dx: r,
          dy: o,
          dt: a,
          vx: D,
          vy: P
        }), t?.afterEvent && t.afterEvent(e);
        return;
      }
    }
    let y;
    (v >= u || p >= u) && (v > p ? y = r > 0 ? "right" : "left" : y = o > 0 ? "down" : "up"), t.up && t.up({
      d: y,
      e,
      ex: c,
      ey: f,
      sx: i,
      sy: s,
      dx: r,
      dy: o
    }), t?.afterEvent && t.afterEvent(e);
  }, g = (e) => {
    n?.releasePointerCapture && n.releasePointerCapture(e.pointerId), !(t?.beforeEvent && !t.beforeEvent(e)) && (t.cancel && t.cancel(), t?.afterEvent && t.afterEvent(e));
  };
  return n.addEventListener("pointerdown", X, E), n.addEventListener("pointermove", Y, E), n.addEventListener("pointerup", b, E), n.addEventListener("pointercancel", g, E), { destroy: () => {
    n.removeEventListener("pointerdown", X), n.removeEventListener("pointermove", Y), n.removeEventListener("pointerup", b), n.removeEventListener("pointercancel", g);
  }, cancel: () => {
    t.cancel && t.cancel();
  } };
};
export {
  j as gesture
};
