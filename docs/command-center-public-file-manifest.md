# openclaw-command-center Public File Manifest

## Purpose

这份清单用于回答两个问题：

1. 新仓库里到底放什么
2. 从当前仓库迁移时，哪些东西必须带走，哪些不能带走

## New Repository: Must Include

这些文件建议直接迁移到新仓库。

### Root

- `README.md`
  - 使用新的公开 README
- `LICENSE`
- `CHANGELOG.md`
- `.gitignore`
- `.env.example`
- `install.ps1`

### UI

- `custom-ui/index.html`
- `custom-ui/mission-control.html`
- `custom-ui/mission-control-overview.html`
- `custom-ui/assets/mission-control-shell.js`
- `custom-ui/assets/mission-control-shell.css`
- `custom-ui/assets/mission-control-overview.css`
- `custom-ui/assets/mission-control-overview.js`
- `custom-ui/assets/mission-control-preview.css`
- `custom-ui/mission-control-assets/`

### Helper

- `scripts/command-center-helper.mjs`
- `scripts/ensure-command-center-helper.ps1`
- `scripts/install-command-center-helper-autostart.ps1`

### Examples

建议新增：

- `examples/docker-compose.override.yml`
- `examples/openclaw.json.patch.json`

### Docs

- `docs/architecture.md`
- `docs/compatibility.md`
- `docs/troubleshooting.md`

## New Repository: Conditionally Include

以下内容只有在许可证确认后才建议带上。

### Upstream frontend runtime assets

- `custom-ui/assets/index-D2aEq-P_.js`
- `custom-ui/assets/index-yp2NJnHN.css`
- `custom-ui/assets/lit-BZwq2xLD.js`
- 其他由 OpenClaw 原生前端构建出的 runtime chunk

原因：

- 这些文件不是你手写的 overlay 层，而是上游前端构建产物
- 需要先确认是否允许在独立仓库中再分发

如果许可证不明确，替代方案：

- 新仓库不直接提交这些文件
- 安装器从用户现有 OpenClaw 环境中拷贝这些 runtime 资产
- 新仓库只分发你自己的 overlay 文件

## New Repository: Do Not Include

这些内容不要迁移到新仓库。

### Runtime state

- 整个 `data/`

例外：

- 可以只保留一个最小示例 patch 文件放到 `examples/`

### Local deployment files

- 当前仓库完整 `docker-compose.yml`
- 本地 `.env`
- 本地日志、sqlite、session、downloads

### Workspace-specific docs

- 当前仓库完整 `STARTUP.md`
- 当前仓库完整 `TROUBLESHOOTING.md`
- 与本地办公室环境强绑定的说明

可以从这些文档里抽取控制台接入相关段落，但不要整份迁移。

## Recommended Copy Map

当前仓库到新仓库的建议映射：

```text
open-claw-office/custom-ui/                         -> openclaw-command-center/custom-ui/
open-claw-office/scripts/command-center-helper.mjs -> openclaw-command-center/scripts/command-center-helper.mjs
open-claw-office/scripts/ensure-command-center-helper.ps1
                                                   -> openclaw-command-center/scripts/ensure-command-center-helper.ps1
open-claw-office/scripts/install-command-center-helper-autostart.ps1
                                                   -> openclaw-command-center/scripts/install-command-center-helper-autostart.ps1
```

这些文件建议“改写后迁移”：

```text
open-claw-office/README.md      -> openclaw-command-center/README.md
open-claw-office/STARTUP.md     -> openclaw-command-center/docs/troubleshooting.md
open-claw-office/.env.example   -> openclaw-command-center/.env.example
```

这些文件建议“从当前仓库内容提炼后新建”：

```text
openclaw-command-center/install.ps1
openclaw-command-center/LICENSE
openclaw-command-center/CHANGELOG.md
openclaw-command-center/examples/docker-compose.override.yml
openclaw-command-center/examples/openclaw.json.patch.json
```

## Migration Checklist

真正迁移时，你只需要按这个顺序做：

1. 新建公开仓库 `openclaw-command-center`
2. 复制 `custom-ui/`
3. 复制 3 个 helper 脚本
4. 写新的 `README.md`
5. 新建 `examples/`
6. 新建 `install.ps1`
7. 确认是否允许再分发上游 runtime 资产
8. 打 `v0.1.0`

## Minimal Public V0.1.0

如果你想最快发出去，最小可发布集合建议是：

- `README.md`
- `LICENSE`
- `.env.example`
- `custom-ui/`
- `scripts/command-center-helper.mjs`
- `scripts/ensure-command-center-helper.ps1`
- `scripts/install-command-center-helper-autostart.ps1`
- `examples/docker-compose.override.yml`
- `examples/openclaw.json.patch.json`

## Final Answer: What You Need To Create

最后落到你的实际动作，只有两件事：

### 1. 新建仓库

建议仓库名：

- `openclaw-command-center`

### 2. 迁移这些内容

必须迁移：

- `custom-ui/`
- `scripts/command-center-helper.mjs`
- `scripts/ensure-command-center-helper.ps1`
- `scripts/install-command-center-helper-autostart.ps1`

需要重写后迁移：

- `README.md`
- `.env.example`
- 安装脚本
- examples

不要迁移：

- `data/`
- `.env`
- 当前完整 `docker-compose.yml`
- 任何本机运行态文件
