const k = (n, t = {}, u = {}) => {
  let s, c, y;
  const m = t?.options?.minMove || 5, C = t?.options?.minDist || 60, V = t?.options?.maxDuration || 280, X = t?.options?.minVelocity || 0.5, r = {
    down: t?.options?.down || "pointerdown",
    move: t?.options?.move || "pointermove",
    up: t?.options?.up || "pointerup",
    cancel: t?.options?.cancel || "pointercancel"
  }, Y = (e) => {
    n?.setPointerCapture && n.setPointerCapture(e.pointerId), !(t?.beforeEvent && !t.beforeEvent(e)) && (s = e.clientX, c = e.clientY, y = performance.now(), t.down && t.down({ sx: s, sy: c, st: y, e }), t?.afterEvent && t.afterEvent(e));
  }, b = (e) => {
    if (t?.beforeEvent && !t.beforeEvent(e)) return;
    const f = e.clientX - s, v = e.clientY - c, a = Math.abs(f), i = Math.abs(v);
    let o;
    (a >= m || i >= m) && (a > i ? o = f > 0 ? "right" : "left" : o = v > 0 ? "down" : "up"), t.move && t.move({
      d: o,
      ex: e.clientX,
      ey: e.clientY,
      e,
      sx: s,
      sy: c,
      dx: f,
      dy: v
    }), t?.afterEvent && t.afterEvent(e);
  }, g = (e) => {
    if (e.target.releasePointerCapture(e.pointerId), t?.beforeEvent && !t.beforeEvent(e)) return;
    const f = e.clientX, v = e.clientY, a = performance.now(), i = f - s, o = v - c, w = a - y, p = Math.abs(i), E = Math.abs(o);
    if (t.fast && w <= V && (p >= C || E >= C)) {
      const P = p / w, I = E / w;
      if (P >= X || I >= X) {
        let M;
        p > E ? M = i > 0 ? "right" : "left" : M = o > 0 ? "down" : "up", t.fast({
          e,
          d: M,
          dx: i,
          dy: o,
          dt: w,
          vx: P,
          vy: I
        }), t?.afterEvent && t.afterEvent(e);
        return;
      }
    }
    let L;
    (p >= m || E >= m) && (p > E ? L = i > 0 ? "right" : "left" : L = o > 0 ? "down" : "up"), t.up && t.up({
      d: L,
      e,
      ex: f,
      ey: v,
      sx: s,
      sy: c,
      dx: i,
      dy: o
    }), t?.afterEvent && t.afterEvent(e);
  }, D = (e) => {
    n?.releasePointerCapture && n.releasePointerCapture(e.pointerId), !(t?.beforeEvent && !t.beforeEvent(e)) && (t.cancel && t.cancel(), t?.afterEvent && t.afterEvent(e));
  };
  return n.addEventListener(r.down, Y, u), n.addEventListener(r.move, b, u), n.addEventListener(r.up, g, u), n.addEventListener(r.cancel, D, u), { destroy: () => {
    n.removeEventListener(r.down, Y), n.removeEventListener(r.move, b), n.removeEventListener(r.up, g), n.removeEventListener(r.cancel, D);
  }, cancel: () => {
    t.cancel && t.cancel();
  } };
};
export {
  k as gesture
};
