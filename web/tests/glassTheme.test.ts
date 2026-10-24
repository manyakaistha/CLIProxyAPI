import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { compileString } from 'sass';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { BrandMark } from '../src/components/ui/BrandMark';

const readStyle = (name: string) =>
  readFileSync(new URL(`../src/styles/${name}.scss`, import.meta.url), 'utf8');
const css = compileString(`${readStyle('themes')}\n${readStyle('glass')}`).css;
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];

function palette(theme: 'light' | 'white' | 'dark') {
  const tokens: Record<string, string> = {};
  for (const [, selector, declarations] of rules) {
    if (selector.trim() !== ':root' && selector.trim() !== `[data-theme=${theme}]`) continue;
    for (const [, name, value] of declarations.matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
      tokens[name] = value.trim();
    }
  }
  return tokens;
}

function luminance(hex: string) {
  if (!/^#[\da-f]{6}$/i.test(hex)) throw new Error(`Expected an opaque hex color: ${hex}`);
  const channels = [1, 3, 5].map((offset) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe('glass theme readability', () => {
  for (const theme of ['light', 'white', 'dark'] as const) {
    test(`${theme} text and status colors meet normal-text contrast on all surfaces`, () => {
      const colors = palette(theme);
      for (const background of ['--bg-primary', '--bg-secondary', '--bg-quinary']) {
        for (const foreground of [
          '--text-primary',
          '--text-secondary',
          '--text-tertiary',
          '--success-color',
          '--warning-color',
          '--error-color',
          '--info-color',
        ]) {
          expect(contrast(colors[foreground], colors[background])).toBeGreaterThanOrEqual(4.5);
        }
      }
    });

    test(`${theme} primary action has readable text across its entire gradient`, () => {
      const colors = palette(theme);
      const stops = colors['--action-fill'].match(/#[\da-f]{6}/gi) ?? [];
      expect(stops.length).toBeGreaterThanOrEqual(2);
      for (const stop of stops) {
        expect(contrast(colors['--primary-contrast'], stop)).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  test('brand mark has an accessible name without exposing decorative paths', () => {
    const html = renderToStaticMarkup(createElement(BrandMark));
    expect(html).toContain('role="img" aria-label="CLI Proxy API"');
    expect(html).toContain('aria-hidden="true"');
  });
});
