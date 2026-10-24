export interface Point {
  x: number;
  y: number;
}
export type SignalCurve = readonly [Point, Point, Point, Point];

/** Stable, normalized geometry: resizing never changes the identity of a route. */
export function createSignalRoutes(seed = 418, count = 5): SignalCurve[] {
  let state = seed | 0;
  const random = () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const routeCount = Number.isFinite(count) ? Math.max(1, Math.min(12, Math.floor(count))) : 5;
  return Array.from({ length: routeCount }, (_, index) => {
    const y = 0.15 + (index / Math.max(1, routeCount - 1)) * 0.7;
    const bend = 0.24 + random() * 0.1;
    return [
      { x: 0.04, y },
      { x: bend, y },
      { x: 1 - bend, y: 1 - y },
      { x: 0.96, y: 1 - y },
    ];
  });
}

export function pointOnSignal(curve: SignalCurve, progress: number): Point {
  const t = Math.max(0, Math.min(1, progress));
  const u = 1 - t;
  return {
    x:
      u ** 3 * curve[0].x +
      3 * u ** 2 * t * curve[1].x +
      3 * u * t ** 2 * curve[2].x +
      t ** 3 * curve[3].x,
    y:
      u ** 3 * curve[0].y +
      3 * u ** 2 * t * curve[1].y +
      3 * u * t ** 2 * curve[2].y +
      t ** 3 * curve[3].y,
  };
}

export function nearestSignal(routes: SignalCurve[], x: number, y: number): number {
  let nearest = 0;
  let distance = Infinity;
  routes.forEach((route, index) => {
    const point = pointOnSignal(route, x);
    const next = Math.abs(point.y - y);
    if (next < distance) {
      distance = next;
      nearest = index;
    }
  });
  return nearest;
}
