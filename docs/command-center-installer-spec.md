# openclaw-command-center Installer Spec

## Objective

`install.ps1` 的目标不是“魔法改写用户全部环境”，而是：

- 校验目标环境是否像一个 OpenClaw 项目
- 复制控制台相关文件
- 生成最小接入所需的 patch 和 override
- 给出明确的下一步操作

`v0.1.0` 建议采用半自动安装。

## Inputs

安装器建议支持两种输入方式：

- 交互式
- 命令行参数

建议参数：

```powershell
.\install.ps1 `
  -OpenClawRoot D:\coding\my-openclaw `
  -EnableAutostart `
  -WriteDockerOverride `
  -WriteEnvExample
```

建议参数定义：

- `-OpenClawRoot`
  - 目标 OpenClaw 项目根目录
- `-EnableAutostart`
  - 安装后注册 helper 开机自启动
- `-WriteDockerOverride`
  - 生成 `docker-compose.command-center.override.yml`
- `-WriteEnvExample`
  - 在目标目录生成或更新 `.env.example`
- `-Force`
  - 覆盖已有输出文件
- `-DryRun`
  - 只打印计划，不落盘

## Validation

安装器至少检查：

- 目标目录存在
- 目标目录下存在 `data/`
- 目标目录下存在 `docker-compose.yml` 或其他 compose 文件
- 目标目录下存在 `data/openclaw.json` 或用户指定的 OpenClaw 配置文件
- 当前仓库自身包含：
  - `custom-ui/`
  - `scripts/command-center-helper.mjs`
  - `scripts/ensure-command-center-helper.ps1`

若校验失败，直接停止，并输出缺失项。

## Files To Write

安装器建议只写这些内容：

### 1. UI files

复制：

- `custom-ui/` -> `<OpenClawRoot>/custom-ui/`

### 2. Helper files

复制：

- `scripts/command-center-helper.mjs` -> `<OpenClawRoot>/scripts/command-center-helper.mjs`
- `scripts/ensure-command-center-helper.ps1` -> `<OpenClawRoot>/scripts/ensure-command-center-helper.ps1`
- `scripts/install-command-center-helper-autostart.ps1` -> `<OpenClawRoot>/scripts/install-command-center-helper-autostart.ps1`

### 3. Example env

生成或更新：

- `<OpenClawRoot>/.env.example`

只追加缺失项，不覆盖已有值。

### 4. Docker override

可选生成：

- `<OpenClawRoot>/docker-compose.command-center.override.yml`

建议不要默认直接覆盖用户的 `docker-compose.command-center.override.yml`

### 5. Config patch

生成：

- `<OpenClawRoot>/openclaw.command-center.patch.json`

内容仅包含最小 patch：

```json
{
  "gateway": {
    "controlUi": {
      "root": "/custom-ui"
    }
  }
}
```

## Do Not Auto-Mutate In V0.1.0

第一版不建议自动做这些事情：

- 直接改写用户完整 `data/openclaw.json`
- 直接改写用户完整 `docker-compose.yml`
- 删除或回滚用户已有文件
- 自动启动或重启 Docker 容器

原因：

- 容易踩用户已有定制
- 错误恢复复杂
- 首版发布更应该稳，而不是激进

## Installer Output

安装结束后应该输出明确结果：

### Installed

- UI copied to `<OpenClawRoot>/custom-ui`
- Helper scripts copied to `<OpenClawRoot>/scripts`
- Patch written to `<OpenClawRoot>/openclaw.command-center.patch.json`
- Override written to `<OpenClawRoot>/docker-compose.command-center.override.yml`

### Manual Steps Required

1. Merge config patch into `data/openclaw.json`
2. Merge Docker override into your compose stack
3. Start or restart your OpenClaw deployment
4. Run helper or install helper autostart

## Suggested Docker Override Template

```yaml
services:
  david:
    volumes:
      - ./custom-ui:/custom-ui
    ports:
      - "3210:3210"
```

如果 helper 不需要通过容器端口暴露，可以去掉 `3210`。

## Suggested Env Template

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

## Autostart

当用户传入 `-EnableAutostart` 时，安装器建议只做：

- 调用 `scripts/install-command-center-helper-autostart.ps1`

若失败，不回滚文件复制，只打印失败原因。

## Uninstall Contract

后续可提供 `uninstall.ps1`，但第一版最低要求是文档说明：

- 哪些文件是新增的
- 哪些 override/patch 需要用户手工移除
- 如何取消 helper 自启动

## Success Definition

安装器完成后，用户至少应能做到：

1. 打开 OpenClaw 控制台
2. 访问 `/mission-control.html`
3. 访问 `/mission-control-overview.html`
4. 在本机看到 helper health 正常

## Release Note Guidance

`v0.1.0` 发布说明建议明确写：

- This installer is conservative by design.
- It copies files and generates patches, but does not rewrite your full OpenClaw setup automatically.
