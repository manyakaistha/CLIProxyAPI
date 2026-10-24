import { describe, expect, test } from 'bun:test';
import {
  createSignalRoutes,
  nearestSignal,
  pointOnSignal,
} from '@/features/dashboard/components/signalGeometry';

describe('routing lens geometry', () => {
  test('keeps route identity stable between resize and theme rebuilds', () => {
    expect(createSignalRoutes(418)).toEqual(createSignalRoutes(418));
    expect(createSignalRoutes(418)).not.toEqual(createSignalRoutes(419));
  });

  test('bounds route count and keeps every sampled point inside its viewport', () => {
    for (const count of [-3, 0, 1, 5, 12, 300, Infinity]) {
      const routes = createSignalRoutes(418, count);
      expect(routes.length).toBeGreaterThanOrEqual(1);
      expect(routes.length).toBeLessThanOrEqual(12);
      for (const route of routes) {
        for (let step = 0; step <= 20; step++) {
          const point = pointOnSignal(route, step / 20);
          expect(point.x).toBeGreaterThanOrEqual(0);
          expect(point.x).toBeLessThanOrEqual(1);
          expect(point.y).toBeGreaterThanOrEqual(0);
          expect(point.y).toBeLessThanOrEqual(1);
        }
        expect(pointOnSignal(route, 0.5).x).toBeCloseTo(0.5);
        expect(pointOnSignal(route, 0.5).y).toBeCloseTo(0.5);
      }
    }
  });

  test('clamps interrupted pointer positions to the route endpoints', () => {
    const [route] = createSignalRoutes();
    expect(pointOnSignal(route, -2)).toEqual(route[0]);
    expect(pointOnSignal(route, 3)).toEqual(route[3]);
  });

  test('selects the route under the pointer on either side of the hub', () => {
    const routes = createSignalRoutes();
    for (const progress of [0.05, 0.25, 0.75, 0.95]) {
      routes.forEach((route, index) => {
        const point = pointOnSignal(route, progress);
        expect(nearestSignal(routes, progress, point.y)).toBe(index);
      });
    }
  });
});
