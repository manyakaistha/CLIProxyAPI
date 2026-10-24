# Glass management UI

This directory vendors the MIT-licensed CLI Proxy API Management Center from
https://github.com/router-for-me/Cli-Proxy-API-Management-Center at commit
`fe2963330f32a933f562282165f62ae52cf57145`. The upstream license is retained in
`web/LICENSE`. The original routes, v8 API client, authentication, and theme persistence
are preserved.

The interface follows the Black Glass Workspaces skill: near-black surroundings,
layered charcoal surfaces, silver controls, and restrained semantic status colors.
Light mode uses the same geometry with pale glass, graphite controls, and subtle
contact shadows. The existing white preference offers a brighter light variant.
All routes, navigation, dialogs, forms, and charts share the same semantic theme
tokens. Appearance is selectable on the login screen and from the workspace header;
the automatic setting continues to follow the operating system.

Manrope is used for interface text, Space Grotesk for headings, and Syne for the
wordmark. Local variable WOFF2 fonts are inlined into the production HTML, with
system fallbacks for additional scripts. Font licenses are retained alongside
the files in `src/assets/fonts/`; no external font service is required at runtime.
The original chevron mark and matching favicon are vector assets rendered locally.

The dashboard routing lens is decorative: its geometry is seeded once, it redraws
on pointer input or layout/theme changes, and it has no idle animation loop. Touch
and reduced-motion users get a static scene. Request counts and charts continue
to show only real backend data.

## Build and run

Use Bun 1.3.14 and Node.js 24 or newer:

```sh
cd web
bun install --frozen-lockfile
bun run build:panel
cd ..
# Copy config.example.yaml to config.yaml and set your management and client keys.
go run ./cmd/server --config config.yaml
```

Open `http://localhost:8317/management.html`. `build:panel` builds the single-file UI
and copies it to `static/management.html`, the backend's existing asset location.
For `MANAGEMENT_STATIC_PATH` or a writable storage backend, copy that file into the
configured static directory instead. Generated bundles and dependencies are ignored.

Keep `management.disable-auto-update-panel: true` in your configuration so the
upstream panel updater does not replace the customized build. This fork's example
configuration sets it explicitly. Existing configurations must set it themselves.
The Docker build also builds and includes the custom panel.

## Development and verification

```sh
cd web
bun run dev --host 127.0.0.1
bun run verify
```

Connect the development UI to a running CLIProxyAPI instance through the login
screen's custom connection setting. No production credentials are bundled, and
the UI does not bypass management authentication.
