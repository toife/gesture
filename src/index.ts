export const gesture = (box: HTMLElement, handle: any = {}, params: any = {}) => {
  let sx: number, sy: number, st: number;
  let isDown = false;

  const minMove = handle?.options?.minMove || 5; // px
  const minDist = handle?.options?.minDist || 60; // px
  const maxDuration = handle?.options?.maxDuration || 280; // ms
  const minVelocity = handle?.options?.minVelocity || 0.5; // px/ms

  // ==== HANDLERS ==== //
  const start = (x: number, y: number, e: Event) => {
    if (handle?.beforeEvent && !handle.beforeEvent(e)) return;
    sx = x;
    sy = y;
    st = performance.now();
    isDown = true;
    if (handle.down) handle.down({ sx, sy, st, e });
    handle?.afterEvent && handle.afterEvent(e);
  };

  const move = (x: number, y: number, e: Event) => {
    if (!isDown) return;
    if (handle?.beforeEvent && !handle.beforeEvent(e)) return;

    const dx = x - sx;
    const dy = y - sy;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    let d: "left" | "right" | "up" | "down" | undefined;
    if (absX >= minMove || absY >= minMove) {
      if (absX > absY) d = dx > 0 ? "right" : "left";
      else d = dy > 0 ? "down" : "up";
    }

    if (handle.move) {
      handle.move({ d, ex: x, ey: y, e, sx, sy, dx, dy });
    }
    handle?.afterEvent && handle.afterEvent(e);
  };

  const end = (x: number, y: number, e: Event) => {
    if (!isDown) return;
    isDown = false;
    if (handle?.beforeEvent && !handle.beforeEvent(e)) return;

    const ex = x;
    const ey = y;
    const et = performance.now();

    const dx = ex - sx;
    const dy = ey - sy;
    const dt = et - st;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // fast swipe
    if (handle.fast && dt <= maxDuration && (absX >= minDist || absY >= minDist)) {
      const vx = absX / dt;
      const vy = absY / dt;

      if (vx >= minVelocity || vy >= minVelocity) {
        let d: "left" | "right" | "up" | "down";
        if (absX > absY) d = dx > 0 ? "right" : "left";
        else d = dy > 0 ? "down" : "up";

        handle.fast({ e, d, dx, dy, dt, vx, vy });
        handle?.afterEvent && handle.afterEvent(e);
        return;
      }
    }

    // normal up
    let d: "left" | "right" | "up" | "down" | undefined;
    if (absX >= minMove || absY >= minMove) {
      if (absX > absY) d = dx > 0 ? "right" : "left";
      else d = dy > 0 ? "down" : "up";
    }

    if (handle.up) {
      handle.up({ d, e, ex, ey, sx, sy, dx, dy });
    }
    handle?.afterEvent && handle.afterEvent(e);
  };

  const cancel = (e?: Event) => {
    isDown = false;
    if (handle.cancel) handle.cancel(e);
    handle?.afterEvent && handle.afterEvent(e);
  };

  // ==== BIND EVENTS ==== //
  // Touch (mobile)
  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    start(t.clientX, t.clientY, e);
  };
  const onTouchMove = (e: TouchEvent) => {
    const t = e.touches[0];
    move(t.clientX, t.clientY, e);
  };
  const onTouchEnd = (e: TouchEvent) => {
    const t = e.changedTouches[0];
    end(t.clientX, t.clientY, e);
  };

  // Mouse (desktop)
  const onMouseDown = (e: MouseEvent) => start(e.clientX, e.clientY, e);
  const onMouseMove = (e: MouseEvent) => move(e.clientX, e.clientY, e);
  const onMouseUp = (e: MouseEvent) => end(e.clientX, e.clientY, e);

  box.addEventListener("touchstart", onTouchStart, params);
  box.addEventListener("touchmove", onTouchMove, params);
  box.addEventListener("touchend", onTouchEnd, params);

  box.addEventListener("mousedown", onMouseDown, params);
  box.addEventListener("mousemove", onMouseMove, params);
  box.addEventListener("mouseup", onMouseUp, params);

  // ==== API để cleanup ==== //
  const destroy = () => {
    box.removeEventListener("touchstart", onTouchStart, params);
    box.removeEventListener("touchmove", onTouchMove, params);
    box.removeEventListener("touchend", onTouchEnd, params);

    box.removeEventListener("mousedown", onMouseDown, params);
    box.removeEventListener("mousemove", onMouseMove, params);
    box.removeEventListener("mouseup", onMouseUp, params);
  };

  return { destroy, cancel };
};
