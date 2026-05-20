import type { Direction } from "./types";

export const cardinalFromDelta = (dx: number, dy: number): Direction =>
  Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");

export const directionBeyondThreshold = (
  dx: number,
  dy: number,
  minMove: number
): Direction | undefined => {
  if (Math.abs(dx) < minMove && Math.abs(dy) < minMove) return undefined;
  return cardinalFromDelta(dx, dy);
};

export const distance = (dx: number, dy: number) => Math.hypot(dx, dy);
