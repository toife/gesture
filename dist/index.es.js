const C = (n, t = {}, i = {}) => {
  let u, v, D, m = !1, r;
  const L = t?.options?.minMove || 5, T = t?.options?.minDist || 60, z = t?.options?.maxDuration || 280, g = t?.options?.minVelocity || 0.5, y = (o, e, c) => {
    t?.beforeEvent && !t.beforeEvent(c) || (u = o, v = e, D = performance.now(), m = !0, r = void 0, t.down && t.down({ startX: u, startY: v, startTime: D, event: c }), t?.afterEvent && t.afterEvent(c));
  }, p = (o, e, c) => {
    if (!m || t?.beforeEvent && !t.beforeEvent(c)) return;
    const E = o - u, a = e - v, w = Math.abs(E), f = Math.abs(a);
    let s;
    (w >= L || f >= L) && (w > f ? s = E > 0 ? "right" : "left" : s = a > 0 ? "down" : "up", r || (r = s)), t.move && t.move({
      direction: s,
      initialDirection: r,
      currentX: o,
      currentY: e,
      event: c,
      startX: u,
      startY: v,
      deltaX: E,
      deltaY: a
    }), t?.afterEvent && t.afterEvent(c);
  }, x = (o, e, c) => {
    if (!m || (m = !1, t?.beforeEvent && !t.beforeEvent(c))) return;
    const E = o, a = e, w = performance.now(), f = E - u, s = a - v, M = w - D, b = Math.abs(f), X = Math.abs(s);
    if (t.fast && M <= z && (b >= T || X >= T)) {
      const l = b / M, q = X / M;
      if (l >= g || q >= g) {
        let d;
        b > X ? d = f > 0 ? "right" : "left" : d = s > 0 ? "down" : "up", r || (r = d), t.fast({ event: c, direction: d, initialDirection: r, deltaX: f, deltaY: s, deltaTime: M, velocityX: l, velocityY: q }), t?.afterEvent && t.afterEvent(c);
        return;
      }
    }
    let Y;
    (b >= L || X >= L) && (b > X ? Y = f > 0 ? "right" : "left" : Y = s > 0 ? "down" : "up"), !r && Y && (r = Y), t.up && t.up({
      direction: Y,
      initialDirection: r,
      event: c,
      endX: E,
      endY: a,
      startX: u,
      startY: v,
      deltaX: f,
      deltaY: s
    }), t?.afterEvent && t.afterEvent(c);
  }, A = (o) => {
    m = !1, t.cancel && t.cancel(o), t?.afterEvent && t.afterEvent(o);
  }, V = (o) => {
    const e = o.touches[0];
    y(e.clientX, e.clientY, o);
  }, P = (o) => {
    const e = o.touches[0];
    p(e.clientX, e.clientY, o);
  }, S = (o) => {
    const e = o.changedTouches[0];
    x(e.clientX, e.clientY, o);
  }, U = (o) => y(o.clientX, o.clientY, o), j = (o) => p(o.clientX, o.clientY, o), k = (o) => x(o.clientX, o.clientY, o);
  return n.addEventListener("touchstart", V, i), n.addEventListener("touchmove", P, i), n.addEventListener("touchend", S, i), n.addEventListener("mousedown", U, i), n.addEventListener("mousemove", j, i), n.addEventListener("mouseup", k, i), { destroy: () => {
    n.removeEventListener("touchstart", V, i), n.removeEventListener("touchmove", P, i), n.removeEventListener("touchend", S, i), n.removeEventListener("mousedown", U, i), n.removeEventListener("mousemove", j, i), n.removeEventListener("mouseup", k, i);
  }, cancel: A };
};
export {
  C as gesture
};
