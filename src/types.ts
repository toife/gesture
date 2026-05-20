/** Cardinal swipe direction resolved from pointer delta. */
export type Direction = "left" | "right" | "up" | "down";

/** Internal pointer session: idle → pending (tap possible) → active (drag). */
export type GesturePhase = "idle" | "pending" | "active";

/** Options passed via `handlers.options` on `gesture(element, handlers)`. */
export type GestureHandlerOptions = {
  minMove?: number;
  minDist?: number;
  maxDuration?: number;
  minVelocity?: number;
  /**
   * When true, keeps tracking after the pointer leaves the element bounds until release.
   */
  trackOutsideElement?: boolean;
  /**
   * CSS selector: only start when the event target is inside this selector (within `element`).
   * Example: `".handle"` — gestures only on the handle, clicks elsewhere pass through.
   */
  handle?: string;
  /**
   * Extra selectors to ignore (merged with the built-in interactive list).
   */
  ignore?: string;
};

/**
 * Third argument to `gesture()`.
 *
 * Shorthand `AddEventListenerOptions` → `element` (start) + `move` while tracking.
 *
 * Scoped:
 * - `element` — pointerdown / touchstart / mousedown
 * - `document` — legacy document listeners while pending/active
 * - `move` — move phase (`pointermove`, `touchmove`, `mousemove`)
 * - `touchmove` — alias of `move`
 */
export type GestureListenOptions =
  | AddEventListenerOptions
  | {
      element?: AddEventListenerOptions;
      document?: AddEventListenerOptions;
      move?: AddEventListenerOptions;
      touchmove?: AddEventListenerOptions;
    };

export type ResolvedListenOptions = {
  element: AddEventListenerOptions;
  document: AddEventListenerOptions;
  move: AddEventListenerOptions;
};

export type GestureHandlers = {
  options?: GestureHandlerOptions;
  beforeEvent?: (event: Event) => boolean | void;
  afterEvent?: (event?: Event) => void;
  down?: (payload: GestureDownPayload) => void;
  move?: (payload: GestureMovePayload) => void;
  up?: (payload: GestureUpPayload) => void;
  fast?: (payload: GestureFastPayload) => void;
  cancel?: (event?: Event) => void;
};

export type GestureDownPayload = {
  startX: number;
  startY: number;
  startTime: number;
  event: Event;
};

export type GestureMovePayload = {
  direction?: Direction;
  initialDirection?: Direction;
  currentX: number;
  currentY: number;
  event: Event;
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
};

export type GestureUpPayload = {
  direction?: Direction;
  initialDirection?: Direction;
  event: Event;
  endX: number;
  endY: number;
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
};

export type GestureFastPayload = {
  event: Event;
  direction: Direction;
  initialDirection?: Direction;
  deltaX: number;
  deltaY: number;
  deltaTime: number;
  velocityX: number;
  velocityY: number;
};
