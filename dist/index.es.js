const U = (n, t = {}, E = {}) => {
  let i, s, w;
  const u = t?.options?.minMove || 5, L = t?.options?.minDist || 60, P = t?.options?.maxDuration || 280, M = t?.options?.minVelocity || 0.5, g = (e) => {
    n.setPointerCapture(e.pointerId), !(t?.beforeEvent && !t.beforeEvent(e)) && (i = e.clientX, s = e.clientY, w = performance.now(), t.down && t.down({ sx: i, sy: s, st: w, e }), t?.afterEvent && t.afterEvent(e));
  }, X = (e) => {
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
  }, Y = (e) => {
    if (e.target.releasePointerCapture(e.pointerId), t?.beforeEvent && !t.beforeEvent(e)) return;
    const c = e.clientX, f = e.clientY, m = performance.now(), r = c - i, o = f - s, a = m - w, v = Math.abs(r), p = Math.abs(o);
    if (t.fast && a <= P && (v >= L || p >= L)) {
      const C = v / a, I = p / a;
      if (C >= M || I >= M) {
        let b;
        v > p ? b = r > 0 ? "right" : "left" : b = o > 0 ? "down" : "up", t.fast({
          e,
          d: b,
          dx: r,
          dy: o,
          dt: a,
          vx: C,
          vy: I
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
  }, D = (e) => {
    e.target.releasePointerCapture(e.pointerId), !(t?.beforeEvent && !t.beforeEvent(e)) && (t.cancel && t.cancel(), t?.afterEvent && t.afterEvent(e));
  };
  return n.addEventListener("pointerdown", g, E), n.addEventListener("pointermove", X, E), n.addEventListener("pointerup", Y, E), n.addEventListener("pointercancel", D, E), { destroy: () => {
    n.removeEventListener("pointerdown", g), n.removeEventListener("pointermove", X), n.removeEventListener("pointerup", Y), n.removeEventListener("pointercancel", D);
  }, cancel: () => {
    t.cancel && t.cancel();
  } };
};
export {
  U as gesture
};
