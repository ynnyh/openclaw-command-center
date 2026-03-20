# OpenClaw Command Center

[中文](README.md)

OpenClaw Command Center is a control UI overlay package for an existing OpenClaw deployment. It reuses the native `<openclaw-app>` runtime and layers a Mission Control shell, overview pages, and an optional host-side helper for diagnostics on top.

## What This Is

- This repository is an overlay package for the OpenClaw control UI, not a standalone app
- It does not replace the OpenClaw backend or gateway
- It depends on your own running OpenClaw container and extracts the upstream control UI runtime from it
- It generates a `custom-ui` directory that is meant to be mounted at `/custom-ui`, then layers this repository's pages and assets on top

## What The Repository Contains

- `shell/`
  Overlay HTML templates, Mission Control pages, and shell assets
- `icons/`
  Icon files copied to the root of the generated `custom-ui` directory
- `scripts/command-center-helper.mjs`
  Optional host-side helper API for diagnostics and service visibility
- `scripts/ensure-command-center-helper.ps1`
  Starts the helper on Windows and waits for a healthy response
- `scripts/install-command-center-helper-autostart.ps1`
  Registers helper autostart on Windows
- `install.ps1`
  Windows-first installer that writes the overlay into an existing OpenClaw project
- `install.sh`
  Cross-platform overlay builder that renders a `custom-ui` directory from a running OpenClaw container
- `docs/AI-QUICKSTART.md`
  Integration contract for AI agents and coding assistants
- `docs/architecture.md`
  Public architecture notes
- `docs/compatibility.md`
  Current support boundary and compatibility notes
- `docs/troubleshooting.md`
  Common issues and troubleshooting entry points
- `examples/openclaw.command-center.patch.json`
  Minimal config patch that points `gateway.controlUi.root` to `/custom-ui`
- `examples/docker-compose.command-center.override.yml`
  Minimal volume mount example

## What `install.ps1` Does

Use it when you already have an OpenClaw project on a Windows host and want the full overlay + helper integration path.

```powershell
git clone https://github.com/ynnyh/openclaw-command-center.git
cd openclaw-command-center

.\install.ps1 `
  -OpenClawRoot D:\coding\my-openclaw `
  -WriteDockerOverride `
  -WriteEnvExample
```

It will:

1. Extract the upstream control UI from a running OpenClaw container
2. Detect the current hashed runtime asset names
3. Render the overlay templates into `<OpenClawRoot>\custom-ui`
4. Copy helper scripts into `<OpenClawRoot>\scripts`
5. Generate `<OpenClawRoot>\openclaw.command-center.patch.json`
6. Optionally generate `<OpenClawRoot>\docker-compose.command-center.override.yml`
7. Optionally update `<OpenClawRoot>\.env.example`

## What `install.sh` Does

Use it on Linux, macOS, or Git Bash when you only want the overlay output directory and do not want the script to modify an OpenClaw project in place.

```bash
git clone https://github.com/ynnyh/openclaw-command-center.git
cd openclaw-command-center
./install.sh -c openclaw -o /path/to/openclaw/custom-ui
```

It will:

1. Extract the upstream control UI from a running OpenClaw container
2. Detect the current hashed runtime asset names
3. Render `index.html` and `mission-control-overview.html`
4. Write the overlay assets into the output directory you specify

`install.sh` only produces the overlay directory. It does not automatically copy helper scripts into the target project and does not automatically write project-local patch or compose override files.

## What The Helper Is

The helper is an optional host-side process. It is not intended to run inside the OpenClaw container by default.

It provides:

- local diagnostic endpoints
- service visibility and helper snapshots
- data for the overlay diagnostic panels and websocket integration

Default endpoints:

- `http://127.0.0.1:3211/health`
- `ws://127.0.0.1:3211/ws`

Relevant environment variables are listed in `.env.example`:

```env
COMMAND_CENTER_HELPER_HOST=127.0.0.1
COMMAND_CENTER_HELPER_PORT=3211
COMMAND_CENTER_ALLOWED_ORIGINS=
COMMAND_CENTER_OUTPUT_DIR=
COMMAND_CENTER_MCP_ROOT=
COMMAND_CENTER_FILESYSTEM_TARGET=
COMMAND_CENTER_FILESYSTEM_DIR=
COMMAND_CENTER_PUPPETEER_DIR=
COMMAND_CENTER_TENCENTCODE_DIR=
```

## What AI Quickstart Is

`docs/AI-QUICKSTART.md` is the explicit integration guide for AI / coding agents. It defines:

- which files must be generated
- where those files should be placed
- which filenames should stay fixed
- how `/custom-ui` should be mounted
- which things should not be overwritten automatically

## Boundaries

- The helper flow is currently Windows-first
- The overlay depends on runtime assets copied from the user's own OpenClaw environment
- The repository does not commit upstream runtime chunks by default
- The public README does not embed product screenshots

## License

MIT
