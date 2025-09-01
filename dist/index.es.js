const G = (s, t = {}, c = {}) => {
  let v, f, Y, m = !1;
  const M = t?.options?.minMove || 5, g = t?.options?.minDist || 60, B = t?.options?.maxDuration || 280, p = t?.options?.minVelocity || 0.5, T = (e, n, o) => {
    t?.beforeEvent && !t.beforeEvent(o) || (v = e, f = n, Y = performance.now(), m = !0, t.down && t.down({ sx: v, sy: f, st: Y, e: o }), t?.afterEvent && t.afterEvent(o));
  }, b = (e, n, o) => {
    if (!m || t?.beforeEvent && !t.beforeEvent(o)) return;
    const u = e - v, E = n - f, y = Math.abs(u), r = Math.abs(E);
    let i;
    (y >= M || r >= M) && (y > r ? i = u > 0 ? "right" : "left" : i = E > 0 ? "down" : "up"), t.move && t.move({ d: i, ex: e, ey: n, e: o, sx: v, sy: f, dx: u, dy: E }), t?.afterEvent && t.afterEvent(o);
  }, l = (e, n, o) => {
    if (!m || (m = !1, t?.beforeEvent && !t.beforeEvent(o))) return;
    const u = e, E = n, y = performance.now(), r = u - v, i = E - f, X = y - Y, L = Math.abs(r), w = Math.abs(i);
    if (t.fast && X <= B && (L >= g || w >= g)) {
      const z = L / X, A = w / X;
      if (z >= p || A >= p) {
        let D;
        L > w ? D = r > 0 ? "right" : "left" : D = i > 0 ? "down" : "up", t.fast({ e: o, d: D, dx: r, dy: i, dt: X, vx: z, vy: A }), t?.afterEvent && t.afterEvent(o);
        return;
      }
    }
    let d;
    (L >= M || w >= M) && (L > w ? d = r > 0 ? "right" : "left" : d = i > 0 ? "down" : "up"), t.up && t.up({ d, e: o, ex: u, ey: E, sx: v, sy: f, dx: r, dy: i }), t?.afterEvent && t.afterEvent(o);
  }, C = (e) => {
    m = !1, t.cancel && t.cancel(e), t?.afterEvent && t.afterEvent(e);
  }, V = (e) => {
    const n = e.touches[0];
    T(n.clientX, n.clientY, e);
  }, S = (e) => {
    const n = e.touches[0];
    b(n.clientX, n.clientY, e);
  }, U = (e) => {
    const n = e.changedTouches[0];
    l(n.clientX, n.clientY, e);
  }, j = (e) => T(e.clientX, e.clientY, e), k = (e) => b(e.clientX, e.clientY, e), q = (e) => l(e.clientX, e.clientY, e);
  return s.addEventListener("touchstart", V, c), s.addEventListener("touchmove", S, c), s.addEventListener("touchend", U, c), s.addEventListener("mousedown", j, c), s.addEventListener("mousemove", k, c), s.addEventListener("mouseup", q, c), { destroy: () => {
    s.removeEventListener("touchstart", V, c), s.removeEventListener("touchmove", S, c), s.removeEventListener("touchend", U, c), s.removeEventListener("mousedown", j, c), s.removeEventListener("mousemove", k, c), s.removeEventListener("mouseup", q, c);
  }, cancel: C };
};
export {
  G as gesture
};
