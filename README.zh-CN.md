# OpenClaw Command Center

[English](README.en.md) | [README Index](README.md)

OpenClaw Command Center 是一个面向现有 OpenClaw 部署的 control UI overlay package。它复用原生 `<openclaw-app>` runtime，在现有控制台外面叠加 Mission Control shell、overview 页面，以及一个可选的宿主机 helper 用于诊断。

## 这是什么

- 这是 OpenClaw 控制台 UI 的 overlay package，不是 standalone app
- 它不会替代 OpenClaw backend 或 gateway
- 它依赖你自己运行中的 OpenClaw 容器，从容器里提取上游 control UI runtime
- 它生成一个可挂载到 `/custom-ui` 的 `custom-ui` 目录，并在其上叠加本仓库的页面和静态资源

## 仓库包含什么

- `shell/`
  overlay HTML 模板、Mission Control 页面、shell 资源
- `icons/`
  安装后复制到 `custom-ui` 根目录的图标文件
- `scripts/command-center-helper.mjs`
  可选的宿主机 helper API，提供诊断和服务可见性
- `scripts/ensure-command-center-helper.ps1`
  Windows 下启动 helper 并等待健康检查通过
- `scripts/install-command-center-helper-autostart.ps1`
  Windows 下注册 helper 自启动
- `install.ps1`
  Windows-first 安装器，直接把 overlay 写入现有 OpenClaw 项目
- `install.sh`
  跨平台 overlay builder，从运行中的 OpenClaw 容器生成 `custom-ui`
- `docs/AI-QUICKSTART.md`
  给 AI / coding agent 的接入契约
- `docs/architecture.md`
  对外的架构说明
- `docs/compatibility.md`
  当前支持边界与兼容性说明
- `docs/troubleshooting.md`
  常见问题与排障入口
- `examples/openclaw.command-center.patch.json`
  最小配置 patch，把 `gateway.controlUi.root` 指到 `/custom-ui`
- `examples/docker-compose.command-center.override.yml`
  最小 volume mount 示例

## `install.ps1` 做什么

适用于已有 OpenClaw 项目、Windows 主机、并希望一次性把 overlay 和 helper 一起接入的情况。

```powershell
git clone https://github.com/ynnyh/openclaw-command-center.git
cd openclaw-command-center

.\install.ps1 `
  -OpenClawRoot D:\coding\my-openclaw `
  -WriteDockerOverride `
  -WriteEnvExample
```

它会：

1. 从运行中的 OpenClaw 容器提取 upstream control UI
2. 检测当前 hashed runtime asset 文件名
3. 渲染 overlay 模板并写入 `<OpenClawRoot>\custom-ui`
4. 复制 helper 脚本到 `<OpenClawRoot>\scripts`
5. 生成 `<OpenClawRoot>\openclaw.command-center.patch.json`
6. 可选生成 `<OpenClawRoot>\docker-compose.command-center.override.yml`
7. 可选补充 `<OpenClawRoot>\.env.example`

## `install.sh` 做什么

适用于 Linux / macOS / Git Bash，或者你只想生成 overlay 输出目录、不直接改 OpenClaw 项目的情况。

```bash
git clone https://github.com/ynnyh/openclaw-command-center.git
cd openclaw-command-center
./install.sh -c openclaw -o /path/to/openclaw/custom-ui
```

它会：

1. 从运行中的 OpenClaw 容器提取 upstream control UI
2. 检测当前 hashed runtime asset 文件名
3. 渲染 `index.html` 和 `mission-control-overview.html`
4. 把 overlay 资源写入你指定的输出目录

`install.sh` 只生成 overlay 目录，不会自动把 helper 复制到目标项目，也不会自动写入目标项目的 patch 或 compose override。

## helper 是什么

helper 是可选的宿主机进程，不默认放进容器里。它用于：

- 提供本地诊断接口
- 提供服务状态和 helper 快照
- 给 overlay 页面的诊断面板和 websocket 提供数据

默认端点：

- `http://127.0.0.1:3211/health`
- `ws://127.0.0.1:3211/ws`

相关环境变量见 `.env.example`：

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

## AI Quickstart 是什么

`docs/AI-QUICKSTART.md` 是给 AI / coding agent 的明确接入说明，定义了：

- 需要生成哪些文件
- 应该放到哪个目录
- 使用哪些固定文件名
- 如何挂载 `/custom-ui`
- 哪些事情不要自动覆盖

## 边界

- helper 当前是 Windows-first
- overlay 依赖用户自己环境中的 OpenClaw runtime assets
- 仓库默认不提交 upstream runtime chunks
- 公开 README 不嵌入产品截图

## License

MIT
