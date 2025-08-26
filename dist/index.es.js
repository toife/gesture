const T = (o, t = {}, E = {}) => {
  let i, s, w;
  const u = t?.options?.minMove || 5, L = t?.options?.minDist || 60, P = t?.options?.maxDuration || 280, g = t?.options?.minVelocity || 0.5, M = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId), !(t?.beforeEvent && !t.beforeEvent(e)) && (i = e.clientX, s = e.clientY, w = performance.now(), t.down && t.down({ sx: i, sy: s, st: w, e }), t?.afterEvent && t.afterEvent(e));
  }, X = (e) => {
    if (t?.beforeEvent && !t.beforeEvent(e)) return;
    const c = e.clientX - i, f = e.clientY - s, m = Math.abs(c), r = Math.abs(f);
    let n;
    (m >= u || r >= u) && (m > r ? n = c > 0 ? "right" : "left" : n = f > 0 ? "down" : "up"), t.move && t.move({
      d: n,
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
    const c = e.clientX, f = e.clientY, m = performance.now(), r = c - i, n = f - s, a = m - w, v = Math.abs(r), p = Math.abs(n);
    if (t.fast && a <= P && (v >= L || p >= L)) {
      const C = v / a, I = p / a;
      if (C >= g || I >= g) {
        let b;
        v > p ? b = r > 0 ? "right" : "left" : b = n > 0 ? "down" : "up", t.fast({
          e,
          d: b,
          dx: r,
          dy: n,
          dt: a,
          vx: C,
          vy: I
        }), t?.afterEvent && t.afterEvent(e);
        return;
      }
    }
    let y;
    (v >= u || p >= u) && (v > p ? y = r > 0 ? "right" : "left" : y = n > 0 ? "down" : "up"), t.up && t.up({
      d: y,
      e,
      ex: c,
      ey: f,
      sx: i,
      sy: s,
      dx: r,
      dy: n
    }), t?.afterEvent && t.afterEvent(e);
  }, D = (e) => {
    e.target.releasePointerCapture(e.pointerId), !(t?.beforeEvent && !t.beforeEvent(e)) && (t.cancel && t.cancel(), t?.afterEvent && t.afterEvent(e));
  };
  return o.addEventListener("pointerdown", M, E), o.addEventListener("pointermove", X, E), o.addEventListener("pointerup", Y, E), o.addEventListener("pointercancel", D, E), { destroy: () => {
    o.removeEventListener("pointerdown", M), o.removeEventListener("pointermove", X), o.removeEventListener("pointerup", Y), o.removeEventListener("pointercancel", D);
  }, cancel: () => {
    t.cancel && t.cancel();
  } };
};
export {
  T as gesture
};
