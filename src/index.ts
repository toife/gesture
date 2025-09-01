export const gesture = (element: HTMLElement, handlers: any = {}, options: any = {}) => {
  let startX: number, startY: number, startTime: number;
  let isPointerDown = false;
  let initialDirection: "left" | "right" | "up" | "down" | undefined;

  const minMove = handlers?.options?.minMove || 5; // px
  const minDist = handlers?.options?.minDist || 60; // px
  const maxDuration = handlers?.options?.maxDuration || 280; // ms
  const minVelocity = handlers?.options?.minVelocity || 0.5; // px/ms

  // ==== HANDLERS ==== //
  const start = (x: number, y: number, event: Event) => {
    if (handlers?.beforeEvent && !handlers.beforeEvent(event)) return;
    startX = x;
    startY = y;
    startTime = performance.now();
    isPointerDown = true;
    initialDirection = undefined; // reset hướng ban đầu
    if (handlers.down) handlers.down({ startX, startY, startTime, event });
    handlers?.afterEvent && handlers.afterEvent(event);
  };

  const move = (x: number, y: number, event: Event) => {
    if (!isPointerDown) return;
    if (handlers?.beforeEvent && !handlers.beforeEvent(event)) return;

    const deltaX = x - startX;
    const deltaY = y - startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    let direction: "left" | "right" | "up" | "down" | undefined;
    if (absX >= minMove || absY >= minMove) {
      if (absX > absY) direction = deltaX > 0 ? "right" : "left";
      else direction = deltaY > 0 ? "down" : "up";

      // Ghi lại hướng đầu tiên
      if (!initialDirection) {
        initialDirection = direction;
      }
    }

    if (handlers.move) {
      handlers.move({
        direction,
        initialDirection,
        currentX: x,
        currentY: y,
        event,
        startX,
        startY,
        deltaX,
        deltaY,
      });
    }
    handlers?.afterEvent && handlers.afterEvent(event);
  };

  const end = (x: number, y: number, event: Event) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    if (handlers?.beforeEvent && !handlers.beforeEvent(event)) return;

    const endX = x;
    const endY = y;
    const endTime = performance.now();

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const deltaTime = endTime - startTime;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // fast swipe
    if (handlers.fast && deltaTime <= maxDuration && (absX >= minDist || absY >= minDist)) {
      const velocityX = absX / deltaTime;
      const velocityY = absY / deltaTime;

      if (velocityX >= minVelocity || velocityY >= minVelocity) {
        let direction: "left" | "right" | "up" | "down";
        if (absX > absY) direction = deltaX > 0 ? "right" : "left";
        else direction = deltaY > 0 ? "down" : "up";

        if (!initialDirection) initialDirection = direction;

        handlers.fast({ event, direction, initialDirection, deltaX, deltaY, deltaTime, velocityX, velocityY });
        handlers?.afterEvent && handlers.afterEvent(event);
        return;
      }
    }

    // normal up
    let direction: "left" | "right" | "up" | "down" | undefined;
    if (absX >= minMove || absY >= minMove) {
      if (absX > absY) direction = deltaX > 0 ? "right" : "left";
      else direction = deltaY > 0 ? "down" : "up";
    }

    if (!initialDirection && direction) {
      initialDirection = direction;
    }

    if (handlers.up) {
      handlers.up({
        direction,
        initialDirection,
        event,
        endX,
        endY,
        startX,
        startY,
        deltaX,
        deltaY,
      });
    }
    handlers?.afterEvent && handlers.afterEvent(event);
  };

  const cancel = (event?: Event) => {
    isPointerDown = false;
    if (handlers.cancel) handlers.cancel(event);
    handlers?.afterEvent && handlers.afterEvent(event);
  };

  // ==== BIND EVENTS ==== //
  const onTouchStart = (event: TouchEvent) => {
    const t = event.touches[0];
    start(t.clientX, t.clientY, event);
  };
  const onTouchMove = (event: TouchEvent) => {
    const t = event.touches[0];
    move(t.clientX, t.clientY, event);
  };
  const onTouchEnd = (event: TouchEvent) => {
    const t = event.changedTouches[0];
    end(t.clientX, t.clientY, event);
  };

  const onMouseDown = (event: MouseEvent) => start(event.clientX, event.clientY, event);
  const onMouseMove = (event: MouseEvent) => move(event.clientX, event.clientY, event);
  const onMouseUp = (event: MouseEvent) => end(event.clientX, event.clientY, event);

  element.addEventListener("touchstart", onTouchStart, options);
  element.addEventListener("touchmove", onTouchMove, options);
  element.addEventListener("touchend", onTouchEnd, options);

  element.addEventListener("mousedown", onMouseDown, options);
  element.addEventListener("mousemove", onMouseMove, options);
  element.addEventListener("mouseup", onMouseUp, options);

  const destroy = () => {
    element.removeEventListener("touchstart", onTouchStart, options);
    element.removeEventListener("touchmove", onTouchMove, options);
    element.removeEventListener("touchend", onTouchEnd, options);

    element.removeEventListener("mousedown", onMouseDown, options);
    element.removeEventListener("mousemove", onMouseMove, options);
    element.removeEventListener("mouseup", onMouseUp, options);
  };

  return { destroy, cancel };
};
