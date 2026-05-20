import type { GestureListenOptions, ResolvedListenOptions } from "./types";

const isScopedListenOptions = (
  options: GestureListenOptions
): options is Exclude<GestureListenOptions, AddEventListenerOptions> =>
  typeof options === "object" &&
  options !== null &&
  ("element" in options || "document" in options || "move" in options || "touchmove" in options);

export const resolveListenOptions = (
  options: GestureListenOptions = {}
): ResolvedListenOptions => {
  if (isScopedListenOptions(options)) {
    const document: AddEventListenerOptions = { capture: true, ...options.document };
    const moveSource = options.move ?? options.touchmove;
    return {
      element: options.element ?? {},
      document,
      move: { capture: true, passive: true, ...document, ...moveSource },
    };
  }

  const element = options;
  const capture = element.capture ?? true;
  const passive = element.passive ?? true;

  return {
    element,
    document: { capture },
    move: { capture, passive },
  };
};
