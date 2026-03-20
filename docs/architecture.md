# Architecture

OpenClaw Command Center is an overlay package for an existing OpenClaw deployment.

## Components

- `install.ps1`
  Windows-first installer that writes the overlay into an existing OpenClaw project
- `install.sh`
  Overlay builder that renders a `custom-ui` directory from a running OpenClaw container
- `shell/`
  Overlay templates, Mission Control entry pages, shell assets, and runtime wrappers
- `scripts/command-center-helper.mjs`
  Optional host-side helper process for diagnostics and service visibility
- `examples/`
  Minimal config patch and compose override examples

## Runtime Model

The package does not ship the upstream OpenClaw frontend runtime by default.

Instead, the installer:

1. copies the upstream control UI from a running OpenClaw container
2. detects the current hashed runtime asset names
3. renders this repository's overlay templates against those asset names
4. writes the final output into `custom-ui`

The generated output is still the OpenClaw control UI. This package adds:

- a wrapped `index.html`
- `mission-control.html`
- `mission-control-overview.html`
- shell and overview assets
- optional helper-backed diagnostics

## Helper Model

The helper is host-side and optional.

It provides:

- `GET /health`
- `GET /api/snapshot`
- `WS /ws`

The helper is configured through environment variables such as:

- `COMMAND_CENTER_HELPER_HOST`
- `COMMAND_CENTER_HELPER_PORT`
- `COMMAND_CENTER_ALLOWED_ORIGINS`
- `COMMAND_CENTER_OUTPUT_DIR`
- `COMMAND_CENTER_MCP_ROOT`

The helper is not intended to run inside the OpenClaw container by default.

## Output Contract

The Windows installer writes:

- `<OpenClawRoot>/custom-ui`
- `<OpenClawRoot>/scripts/command-center-helper.mjs`
- `<OpenClawRoot>/scripts/ensure-command-center-helper.ps1`
- `<OpenClawRoot>/scripts/install-command-center-helper-autostart.ps1`
- `<OpenClawRoot>/openclaw.command-center.patch.json`
- optionally `<OpenClawRoot>/docker-compose.command-center.override.yml`

The Bash installer writes only the overlay output directory you pass with `-o`.

## Boundaries

- This repository is not a standalone app
- It does not replace the OpenClaw backend or gateway
- It depends on a running OpenClaw container during install/build
- It does not rewrite the user's full deployment automatically
