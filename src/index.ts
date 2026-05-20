import { GestureTracker } from "./gesture-tracker";
import { resolveListenOptions } from "./listen-options";
import type { GestureHandlers, GestureListenOptions } from "./types";

export type {
  Direction,
  GestureDownPayload,
  GestureFastPayload,
  GestureHandlerOptions,
  GestureHandlers,
  GestureListenOptions,
  GestureMovePayload,
  GesturePhase,
  GestureUpPayload,
} from "./types";

export const gesture = (
  element: HTMLElement,
  handlers: GestureHandlers = {},
  options: GestureListenOptions = {}
) => {
  const tracker = new GestureTracker(element, handlers, resolveListenOptions(options));
  tracker.bind();

  return {
    destroy: () => tracker.destroy(),
    cancel: (event?: Event) => tracker.cancel(event),
  };
};
