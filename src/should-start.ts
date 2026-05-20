import { DEFAULT_IGNORE_SELECTOR } from "./constants";
import type { GestureHandlerOptions } from "./types";

/**
 * Whether a pointer session may enter the pending phase.
 * Interactive descendants are skipped so clicks/taps still work.
 */
export const shouldStartGesture = (
  element: HTMLElement,
  event: Event,
  options: Pick<GestureHandlerOptions, "handle" | "ignore"> = {}
): boolean => {
  const target = event.target;
  if (!(target instanceof Element) || !element.contains(target)) return false;

  const ignoreSelector = options.ignore
    ? `${DEFAULT_IGNORE_SELECTOR}, ${options.ignore}`
    : DEFAULT_IGNORE_SELECTOR;

  if (target.closest(ignoreSelector)) return false;

  if (options.handle) {
    return target === element || !!target.closest(options.handle);
  }

  return true;
};
