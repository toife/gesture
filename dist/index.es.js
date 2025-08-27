const k = (n, t = {}, i = {}) => {
  let c, f, L;
  const m = t?.options?.minMove || 5, a = t?.options?.minDist || 60, V = t?.options?.maxDuration || 280, P = t?.options?.minVelocity || 0.5, r = {
    down: t?.options?.down || "pointerdown",
    move: t?.options?.move || "pointermove",
    up: t?.options?.up || "pointerup",
    cancel: t?.options?.cancel || "pointercancel"
  }, X = (e) => {
    n?.setPointerCapture && n.setPointerCapture(e.pointerId), !(t?.beforeEvent && !t.beforeEvent(e)) && (c = e.clientX, f = e.clientY, L = performance.now(), t.down && t.down({ sx: c, sy: f, st: L, e }), t?.afterEvent && t.afterEvent(e));
  }, Y = (e) => {
    if (t?.beforeEvent && !t.beforeEvent(e)) return;
    const v = e.clientX - c, p = e.clientY - f, w = Math.abs(v), s = Math.abs(p);
    let o;
    (w >= m || s >= m) && (w > s ? o = v > 0 ? "right" : "left" : o = p > 0 ? "down" : "up"), t.move && t.move({
      d: o,
      ex: e.clientX,
      ey: e.clientY,
      e,
      sx: c,
      sy: f,
      dx: v,
      dy: p
    }), t?.afterEvent && t.afterEvent(e);
  }, D = (e) => {
    if (n?.releasePointerCapture && n.releasePointerCapture(e.pointerId), t?.beforeEvent && !t.beforeEvent(e)) return;
    const v = e.clientX, p = e.clientY, w = performance.now(), s = v - c, o = p - f, y = w - L, E = Math.abs(s), u = Math.abs(o);
    if (t.fast && y <= V && (E >= a || u >= a)) {
      const b = E / y, I = u / y;
      if (b >= P || I >= P) {
        let M;
        E > u ? M = s > 0 ? "right" : "left" : M = o > 0 ? "down" : "up", t.fast({
          e,
          d: M,
          dx: s,
          dy: o,
          dt: y,
          vx: b,
          vy: I
        }), t?.afterEvent && t.afterEvent(e);
        return;
      }
    }
    let C;
    (E >= m || u >= m) && (E > u ? C = s > 0 ? "right" : "left" : C = o > 0 ? "down" : "up"), t.up && t.up({
      d: C,
      e,
      ex: v,
      ey: p,
      sx: c,
      sy: f,
      dx: s,
      dy: o
    }), t?.afterEvent && t.afterEvent(e);
  }, g = (e) => {
    n?.releasePointerCapture && n.releasePointerCapture(e.pointerId), !(t?.beforeEvent && !t.beforeEvent(e)) && (t.cancel && t.cancel(), t?.afterEvent && t.afterEvent(e));
  };
  return n.addEventListener(r.down, X, i), n.addEventListener(r.move, Y, i), n.addEventListener(r.up, D, i), n.addEventListener(r.cancel, g, i), { destroy: () => {
    n.removeEventListener(r.down, X, i), n.removeEventListener(r.move, Y, i), n.removeEventListener(r.up, D, i), n.removeEventListener(r.cancel, g, i);
  }, cancel: () => {
    t.cancel && t.cancel();
  } };
};
export {
  k as gesture
};
