/** Elements that should receive normal click/tap without starting a gesture. */
export const DEFAULT_IGNORE_SELECTOR = [
  "button",
  "a",
  "input",
  "textarea",
  "select",
  "option",
  "label",
  "[contenteditable]",
  "[data-gesture-ignore]",
].join(", ");

export const SUPPORTS_POINTER =
  typeof window !== "undefined" && "PointerEvent" in window;
