type Direction = "left" | "right" | "up" | "down";

const cardinalFromDelta = (dx: number, dy: number): Direction =>
  Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");

const directionBeyondThreshold = (dx: number, dy: number, minMove: number): Direction | undefined => {
  if (Math.abs(dx) < minMove && Math.abs(dy) < minMove) return undefined;
  return cardinalFromDelta(dx, dy);
};

export const gesture = (element: HTMLElement, handlers: any = {}, options: any = {}) => {
  let startX = 0;
  let startY = 0;
  let startTime = 0;
  let lastX = 0;
  let lastY = 0;
  let isPointerDown = false;
  let initialDirection: Direction | undefined;

  const minMove = handlers?.options?.minMove ?? 5;
  const minDist = handlers?.options?.minDist ?? 60;
  const maxDuration = handlers?.options?.maxDuration ?? 280;
  const minVelocity = handlers?.options?.minVelocity ?? 0.5;

  const touchMoveOpts: AddEventListenerOptions = { capture: true, passive: true };
  const capture = true;

  const beforeOk = (event: Event) => !handlers.beforeEvent || handlers.beforeEvent(event);
  const after = (event?: Event) => handlers.afterEvent?.(event);

  const hitTarget = (clientX: number, clientY: number) => {
    const top = document.elementFromPoint(clientX, clientY);
    return !!top && (element === top || element.contains(top));
  };

  const stopTracking = () => {
    isPointerDown = false;
    toggleGlobalListeners(false);
  };

  const start = (x: number, y: number, event: Event) => {
    if (!beforeOk(event)) return;
    startX = x;
    startY = y;
    lastX = x;
    lastY = y;
    startTime = performance.now();
    isPointerDown = true;
    initialDirection = undefined;
    toggleGlobalListeners(true);
    handlers.down?.({ startX, startY, startTime, event });
    after(event);
  };

  const move = (x: number, y: number, event: Event) => {
    if (!isPointerDown) return;
    lastX = x;
    lastY = y;
    if (!beforeOk(event)) return;

    const deltaX = x - startX;
    const deltaY = y - startY;
    const direction = directionBeyondThreshold(deltaX, deltaY, minMove);
    if (direction && !initialDirection) initialDirection = direction;

    handlers.move?.({
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
    after(event);
  };

  const end = (x: number, y: number, event: Event) => {
    if (!isPointerDown) return;
    stopTracking();
    if (!beforeOk(event)) return;

    const endX = x;
    const endY = y;
    const endTime = performance.now();
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const deltaTime = endTime - startTime;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (handlers.fast && deltaTime <= maxDuration && (absX >= minDist || absY >= minDist)) {
      const velocityX = absX / deltaTime;
      const velocityY = absY / deltaTime;
      if (velocityX >= minVelocity || velocityY >= minVelocity) {
        const direction = cardinalFromDelta(deltaX, deltaY);
        if (!initialDirection) initialDirection = direction;
        handlers.fast({
          event,
          direction,
          initialDirection,
          deltaX,
          deltaY,
          deltaTime,
          velocityX,
          velocityY,
        });
        after(event);
        return;
      }
    }

    let direction = directionBeyondThreshold(deltaX, deltaY, minMove);
    if (!initialDirection && direction) initialDirection = direction;

    handlers.up?.({
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
    after(event);
  };

  const cancel = (event?: Event) => {
    stopTracking();
    handlers.cancel?.(event);
    after(event);
  };

  const onMoveAt = (x: number, y: number, event: Event) => {
    if (!isPointerDown) return;
    if (!hitTarget(x, y)) {
      end(x, y, event);
      return;
    }
    move(x, y, event);
  };

  const onDocumentMouseMove: EventListener = (e) => {
    const me = e as MouseEvent;
    onMoveAt(me.clientX, me.clientY, e);
  };

  const onDocumentMouseUp: EventListener = (e) => {
    const me = e as MouseEvent;
    if (isPointerDown) end(me.clientX, me.clientY, e);
  };
  
  const onDocumentMouseOut: EventListener = (e) => {
    const me = e as MouseEvent;
    if (isPointerDown && me.relatedTarget === null) end(lastX, lastY, e);
  };

  const onDocumentTouchMove: EventListener = (e) => {
    const te = e as TouchEvent;
    const t = te.touches[0];
    if (t) onMoveAt(t.clientX, t.clientY, e);
  };

  const endFromChangedTouch: EventListener = (e) => {
    if (!isPointerDown) return;
    const te = e as TouchEvent;
    const t = te.changedTouches[0];
    end(t ? t.clientX : lastX, t ? t.clientY : lastY, e);
  };

  const onWindowBlur = () => {
    if (isPointerDown) end(lastX, lastY, new Event("gesture:window-blur"));
  };

  const setGlobalListeners = (active: boolean) => {
    const m = active ? "addEventListener" : "removeEventListener";
    document[m]("mousemove", onDocumentMouseMove, capture);
    document[m]("mouseup", onDocumentMouseUp, capture);
    document[m]("mouseout", onDocumentMouseOut, capture);
    document[m]("touchmove", onDocumentTouchMove, touchMoveOpts);
    document[m]("touchend", endFromChangedTouch, capture);
    document[m]("touchcancel", endFromChangedTouch, capture);
    window[m]("blur", onWindowBlur);
  };

  const toggleGlobalListeners = (on: boolean) => {
    setGlobalListeners(false);
    if (on) setGlobalListeners(true);
  };

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    start(t.clientX, t.clientY, e);
  };
  const onTouchEnd = (e: TouchEvent) => {
    const t = e.changedTouches[0];
    end(t.clientX, t.clientY, e);
  };
  const onMouseDown = (e: MouseEvent) => start(e.clientX, e.clientY, e);

  element.addEventListener("touchstart", onTouchStart, options);
  element.addEventListener("touchend", onTouchEnd, options);
  element.addEventListener("mousedown", onMouseDown, options);

  const destroy = () => {
    toggleGlobalListeners(false);
    isPointerDown = false;
    element.removeEventListener("touchstart", onTouchStart, options);
    element.removeEventListener("touchend", onTouchEnd, options);
    element.removeEventListener("mousedown", onMouseDown, options);
  };

  return { destroy, cancel };
};
