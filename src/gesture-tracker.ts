import { SUPPORTS_POINTER } from "./constants";
import { cardinalFromDelta, directionBeyondThreshold, distance } from "./direction";
import { shouldStartGesture } from "./should-start";
import type {
  Direction,
  GestureHandlers,
  GestureHandlerOptions,
  GesturePhase,
  ResolvedListenOptions,
} from "./types";

export class GestureTracker {
  private phase: GesturePhase = "idle";
  private startX = 0;
  private startY = 0;
  private startTime = 0;
  private lastX = 0;
  private lastY = 0;
  private initialDirection: Direction | undefined;
  private activePointerId: number | null = null;
  private trackingListenersOn = false;
  private readonly abort = new AbortController();

  private readonly minMove: number;
  private readonly minDist: number;
  private readonly maxDuration: number;
  private readonly minVelocity: number;
  private readonly trackOutsideElement: boolean;
  private readonly handlerOptions: GestureHandlerOptions;

  constructor(
    private readonly element: HTMLElement,
    private readonly handlers: GestureHandlers,
    private readonly listen: ResolvedListenOptions
  ) {
    const opts = handlers.options ?? {};
    this.handlerOptions = opts;
    this.minMove = opts.minMove ?? 5;
    this.minDist = opts.minDist ?? 60;
    this.maxDuration = opts.maxDuration ?? 280;
    this.minVelocity = opts.minVelocity ?? 0.5;
    this.trackOutsideElement = opts.trackOutsideElement === true;
  }

  bind() {
    const { signal } = this.abort;

    if (SUPPORTS_POINTER) {
      this.element.addEventListener("pointerdown", this.onPointerDown, {
        ...this.listen.element,
        signal,
      });
    } else {
      this.element.addEventListener("touchstart", this.onLegacyTouchStart, {
        ...this.listen.element,
        passive: this.listen.element.passive ?? true,
        signal,
      });
      this.element.addEventListener("mousedown", this.onLegacyMouseDown, {
        ...this.listen.element,
        signal,
      });
    }

    window.addEventListener("blur", this.onWindowBlur, { signal });
  }

  destroy() {
    this.reset("idle");
    this.abort.abort();
  }

  cancel(event?: Event) {
    if (this.phase === "idle") return;
    this.reset("idle");
    this.handlers.cancel?.(event);
    this.after(event);
  }

  // --- Phase & listeners ---

  private setTrackingListeners(on: boolean) {
    if (this.trackingListenersOn === on) return;
    this.trackingListenersOn = on;
    const m = on ? "addEventListener" : "removeEventListener";

    if (SUPPORTS_POINTER) {
      this.element[m]("pointermove", this.onPointerMove, this.listen.move);
      this.element[m]("pointerup", this.onPointerUp, this.listen.element);
      this.element[m]("pointercancel", this.onPointerCancel, this.listen.element);
      return;
    }

    document[m]("mousemove", this.onLegacyMouseMove, this.listen.move);
    document[m]("mouseup", this.onLegacyMouseUp, this.listen.document);
    document[m]("mouseout", this.onLegacyMouseOut, this.listen.document);
    document[m]("touchmove", this.onLegacyTouchMove, this.listen.move);
    document[m]("touchend", this.onLegacyTouchEnd, this.listen.document);
    document[m]("touchcancel", this.onLegacyTouchEnd, this.listen.document);
  }

  private reset(next: GesturePhase) {
    this.releaseCapture();
    this.setTrackingListeners(false);
    this.phase = next;
    this.initialDirection = undefined;
    this.activePointerId = null;
  }

  private releaseCapture() {
    if (
      SUPPORTS_POINTER &&
      this.activePointerId !== null &&
      this.element.hasPointerCapture(this.activePointerId)
    ) {
      this.element.releasePointerCapture(this.activePointerId);
    }
    this.activePointerId = null;
  }

  private capturePointer(event: Event) {
    if (!(event instanceof PointerEvent)) return;
    this.activePointerId = event.pointerId;
    try {
      this.element.setPointerCapture(event.pointerId);
    } catch {
      /* element may not allow capture */
    }
  }

  // --- Guards ---

  private beforeOk(event: Event) {
    return !this.handlers.beforeEvent || this.handlers.beforeEvent(event) !== false;
  }

  private after(event?: Event) {
    this.handlers.afterEvent?.(event);
  }

  private canStart(event: Event) {
    if (this.phase !== "idle") return false;
    if (!shouldStartGesture(this.element, event, this.handlerOptions)) return false;
    if (!this.beforeOk(event)) return false;
    if (event instanceof MouseEvent && event.button !== 0) return false;
    return true;
  }

  private hitTarget(clientX: number, clientY: number) {
    const rect = this.element.getBoundingClientRect();
    return (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    );
  }

  private pointerMatches(event: PointerEvent) {
    return this.activePointerId === null || event.pointerId === this.activePointerId;
  }

  // --- Pending → active ---

  private enterPending(x: number, y: number, event: Event) {
    this.phase = "pending";
    this.startX = x;
    this.startY = y;
    this.lastX = x;
    this.lastY = y;
    this.startTime = performance.now();
    this.initialDirection = undefined;
    this.setTrackingListeners(true);
  }

