export const gesture = (box: any, handle: any = {}, params:any = {}) => {
  let sx: number, sy: number, st: number;
  // let isDragging = false;

  const minMove = handle?.options?.minMove || 5; // px
  const minDist = handle?.options?.minDist || 60; // px
  const maxDuration = handle?.options?.maxDuration || 280; // ms
  const minVelocity = handle?.options?.minVelocity || 0.5; // px/ms
  const name = {
    down: handle?.options?.down || 'pointerdown',
    move: handle?.options?.move || 'pointermove',
    up: handle?.options?.up || 'pointerup',
    cancel: handle?.options?.cancel || 'pointercancel',
  }

  // ==== HANDLERS ==== //
  const onDown:any = (e: PointerEvent) => {
    if (box?.setPointerCapture) box.setPointerCapture(e.pointerId);
    if (handle?.beforeEvent && !handle.beforeEvent(e)) return;
    sx = e.clientX;
    sy = e.clientY;
    st = performance.now();
    if (handle.down) handle.down({ sx, sy, st, e });
    handle?.afterEvent && handle.afterEvent(e);
  };

  const onMove:any = (e: PointerEvent) => {
    if (handle?.beforeEvent && !handle.beforeEvent(e)) return;
    
    const dx = e.clientX - sx;
    const dy = e.clientY - sy;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    // normal up
    let d: "left" | "right" | "up" | "down" | undefined;
    if (absX >= minMove || absY >= minMove) {
      if (absX > absY) {
        d = dx > 0 ? "right" : "left";
      } else {
        d = dy > 0 ? "down" : "up";
      }
    }

    if (handle.move) {
      handle.move({
        d,
        ex: e.clientX,
        ey: e.clientY,
        e,
        sx,
        sy,
        dx,
        dy,
      });
    }

    handle?.afterEvent && handle.afterEvent(e);
  };

  const onUp:any = (e: PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    if (handle?.beforeEvent && !handle.beforeEvent(e)) return;

    const ex = e.clientX;
    const ey = e.clientY;
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
        if (absX > absY) {
          d = dx > 0 ? "right" : "left";
        } else {
          d = dy > 0 ? "down" : "up";
        }
        handle.fast({
          e,
          d,
          dx,
          dy,
          dt,
          vx,
          vy,
        });
        handle?.afterEvent && handle.afterEvent(e);
        return;
      }
    }

    // normal up
    let d: "left" | "right" | "up" | "down" | undefined;
    if (absX >= minMove || absY >= minMove) {
      if (absX > absY) {
        d = dx > 0 ? "right" : "left";
      } else {
        d = dy > 0 ? "down" : "up";
      }
    }

    if (handle.up) {
      handle.up({
        d,
        e,
        ex,
        ey,
        sx,
        sy,
        dx,
        dy,
      });
    }

    handle?.afterEvent && handle.afterEvent(e);
  };

  const onCancel:any = (e: PointerEvent) => {
    if (box?.releasePointerCapture) box.releasePointerCapture(e.pointerId);
    if (handle?.beforeEvent && !handle.beforeEvent(e)) return;
    if (handle.cancel) handle.cancel();
    handle?.afterEvent && handle.afterEvent(e);
  };

  // ==== BIND EVENTS ==== //
  box.addEventListener(name.down, onDown, params);
  box.addEventListener(name.move, onMove, params);
  box.addEventListener(name.up, onUp, params);
  box.addEventListener(name.cancel, onCancel, params);

  // ==== API để cleanup ==== //
  const destroy = () => {
    box.removeEventListener(name.down, onDown);
    box.removeEventListener(name.move, onMove);
    box.removeEventListener(name.up, onUp);
    box.removeEventListener(name.cancel, onCancel);
  };

  const cancel = () => {
    // isDragging = false;
    if (handle.cancel) handle.cancel();
  }

  return {destroy, cancel};
};
