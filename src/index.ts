export const gesture = (box: HTMLElement, handle: any = {}, params: any = {}) => {
  let sx = 0, sy = 0, st = 0;
  let isGesture = false;

  const minMove = handle?.options?.minMove || 5;   // px
  const minDist = handle?.options?.minDist || 60;  // px
  const maxDuration = handle?.options?.maxDuration || 280; // ms
  const minVelocity = handle?.options?.minVelocity || 0.5; // px/ms

  const onDown = (e: PointerEvent) => {
    box.setPointerCapture?.(e.pointerId);
    if (handle?.beforeEvent && !handle.beforeEvent(e)) return;

    sx = e.clientX;
    sy = e.clientY;
    st = performance.now();
    isGesture = false;

    handle.down?.({ sx, sy, st, e });
    handle.afterEvent?.(e);
  };

  const onMove = (e: PointerEvent) => {
    if (handle?.beforeEvent && !handle.beforeEvent(e)) return;

    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    const atLeft = box.scrollLeft === 0;
    const atRight = box.scrollLeft + box.clientWidth >= box.scrollWidth;
    const atTop = box.scrollTop === 0;
    const atBottom = box.scrollTop + box.clientHeight >= box.scrollHeight;

    // Nếu còn scroll được thì để browser lo (mượt tự nhiên)
    if (!isGesture) {
      if ((dx < 0 && !atRight) || (dx > 0 && !atLeft) ||
          (dy < 0 && !atBottom) || (dy > 0 && !atTop)) {
        return;
      }
      // 👉 hết scroll → chuyển sang gesture
      isGesture = true;
    }

    // === Gesture Mode ===
    let d: "left" | "right" | "up" | "down" | undefined;
    if (absX >= minMove || absY >= minMove) {
      if (absX > absY) d = dx > 0 ? "right" : "left";
      else d = dy > 0 ? "down" : "up";
    }

    handle.move?.({
      d, ex: e.clientX, ey: e.clientY, e, sx, sy, dx, dy
    });
    handle.afterEvent?.(e);
  };

  const onUp = (e: PointerEvent) => {
    box.releasePointerCapture?.(e.pointerId);
    if (handle?.beforeEvent && !handle.beforeEvent(e)) return;

    const ex = e.clientX;
    const ey = e.clientY;
    const et = performance.now();

    const dx = ex - sx;
    const dy = ey - sy;
    const dt = et - st;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (isGesture) {
      // fast swipe
      if (handle.fast && dt <= maxDuration && (absX >= minDist || absY >= minDist)) {
        const vx = absX / dt;
        const vy = absY / dt;
        if (vx >= minVelocity || vy >= minVelocity) {
          let d: "left" | "right" | "up" | "down";
          if (absX > absY) d = dx > 0 ? "right" : "left";
          else d = dy > 0 ? "down" : "up";
          handle.fast({ e, d, dx, dy, dt, vx, vy });
          handle.afterEvent?.(e);
          return;
        }
      }

      // normal up
      let d: "left" | "right" | "up" | "down" | undefined;
      if (absX >= minMove || absY >= minMove) {
        if (absX > absY) d = dx > 0 ? "right" : "left";
        else d = dy > 0 ? "down" : "up";
      }
      handle.up?.({ d, e, ex, ey, sx, sy, dx, dy });
    }

    handle.afterEvent?.(e);
  };

  const onCancel = (e: PointerEvent) => {
    box.releasePointerCapture?.(e.pointerId);
    if (handle?.beforeEvent && !handle.beforeEvent(e)) return;
    handle.cancel?.();
    handle.afterEvent?.(e);
  };

  // ==== BIND EVENTS ==== //
  box.addEventListener("pointerdown", onDown, params);
  box.addEventListener("pointermove", onMove, params);
  box.addEventListener("pointerup", onUp, params);
  box.addEventListener("pointercancel", onCancel, params);

  const destroy = () => {
    box.removeEventListener("pointerdown", onDown);
    box.removeEventListener("pointermove", onMove);
    box.removeEventListener("pointerup", onUp);
    box.removeEventListener("pointercancel", onCancel);
  };

  const cancel = () => {
    handle.cancel?.();
  };

  return { destroy, cancel };
};
