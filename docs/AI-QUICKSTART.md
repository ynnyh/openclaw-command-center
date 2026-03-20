# AI Quickstart

Use this guide when a coding agent needs to integrate OpenClaw Command Center into an existing OpenClaw deployment.

## Goal

Produce a working OpenClaw control UI overlay that:

- mounts to `/custom-ui`
- keeps the upstream OpenClaw runtime assets from the user's own running container
- wraps the native control UI with the rendered `index.html` from this repository
- adds `mission-control.html`
- adds `mission-control-overview.html`
- optionally copies the host-side helper scripts into the target OpenClaw project

This repository is an overlay package, not a standalone OpenClaw replacement.

## Inputs You Need

- path to this repository
- path to the target OpenClaw project
- a running OpenClaw container
- Docker access on the host

Expected target project structure:

```text
<OpenClawRoot>/
  data/openclaw.json
  docker-compose.yml
```

## Fast Path: Windows

Run the bundled installer:

```powershell
.\install.ps1 `
  -OpenClawRoot D:\coding\my-openclaw `
  -WriteDockerOverride `
  -WriteEnvExample
```

Optional flags:

- `-Container <name>`: use a specific running OpenClaw container
- `-EnableAutostart`: register helper autostart
- `-Force`: replace an existing `custom-ui` directory
- `-DryRun`: print the planned actions without writing files

Installer outputs:

- `<OpenClawRoot>\custom-ui`
- `<OpenClawRoot>\scripts\command-center-helper.mjs`
- `<OpenClawRoot>\scripts\ensure-command-center-helper.ps1`
- `<OpenClawRoot>\scripts\install-command-center-helper-autostart.ps1`
- `<OpenClawRoot>\openclaw.command-center.patch.json`
- optionally `<OpenClawRoot>\docker-compose.command-center.override.yml`
- optionally updated `<OpenClawRoot>\.env.example`

## Fast Path: Bash

Generate the overlay directory from a running OpenClaw container:

```bash
./install.sh -c openclaw -o /path/to/openclaw/custom-ui
```

This path renders the overlay output only. It does not copy helper scripts into the target project and does not write project-local patch or compose files automatically.

Use these repository examples alongside the generated overlay:

- `examples/openclaw.command-center.patch.json`
- `examples/docker-compose.command-center.override.yml`

## Manual Integration Contract

If you are not allowed to run the installers, do exactly this:

1. Copy the upstream OpenClaw control UI out of a running container into `<OpenClawRoot>/custom-ui`.
2. Detect the current hashed asset names in `<OpenClawRoot>/custom-ui/assets/`.
3. Render `shell/index.html` by replacing:
   - `{{OPENCLAW_INDEX_JS}}`
   - `{{OPENCLAW_LIT_JS}}`
   - `{{OPENCLAW_FORMAT_JS}}`
   - `{{OPENCLAW_INDEX_CSS}}`
4. Render `shell/mission-control-overview.html` by replacing:
   - `{{OPENCLAW_INDEX_JS}}`
5. Copy these files into `<OpenClawRoot>/custom-ui/assets/`:
   - `mission-control-shell.js`
   - `mission-control-shell.css`
   - `theme-switcher.js`
   - `theme-switcher.css`
   - `theme-shanshui.css`
   - `theme-taohua.css`
   - `theme-qingci.css`
   - `mission-control-overview.css`
   - `mission-control-overview.js`
   - `mission-control-preview.css`
6. Copy these files into `<OpenClawRoot>/custom-ui/`:
   - rendered `index.html`
   - `mission-control.html`
   - rendered `mission-control-overview.html`
   - root icon files from `icons/`
7. Copy `shell/mission-control-assets/` into `<OpenClawRoot>/custom-ui/mission-control-assets/`.
8. If host diagnostics are required, copy helper scripts into `<OpenClawRoot>/scripts/`.
9. Write this config patch to `<OpenClawRoot>/openclaw.command-center.patch.json`:

```json
{
  "gateway": {
    "controlUi": {
      "root": "/custom-ui"
    }
  }
}
```

10. Add or merge this compose override into `<OpenClawRoot>/docker-compose.command-center.override.yml`:

```yaml
services:
  <your-openclaw-service>:
    volumes:
      - ./custom-ui:/custom-ui
```

11. Restart the OpenClaw deployment.
12. Start the helper only if host diagnostics are needed.

## Verification Checklist

A successful integration should satisfy all of the following:

- `/` still loads the wrapped OpenClaw control UI
- `/mission-control.html` loads
- `/mission-control-overview.html` loads
- the mounted `custom-ui` directory is visible inside the OpenClaw container
- `http://127.0.0.1:3211/health` returns success after helper startup, if helper is enabled
- the command center shell can reach `ws://127.0.0.1:3211/ws`, if helper is enabled

## What Not To Do

- Do not describe this repository as a standalone app
- Do not overwrite the user's full `data/openclaw.json` automatically
- Do not overwrite the user's full compose file automatically
- Do not commit runtime-generated upstream chunks back into this repository by default
- Do not move the helper into the container unless the deployment explicitly requires it
