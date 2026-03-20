# OpenClaw Command Center Open Source Plan

## Goal

把当前仓库里的控制台改造成果整理成一个可公开发布、可一键接入的独立仓库。

这个独立仓库的定位不是替代 OpenClaw，而是：

- 为 OpenClaw 提供增强版控制台入口
- 提供 Mission Control 页面
- 提供宿主机 helper
- 提供最小接入脚本和配置样例

建议仓库名候选：

- `openclaw-command-center`
- `openclaw-mission-control`
- `openclaw-control-overlay`

推荐优先用：`openclaw-command-center`

原因：

- 比 `mission-control` 更宽，后续能容纳总览页、helper、installer
- 比 `overlay` 更偏产品名，外部用户更容易理解

## Release Shape

建议作为独立仓库发布，不直接开源当前仓库。

原因：

- 当前仓库是整套本地办公室环境，包含部署、数据、运行态配置
- 外部用户很难判断哪些文件是“产品”，哪些只是你的本机环境
- 直接开源当前仓库会暴露过多上下文，也会让接入路径变复杂

建议采用双轨：

- 当前仓库继续作为主开发仓库
- 新仓库作为对外发布仓库

## Scope

新仓库第一阶段只承诺以下范围：

- OpenClaw 控制台增强 UI
- Mission Control 页面
- Windows 宿主机 helper
- Docker 部署场景的接入说明
- 最小可运行接入脚本

第一阶段明确不承诺：

- 直接替代 OpenClaw 官方前端
- Linux/macOS helper
- 任意部署方式自动适配
- 与所有 OpenClaw 版本完全兼容

## Proposed Repository Layout

```text
openclaw-command-center/
  README.md
  LICENSE
  CHANGELOG.md
  .gitignore
  .env.example
  install.ps1
  uninstall.ps1
  examples/
    docker-compose.override.yml
    openclaw.json.patch.json
  custom-ui/
    index.html
    mission-control.html
    mission-control-overview.html
    assets/
    mission-control-assets/
  scripts/
    command-center-helper.mjs
    ensure-command-center-helper.ps1
    install-command-center-helper-autostart.ps1
  docs/
    architecture.md
    compatibility.md
    troubleshooting.md
```

## What To Copy From This Repo

建议首批带走这些内容：

- `custom-ui/`
- `scripts/command-center-helper.mjs`
- `scripts/ensure-command-center-helper.ps1`
- `scripts/install-command-center-helper-autostart.ps1`
- README 中与控制台接入直接相关的部分
- STARTUP 文档中与 helper 自启动和配置变量直接相关的部分

建议不要带走：

- `data/`
- 当前仓库完整 `docker-compose.yml`
- 当前仓库完整 `STARTUP.md`
- 本机路径说明
- 运行态文件
- 任何用户私有环境假设

## Product Boundary

新仓库应该明确告诉用户：

- 这是一个 OpenClaw 控制台增强包
- 它依赖 OpenClaw 运行中的 Gateway
- 它不是一个独立后端
- 它目前通过自定义 UI 挂载和宿主机 helper 协作工作

对外描述建议：

> `openclaw-command-center` is a drop-in control center overlay for OpenClaw.  
> It adds a Mission Control entry, overview pages, and a host-side helper for richer diagnostics and service visibility.

## One-Click Install Contract

所谓“一键接入”，外部表现至少要满足：

- 用户只需要执行一条 PowerShell 命令，或运行一个 `install.ps1`
- 安装脚本自动完成最小接入
- 失败时给出清晰回滚或人工补救步骤

第一阶段安装脚本建议完成以下动作：

1. 检查目标目录中是否存在 OpenClaw 部署结构
2. 复制 `custom-ui/` 到目标目录
3. 复制 helper 脚本到目标目录
4. 输出或生成一份 `docker-compose.override.yml`
5. 提示用户在 `openclaw.json` 中加入 `gateway.controlUi.root=/custom-ui`
6. 提示或执行 helper 启动
7. 提示或执行容器重启

第一阶段不要强行做的事情：

