# Compatibility

This repository is currently designed around a conservative target environment.

## Intended Target

- Existing OpenClaw deployment
- Docker-based runtime
- A running OpenClaw container available during install/build
- Custom UI mounted at `/custom-ui`
- Windows host for the helper bootstrap scripts

## Current Assumptions

The installers currently assume:

- the OpenClaw control UI exists inside the container at `/usr/local/lib/node_modules/openclaw/dist/control-ui`
- the target project contains `data/openclaw.json`
- the target project contains a compose file such as `docker-compose.yml` or `compose.yml`

## Helper Support

- `scripts/ensure-command-center-helper.ps1` is Windows-specific
- `scripts/install-command-center-helper-autostart.ps1` is Windows-specific
- `scripts/command-center-helper.mjs` itself is Node-based, but the surrounding bootstrap flow is Windows-first

## Browser/UI Assumptions

- the generated overlay expects the upstream OpenClaw runtime assets copied from the user's own environment
- the Mission Control pages depend on the native `<openclaw-app>` runtime

## Not Promised

The repository does not currently promise:

- Linux/macOS helper bootstrap parity
- automatic support for arbitrary non-Docker deployments
- compatibility with every OpenClaw version
- redistribution of upstream runtime chunks in source control

## Recommended Release Positioning

The safest public positioning is:

- supported: Windows host + Docker-based OpenClaw deployment
- experimental: other environments
