# Troubleshooting

## `install.ps1` cannot find an OpenClaw project

Check that the target directory contains:

- `data/openclaw.json`
- a compose file such as `docker-compose.yml`, `docker-compose.yaml`, `compose.yml`, or `compose.yaml`

## `install.ps1` cannot detect a container

The installer requires a running OpenClaw container.

Try:

1. start the deployment first
2. pass `-Container <name>` explicitly

## `install.sh` or `install.ps1` cannot find runtime assets

The generated overlay depends on the upstream OpenClaw control UI copied from the running container.

If extraction succeeds but asset detection fails, verify that the container still contains:

- `assets/index-*.js`
- `assets/lit-*.js`
- `assets/format-*.js`
- `assets/index-*.css`

## Mission Control pages load but the wrapped UI does not

Check that:

- the generated `custom-ui` directory is mounted to `/custom-ui`
- `gateway.controlUi.root` points to `/custom-ui`
- the copied upstream runtime assets actually exist under `custom-ui/assets/`

## Helper health check fails

Check that:

- Node is installed on the host
- the helper is allowed to bind to `COMMAND_CENTER_HELPER_HOST:COMMAND_CENTER_HELPER_PORT`
- no other process is already using that port

Default health endpoint:

- `http://127.0.0.1:3211/health`

## Helper websocket does not connect

Check that:

- the helper is running
- the browser can reach the configured helper host and port
- `COMMAND_CENTER_ALLOWED_ORIGINS` is either empty or includes the page origin

If `COMMAND_CENTER_ALLOWED_ORIGINS` is empty, the helper only allows loopback browser origins by default.

## MCP services show as unconfigured

That means the helper did not receive enough path configuration to manage those services.

Set one or more of:

- `COMMAND_CENTER_MCP_ROOT`
- `COMMAND_CENTER_FILESYSTEM_DIR`
- `COMMAND_CENTER_PUPPETEER_DIR`
- `COMMAND_CENTER_TENCENTCODE_DIR`

## `/api/snapshot` fails in restricted environments

The helper snapshot flow inspects host processes. In heavily restricted environments, process enumeration may fail even if `/health` works.

If that happens:

- verify `/health` first
- test the helper on a less restricted host shell
- treat the helper as optional for basic overlay installation
