# OpenClaw Command Center

OpenClaw Command Center is a control UI overlay package for an existing OpenClaw deployment. It reuses the native `<openclaw-app>` runtime and layers a Mission Control shell, overview pages, and an optional host-side helper on top.

OpenClaw Command Center 是一个面向现有 OpenClaw 部署的 control UI overlay package。它复用原生 `<openclaw-app>` runtime，并在其外面叠加 Mission Control shell、overview 页面和可选的宿主机 helper。

## Language / 语言

- [中文说明](README.zh-CN.md)
- [English README](README.en.md)

## Quick Definition

- This repository is an OpenClaw control UI overlay package.
- It is not a standalone app.
- It does not replace the OpenClaw backend or gateway.
- It generates a `custom-ui` directory intended to be mounted at `/custom-ui`.
- It can optionally wire a host-side helper for diagnostics and service visibility.

## Quick Links

- [AI Quickstart](docs/AI-QUICKSTART.md)
- [Architecture](docs/architecture.md)
- [Compatibility](docs/compatibility.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Config patch example](examples/openclaw.command-center.patch.json)
- [Compose override example](examples/docker-compose.command-center.override.yml)

## Notes

- The public README intentionally does not embed product screenshots.
- Detailed documentation lives in the language-specific README files above.

## License

MIT
