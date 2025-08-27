const k = (n, t = {}, u = {}) => {
  let s, c, y;
  const m = t?.options?.minMove || 5, M = t?.options?.minDist || 60, V = t?.options?.maxDuration || 280, P = t?.options?.minVelocity || 0.5, r = {
    down: t?.options?.down || "pointerdown",
    move: t?.options?.move || "pointermove",
    up: t?.options?.up || "pointerup",
    cancel: t?.options?.cancel || "pointercancel"
  }, X = (e) => {
    n?.setPointerCapture && n.setPointerCapture(e.pointerId), !(t?.beforeEvent && !t.beforeEvent(e)) && (s = e.clientX, c = e.clientY, y = performance.now(), t.down && t.down({ sx: s, sy: c, st: y, e }), t?.afterEvent && t.afterEvent(e));
  }, Y = (e) => {
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
  }, D = (e) => {
    if (n?.releasePointerCapture && n.releasePointerCapture(e.pointerId), t?.beforeEvent && !t.beforeEvent(e)) return;
    const f = e.clientX, v = e.clientY, a = performance.now(), i = f - s, o = v - c, w = a - y, p = Math.abs(i), E = Math.abs(o);
    if (t.fast && w <= V && (p >= M || E >= M)) {
      const b = p / w, I = E / w;
      if (b >= P || I >= P) {
        let C;
        p > E ? C = i > 0 ? "right" : "left" : C = o > 0 ? "down" : "up", t.fast({
          e,
          d: C,
          dx: i,
          dy: o,
          dt: w,
          vx: b,
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
  }, g = (e) => {
    n?.releasePointerCapture && n.releasePointerCapture(e.pointerId), !(t?.beforeEvent && !t.beforeEvent(e)) && (t.cancel && t.cancel(), t?.afterEvent && t.afterEvent(e));
  };
  return n.addEventListener(r.down, X, u), n.addEventListener(r.move, Y, u), n.addEventListener(r.up, D, u), n.addEventListener(r.cancel, g, u), { destroy: () => {
    n.removeEventListener(r.down, X), n.removeEventListener(r.move, Y), n.removeEventListener(r.up, D), n.removeEventListener(r.cancel, g);
  }, cancel: () => {
    t.cancel && t.cancel();
  } };
};
export {
  k as gesture
};
