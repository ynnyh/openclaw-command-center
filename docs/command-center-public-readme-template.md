# openclaw-command-center

Drop-in Mission Control overlay for OpenClaw.

`openclaw-command-center` adds an enhanced control center UI, Mission Control pages, and a host-side helper for diagnostics and service visibility.

## Status

Current release target:

- Windows host
- Docker-based OpenClaw deployment
- OpenClaw custom UI mounting enabled

This project is currently an overlay for OpenClaw, not a standalone replacement backend.

## What It Adds

- Mission Control entry page
- Mission Control overview page
- Enhanced shell integration around the native OpenClaw app
- Host-side helper for MCP process visibility and diagnostics

## How It Works

The package integrates with an existing OpenClaw deployment by:

1. Mounting `custom-ui/` into the OpenClaw container
2. Pointing `gateway.controlUi.root` to `/custom-ui`
3. Running a host-side helper for diagnostics and service state

## Quick Start

```powershell
git clone <your-public-repo-url>
cd openclaw-command-center
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

After install, restart your OpenClaw deployment:

```powershell
docker compose up -d
```

## Required Environment

Example variables:

```env
COMMAND_CENTER_HELPER_HOST=127.0.0.1
COMMAND_CENTER_ALLOWED_ORIGINS=
COMMAND_CENTER_OUTPUT_DIR=
COMMAND_CENTER_MCP_ROOT=
COMMAND_CENTER_FILESYSTEM_TARGET=
COMMAND_CENTER_FILESYSTEM_DIR=
COMMAND_CENTER_PUPPETEER_DIR=
COMMAND_CENTER_TENCENTCODE_DIR=
COMMAND_CENTER_HELPER_PORT=3211
```

## Files Included

- `custom-ui/`
- `scripts/command-center-helper.mjs`
- `scripts/ensure-command-center-helper.ps1`
- `scripts/install-command-center-helper-autostart.ps1`
- `examples/docker-compose.command-center.override.yml`
- `examples/openclaw.command-center.patch.json`

## Manual Integration

If you do not want to run the installer, integrate manually:

1. Copy `custom-ui/` into your OpenClaw project
2. Mount it into the container as `/custom-ui`
3. Set `gateway.controlUi.root` to `/custom-ui`
4. Start the helper on the host
5. Restart OpenClaw

## Compatibility

Initial compatibility target:

- OpenClaw versions tested by this repo: document exact versions here
- Windows host only for helper scripts in `v0.1.0`

## Limitations

- Depends on OpenClaw native frontend runtime
- Not yet cross-platform
- Installer is intentionally conservative and may require manual confirmation

## Troubleshooting

Add short links here:

- helper health check
- missing custom UI mount
- Mission Control page opens but native app cannot connect
- helper websocket unavailable

## Security Notes

- Do not commit `.env`
- Do not expose helper ports publicly
- Review any generated Docker override before applying it

## License

Add your chosen license here.

If any upstream OpenClaw frontend assets are redistributed, confirm license compatibility before publishing.
