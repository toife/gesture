const O = (n, t = {}, r = {}) => {
  let s, c, g;
  const p = t?.options?.minMove || 5, P = t?.options?.minDist || 60, I = t?.options?.maxDuration || 280, X = t?.options?.minVelocity || 0.5, m = (e) => {
    n?.setPointerCapture && n.setPointerCapture(e.pointerId), !(t?.beforeEvent && !t.beforeEvent("down", e)) && (s = e.clientX, c = e.clientY, g = performance.now(), t.down && t.down({ sx: s, sy: c, st: g, e }), t?.afterEvent && t.afterEvent("down", e));
  }, a = (e) => {
    if (t?.beforeEvent && !t.beforeEvent("move", e)) return;
    const v = e.clientX - s, f = e.clientY - c, d = Math.abs(v), i = Math.abs(f);
    let o;
    (d >= p || i >= p) && (d > i ? o = v > 0 ? "right" : "left" : o = f > 0 ? "down" : "up"), t.move && t.move({
      d: o,
      ex: e.clientX,
      ey: e.clientY,
      e,
      sx: s,
      sy: c,
      dx: v,
      dy: f
    }), t?.afterEvent && t.afterEvent("move", e);
  }, L = (e) => {
    if (e.target.releasePointerCapture(e.pointerId), t?.beforeEvent && !t.beforeEvent("up", e)) return;
    const v = e.clientX, f = e.clientY, d = performance.now(), i = v - s, o = f - c, y = d - g, E = Math.abs(i), u = Math.abs(o);
    if (t.fast && y <= I && (E >= P || u >= P)) {
      const l = E / y, D = u / y;
      if (l >= X || D >= X) {
        let C;
        E > u ? C = i > 0 ? "right" : "left" : C = o > 0 ? "down" : "up", t.fast({
          e,
          d: C,
          dx: i,
          dy: o,
          dt: y,
          vx: l,
          vy: D
        }), t?.afterEvent && t.afterEvent("up", e);
        return;
      }
    }
    let M;
    (E >= p || u >= p) && (E > u ? M = i > 0 ? "right" : "left" : M = o > 0 ? "down" : "up"), t.up && t.up({
      d: M,
      e,
      ex: v,
      ey: f,
      sx: s,
      sy: c,
      dx: i,
      dy: o
    }), t?.afterEvent && t.afterEvent("up", e);
  }, w = (e) => {
    n?.releasePointerCapture && n.releasePointerCapture(e.pointerId), !(t?.beforeEvent && !t.beforeEvent("cancel", e)) && (t.cancel && t.cancel(), t?.afterEvent && t.afterEvent("cancel", e));
  }, Y = /iP(ad|hone|od)/.test(navigator.userAgent);
  return Y ? (n.addEventListener("touchstart", m, r), n.addEventListener("touchmove", a, r), n.addEventListener("touchend", L, r), n.addEventListener("touchcancel", w, r)) : (n.addEventListener("pointerdown", m, r), n.addEventListener("pointermove", a, r), n.addEventListener("pointerup", L, r), n.addEventListener("pointercancel", w, r)), { destroy: () => {
    Y ? (n.removeEventListener("touchstart", m), n.removeEventListener("touchmove", a), n.removeEventListener("touchend", L), n.removeEventListener("touchcancel", w)) : (n.removeEventListener("pointerdown", m), n.removeEventListener("pointermove", a), n.removeEventListener("pointerup", L), n.removeEventListener("pointercancel", w));
  }, cancel: () => {
    t.cancel && t.cancel();
  } };
};
export {
  O as gesture
};
