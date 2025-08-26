const V = (n, e = {}, E = {}) => {
  let p = 0, l = 0, y = 0, a = !1;
  const m = e?.options?.minMove || 5, d = e?.options?.minDist || 60, P = e?.options?.maxDuration || 280, g = e?.options?.minVelocity || 0.5, M = (t) => {
    n.setPointerCapture?.(t.pointerId), !(e?.beforeEvent && !e.beforeEvent(t)) && (p = t.clientX, l = t.clientY, y = performance.now(), a = !1, e.down?.({ sx: p, sy: l, st: y, e: t }), e.afterEvent?.(t));
  }, X = (t) => {
    if (e?.beforeEvent && !e.beforeEvent(t)) return;
    const o = t.clientX - p, r = t.clientY - l, L = Math.abs(o), s = Math.abs(r), i = n.scrollLeft === 0, u = n.scrollLeft + n.clientWidth >= n.scrollWidth, c = n.scrollTop === 0, f = n.scrollTop + n.clientHeight >= n.scrollHeight;
    if (!a) {
      if (o < 0 && !u || o > 0 && !i || r < 0 && !f || r > 0 && !c)
        return;
      a = !0;
    }
    let v;
    (L >= m || s >= m) && (L > s ? v = o > 0 ? "right" : "left" : v = r > 0 ? "down" : "up"), e.move?.({
      d: v,
      ex: t.clientX,
      ey: t.clientY,
      e: t,
      sx: p,
      sy: l,
      dx: o,
      dy: r
    }), e.afterEvent?.(t);
  }, Y = (t) => {
    if (n.releasePointerCapture?.(t.pointerId), e?.beforeEvent && !e.beforeEvent(t)) return;
    const o = t.clientX, r = t.clientY, L = performance.now(), s = o - p, i = r - l, u = L - y, c = Math.abs(s), f = Math.abs(i);
    if (a) {
      if (e.fast && u <= P && (c >= d || f >= d)) {
        const C = c / u, I = f / u;
        if (C >= g || I >= g) {
          let w;
          c > f ? w = s > 0 ? "right" : "left" : w = i > 0 ? "down" : "up", e.fast({ e: t, d: w, dx: s, dy: i, dt: u, vx: C, vy: I }), e.afterEvent?.(t);
          return;
        }
      }
      let v;
      (c >= m || f >= m) && (c > f ? v = s > 0 ? "right" : "left" : v = i > 0 ? "down" : "up"), e.up?.({ d: v, e: t, ex: o, ey: r, sx: p, sy: l, dx: s, dy: i });
    }
    e.afterEvent?.(t);
  }, D = (t) => {
    n.releasePointerCapture?.(t.pointerId), !(e?.beforeEvent && !e.beforeEvent(t)) && (e.cancel?.(), e.afterEvent?.(t));
  };
  return n.addEventListener("pointerdown", M, E), n.addEventListener("pointermove", X, E), n.addEventListener("pointerup", Y, E), n.addEventListener("pointercancel", D, E), { destroy: () => {
    n.removeEventListener("pointerdown", M), n.removeEventListener("pointermove", X), n.removeEventListener("pointerup", Y), n.removeEventListener("pointercancel", D);
  }, cancel: () => {
    e.cancel?.();
  } };
};
export {
  V as gesture
};