- 自动深改用户已有 `docker-compose.yml`
- 自动改写用户完整 `openclaw.json`
- 自动探测所有机器路径并魔法修复

第一阶段最好采用“半自动安装”：

- 脚本负责复制文件和生成 patch
- 用户负责确认路径和应用 patch

这样更稳，也更容易发布 `v0.1.0`

## Minimal Install Flow

推荐对外安装流程：

1. 克隆仓库或下载 release zip
2. 运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

3. 脚本询问或读取：
   - OpenClaw 根目录
   - 是否启用 helper 自启动
   - 是否生成 `docker-compose.override.yml`

4. 脚本完成：
   - 拷贝 `custom-ui/`
   - 拷贝 `scripts/`
   - 生成 `examples/docker-compose.override.yml` 的本地副本
   - 输出需要合并到 `openclaw.json` 的 patch

5. 用户执行：

```powershell
docker compose up -d
```

## Configuration Surface

新仓库应只暴露少量必要配置：

```env
COMMAND_CENTER_MCP_ROOT=
COMMAND_CENTER_FILESYSTEM_TARGET=
COMMAND_CENTER_FILESYSTEM_DIR=
COMMAND_CENTER_PUPPETEER_DIR=
COMMAND_CENTER_TENCENTCODE_DIR=
COMMAND_CENTER_HELPER_PORT=3211
```

第一阶段建议保留默认值，但不能写死你的本机路径到 README 主流程里。

README 里应该把默认路径表述成“示例值”，不是“推荐固定值”。

## Known Couplings To Call Out

这些是目前必须在文档里明确的耦合点：

- `custom-ui/mission-control-overview.html` 依赖 `custom-ui/assets/index-D2aEq-P_.js`
- 页面依赖 `<openclaw-app>` 这个 OpenClaw 原生前端组件
- helper 默认监听 `127.0.0.1:3211`
- 接入方式依赖 `gateway.controlUi.root=/custom-ui`
- 当前 helper 以 Windows 为主

这意味着第一阶段发布应写成：

- Supported: Windows host + Docker-based OpenClaw
- Experimental: other environments

## Licensing Check

发布前必须单独确认这件事：

- `custom-ui/assets/index-D2aEq-P_.js` 和相关打包产物是否允许在独立仓库中直接再分发

如果答案不明确，优先改成以下任一方案：

- 仓库不直接提交该产物，只保留 patch 层
- 在安装脚本中要求用户从本地 OpenClaw 安装中拷贝基础前端产物
- 或改成“对已有 OpenClaw 前端做 overlay”的分发方式

这个问题不解决，不建议直接公开发布 `v0.1.0`

## Recommended Release Phases

### Phase 1

目标：先发一个诚实可用的版本

- Windows only
- Docker only
- 半自动安装
- 明确依赖 OpenClaw 原生前端

交付：

- 新仓库
- README
- install.ps1
- examples
- v0.1.0 tag

### Phase 2

目标：把接入体验从“半自动”拉到“接近一键”

- 自动生成 override 文件
- 更明确的路径探测
- 更好的校验和回滚
- 更好的 helper health check

### Phase 3

目标：降低对特定环境的依赖

- Linux/macOS helper
- 更通用的安装器
- 对上游前端资产的耦合收敛

## Publishing Checklist

发布前逐项确认：

- 已确认可再分发的文件边界
- README 明确支持范围
- 没有本机路径残留
- 没有私有 token 或私有地址
- `install.ps1` 能在一台干净 Windows 机器上跑通
- helper 未依赖你本机专有目录
- 提供卸载或回滚说明
- 提供兼容版本说明

## Immediate Next Step

按方案 A，下一步建议直接做这三件事：

1. 在当前仓库里起草新仓库 README
2. 起草 `install.ps1` 的行为规范和交互输入
3. 列出“可公开发布文件清单”和“因许可证需确认文件清单”

如果继续推进，下一轮就做：

- `docs/command-center-public-readme-template.md`
- `docs/command-center-installer-spec.md`
- `docs/command-center-public-file-manifest.md`
