# Glass theme validation

Validated on October 24, 2026 with Bun 1.3.14.

## Automated checks

- `bun test tests/glassTheme.test.ts tests/pluginResourceTheme.test.ts`: 10 passed.
  The new tests check normal-text contrast for primary, secondary, supporting,
  and semantic text on each opaque surface; primary button text against both
  gradient stops; and the accessible vector brand mark.
- `bun run lint`: passed.
- `bun run build:panel`: passed TypeScript compilation and the Vite production
  build, then installed the generated panel at `../static/management.html`.
- `go build -o test-output ./cmd/server`: passed; the temporary binary was removed.
- `bun run verify`: the test phase reported 1,640 passed and six failed. The same
  six failures were reproduced in a separate checkout of the untouched frontend
  baseline, commit `3b8c3065` (1,633 passed and six failed). Lint and build were
  therefore also run independently.

The existing failures are in:

- `devinQuotaUi.test.ts`: remaining meters, resets, and plan rendering.
- `logRequests.test.ts`: synchronous lifecycle invalidation source contract.
- `providerProbeProxy.test.ts`: editable proxy source contract.
- `quotaToolbar.test.ts`: clear-search source contract.
- `xaiQuotaUnavailable.test.ts`: subscription/reset rendering and monthly meter
  direction (two tests).

## Browser checks

Checked the running application at 1440 x 900, 1280 x 720, 390 x 844, and
320 x 568 CSS pixels. Desktop route checks covered dashboard, quick start,
providers, credentials, OAuth, quota, configuration, logs, plugins, plugin store,
and system information in dark and light glass. Phone checks covered the main
operational routes, drawer restoration, theme menu, and short log viewport.
There was no page-level horizontal overflow; tab strips and log content retain
intentional internal scrolling.

Also exercised the login theme selector, header appearance cards, persisted theme
choice, automatic light/dark system switching, Ctrl+B sidebar collapse/restoration,
provider creation sheet, keyboard focus inside the sheet, and Escape dismissal.
Phone header targets measure 44 x 44 CSS pixels. All three bundled fonts loaded.
The production preview also loaded all three fonts; the generated HTML contains
three embedded WOFF2 fonts and requires no external JavaScript, CSS, or font files.
Opaque surfaces provide the material fallback, and the shared reduced-motion,
reduced-transparency, and forced-colors rules remain in place. Those accessibility
media preferences were inspected in CSS; only color-scheme was emulated live.

The authenticated browser session used temporary, read-only presentation fixtures
with fictitious credentials and explicitly labeled preview data. These were injected
only into that browser session and are not part of the application. No live backend
or upstream OAuth, quota, mutation, or export flow was validated. Screenshots show
presentation fixtures, not live traffic.
