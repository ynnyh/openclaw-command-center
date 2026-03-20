# AI Quickstart

Use this guide when a coding agent needs to integrate OpenClaw Command Center into an existing OpenClaw deployment quickly and conservatively.

## Goal

Produce a working OpenClaw UI overlay that:

- mounts to `/custom-ui`
- keeps the upstream OpenClaw runtime assets from the user's own environment
- adds `mission-control.html`
- adds `mission-control-overview.html`
- copies the local helper scripts into the target OpenClaw project

Do not vendor upstream runtime chunks into source control unless their redistribution terms are confirmed.

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

Generate the overlay from a running OpenClaw container:

```bash
./install.sh -c david -o /path/to/openclaw/custom-ui
```

This path generates the UI overlay only. If the target is a Windows-hosted OpenClaw project, copy `scripts/` separately or prefer `install.ps1`.

## Manual Integration Contract

If you are not allowed to run the installers, do exactly this:

1. Copy the upstream OpenClaw control UI out of a running container.
2. Detect the current hashed asset names in `custom-ui/assets/`.
3. Render `shell/index.html` by replacing:
   - `{{OPENCLAW_INDEX_JS}}`
   - `{{OPENCLAW_LIT_JS}}`
   - `{{OPENCLAW_FORMAT_JS}}`
   - `{{OPENCLAW_INDEX_CSS}}`
4. Render `shell/mission-control-overview.html` by replacing:
   - `{{OPENCLAW_INDEX_JS}}`
5. Copy these files into `custom-ui/assets/`:
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
6. Copy these files into `custom-ui/`:
   - rendered `index.html`
   - `mission-control.html`
   - rendered `mission-control-overview.html`
   - root icon files from `icons/`
7. Copy `shell/mission-control-assets/` into `custom-ui/mission-control-assets/`.
8. Copy helper scripts into `<OpenClawRoot>/scripts/`.
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

10. Add or merge this compose override:

```yaml
services:
  <your-openclaw-service>:
    volumes:
      - ./custom-ui:/custom-ui
```

11. Restart the OpenClaw deployment.
12. Start the helper process if host diagnostics are required.

## Verification Checklist

A successful integration should satisfy all of the following:

- `/mission-control.html` loads
- `/mission-control-overview.html` loads
- the wrapped OpenClaw control UI still renders
- `http://127.0.0.1:3211/health` returns success after helper startup
- the command center shell can reach the helper websocket at `ws://127.0.0.1:3211/ws`

## What Not To Do

- Do not overwrite the user's full `data/openclaw.json` automatically.
- Do not overwrite the user's full `docker-compose.yml` automatically.
- Do not commit the user's runtime-generated upstream chunks back into this repository by default.
- Do not move the helper into the container unless the deployment explicitly requires it.