  private tryActivate(x: number, y: number, event: Event): boolean {
    if (this.phase !== "pending") return this.phase === "active";

    const deltaX = x - this.startX;
    const deltaY = y - this.startY;
    if (distance(deltaX, deltaY) < this.minMove) return false;

    this.phase = "active";
    this.capturePointer(event);

    this.handlers.down?.({
      startX: this.startX,
      startY: this.startY,
      startTime: this.startTime,
      event,
    });
    this.after(event);
    return true;
  }

  private moveActive(x: number, y: number, event: Event) {
    this.lastX = x;
    this.lastY = y;
    if (!this.beforeOk(event)) return;

    if (!this.trackOutsideElement && !this.hitTarget(x, y)) {
      this.finish(x, y, event);
      return;
    }

    const deltaX = x - this.startX;
    const deltaY = y - this.startY;
    const direction = directionBeyondThreshold(deltaX, deltaY, this.minMove);
    if (direction && !this.initialDirection) this.initialDirection = direction;

    this.handlers.move?.({
      direction,
      initialDirection: this.initialDirection,
      currentX: x,
      currentY: y,
      event,
      startX: this.startX,
      startY: this.startY,
      deltaX,
      deltaY,
    });
    this.after(event);
  }

  private finish(x: number, y: number, event: Event) {
    if (this.phase === "idle") return;

    const wasActive = this.phase === "active";
    this.reset("idle");

    if (!wasActive) return;
    if (!this.beforeOk(event)) return;

    const endX = x;
    const endY = y;
    const endTime = performance.now();
    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const deltaTime = endTime - this.startTime;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (
      this.handlers.fast &&
      deltaTime <= this.maxDuration &&
      (absX >= this.minDist || absY >= this.minDist)
    ) {
      const velocityX = absX / deltaTime;
      const velocityY = absY / deltaTime;
      if (velocityX >= this.minVelocity || velocityY >= this.minVelocity) {
        const direction = cardinalFromDelta(deltaX, deltaY);
        if (!this.initialDirection) this.initialDirection = direction;
        this.handlers.fast({
          event,
          direction,
          initialDirection: this.initialDirection,
          deltaX,
          deltaY,
          deltaTime,
          velocityX,
          velocityY,
        });
        this.after(event);
        return;
      }
    }

    const direction = directionBeyondThreshold(deltaX, deltaY, this.minMove);
    if (!this.initialDirection && direction) this.initialDirection = direction;

    this.handlers.up?.({
      direction,
      initialDirection: this.initialDirection,
      event,
      endX,
      endY,
      startX: this.startX,
      startY: this.startY,
      deltaX,
      deltaY,
    });
    this.after(event);
  }

  private onMove(x: number, y: number, event: Event) {
    if (this.phase === "pending") {
      if (this.tryActivate(x, y, event)) this.moveActive(x, y, event);
      return;
    }
    if (this.phase === "active") this.moveActive(x, y, event);
  }

  // --- Pointer Events ---

  private onPointerDown: EventListener = (e) => {
    const pe = e as PointerEvent;
    if (!this.canStart(pe)) return;
    this.enterPending(pe.clientX, pe.clientY, pe);
  };

  private onPointerMove: EventListener = (e) => {
    const pe = e as PointerEvent;
    if (this.phase === "idle" || !this.pointerMatches(pe)) return;
    this.onMove(pe.clientX, pe.clientY, pe);
  };

  private onPointerUp: EventListener = (e) => {
    const pe = e as PointerEvent;
    if (this.phase === "idle" || !this.pointerMatches(pe)) return;
    this.finish(pe.clientX, pe.clientY, pe);
  };

  private onPointerCancel: EventListener = (e) => {
    const pe = e as PointerEvent;
    if (this.phase === "idle" || !this.pointerMatches(pe)) return;
    this.cancel(pe);
  };

  // --- Legacy mouse / touch ---

  private onLegacyMouseDown = (e: MouseEvent) => {
    if (!this.canStart(e)) return;
    this.enterPending(e.clientX, e.clientY, e);
  };

  private onLegacyTouchStart = (e: TouchEvent) => {
    if (!this.canStart(e)) return;
    const t = e.touches[0];
    if (t) this.enterPending(t.clientX, t.clientY, e);
  };

  private onLegacyMouseMove: EventListener = (e) => {
    const me = e as MouseEvent;
    if (this.phase === "idle") return;
    this.onMove(me.clientX, me.clientY, e);
  };

  private onLegacyMouseUp: EventListener = (e) => {
    const me = e as MouseEvent;
    if (this.phase === "idle") return;
    this.finish(me.clientX, me.clientY, e);
  };

  private onLegacyMouseOut: EventListener = (e) => {
    const me = e as MouseEvent;
    if (this.phase !== "idle" && me.relatedTarget === null) {
      this.finish(this.lastX, this.lastY, e);
    }
  };

  private onLegacyTouchMove: EventListener = (e) => {
    const te = e as TouchEvent;
    if (this.phase === "idle") return;
    const t = te.touches[0];
    if (t) this.onMove(t.clientX, t.clientY, e);
  };

  private onLegacyTouchEnd: EventListener = (e) => {
    const te = e as TouchEvent;
    if (this.phase === "idle") return;
    const t = te.changedTouches[0];
    this.finish(t ? t.clientX : this.lastX, t ? t.clientY : this.lastY, e);
  };

  private onWindowBlur = () => {
    if (this.phase !== "idle") this.finish(this.lastX, this.lastY, new Event("gesture:window-blur"));
  };
}
