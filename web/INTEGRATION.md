# Glass management UI

This directory vendors the MIT-licensed CLI Proxy API Management Center from
https://github.com/router-for-me/Cli-Proxy-API-Management-Center at commit
`fe2963330f32a933f562282165f62ae52cf57145`. The upstream license is retained in
`web/LICENSE`. The original routes, v8 API client, authentication, and theme persistence
are preserved.

The floating navigation retains grouped black-and-gold glass panels and the white
raised-glass theme. The main workspace uses a separate, scoped control-console
system with clear sans-serif typography, thin borders, integrated metrics, readable
forms, and subdued surfaces. Sidebar styles are not overridden by workspace tokens.
Appearance is selectable on the login screen and from the workspace header.

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
